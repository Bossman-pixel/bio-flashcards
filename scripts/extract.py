#!/usr/bin/env python3
"""Extract Section B essays + MS verbatim from CIE 9700 P4 PDFs."""
from __future__ import annotations
"""

Output: data/extracted/cards.json
Card schema:
  {
    "id": "9700_s19_41_q9",
    "paperCode": "9700/41/M/J/19",
    "year": 2019, "session": "s19", "variant": "41",
    "sessionLabel": "May/June 2019", "variantLabel": "Paper 41",
    "questionNumber": 9,
    "questionText": "...",
    "parts": [{ "label": "(a)", "text": "...", "marks": 7 }, ...],
    "totalMarks": 15,
    "markscheme": "...",      # raw verbatim block from MS PDF
    "markschemeParts": [{ "label": "(a)", "text": "...", "marks": 7 }, ...],
    "sourceQp": "9700_s19_qp_41.pdf",
    "sourceMs": "9700_s19_ms_41.pdf"
  }
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "extracted"
OUT.mkdir(parents=True, exist_ok=True)

CODES = [
    "m19_42", "s19_41", "s19_42", "s19_43", "w19_41", "w19_42",
    "m20_42", "s20_41", "s20_42", "s20_43", "w20_41", "w20_42",
    "m21_42", "s21_41", "s21_42", "s21_43", "w21_41", "w21_42",
]

SESSION_LABEL = {"m": "February/March", "s": "May/June", "w": "October/November"}
SESSION_CODE_LETTER = {"m": "F/M", "s": "M/J", "w": "O/N"}


def pdftotext(path: Path) -> str:
    return subprocess.check_output(
        ["pdftotext", "-layout", str(path), "-"], text=True
    )


def normalize_ws(s: str) -> str:
    """Collapse runs of spaces, trim trailing spaces per line, drop ........ filler."""
    lines = []
    for ln in s.splitlines():
        if re.match(r"^\.{30,}", ln.strip()):
            continue
        ln = re.sub(r"[ \t]+", " ", ln).rstrip()
        lines.append(ln)
    out = "\n".join(lines)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


def strip_page_chrome(text: str) -> str:
    """Remove © UCLES headers/footers, [Turn over markers, page numbers."""
    patterns = [
        r"©\s*UCLES\s*\d{4}.*",
        r"\[Turn over\]?",
        r"^\s*\d+\s*$",
        r"Permission to reproduce items.*",
        r"To avoid the issue of disclosure.*",
        r"Cambridge Assessment International.*",
        r"reasonable effort has been made.*",
        r"publisher will be pleased.*",
        r"at www\.cambridgeinternational\.org.*",
        r"Cambridge Local Examinations Syndicate.*",
        r"^\s*PUBLISHED\s*$",
        r"Paper \d+ A Level Structured Questions\s+(May/June|October/November|February/March)\s+\d{4}",
        r"9700/\d{2}\s+Cambridge International AS/A Level.*",
    ]
    for p in patterns:
        text = re.sub(p, "", text, flags=re.MULTILINE)
    return text


def extract_section_b_qp(qp_text: str) -> dict | None:
    """From QP text, grab Section B essay questions verbatim with parts + marks."""
    # find Section B start — use LAST match because cover page also says "Section B"
    matches = list(re.finditer(r"Section\s+B\s*\n+\s*Answer\s+one\s+question\.?", qp_text))
    if not matches:
        return None
    m = matches[-1]
    body = qp_text[m.end():]
    # questions: capture each question block until [Total: 15] (inclusive)
    # pattern: blank line, then optional whitespace, then digits, then content up through [Total: 15]
    # use non-greedy block capture
    q_pattern = re.compile(
        r"(?P<num>\d{1,2})\s+\(a\)\s+(?P<arest>.*?)\[Total:\s*15\]",
        flags=re.DOTALL,
    )
    questions = []
    for qm in q_pattern.finditer(body):
        qnum = int(qm.group("num"))
        block_full = qm.group(0)  # whole "9 (a) ... [Total: 15]"
        # parse parts
        block_clean = strip_page_chrome(block_full)
        block_clean = normalize_ws(block_clean)

        # split into parts using regex on (a), (b), (c) markers preceded by qnum or just label
        # find "(a)" "(b)" etc and their following text up to next part or [Total:]
        parts_pattern = re.compile(
            r"\((?P<lbl>[a-z])\)\s+(?P<txt>.*?)(?=\([a-z]\)\s|\[Total:\s*15\])",
            flags=re.DOTALL,
        )
        parts = []
        for pm in parts_pattern.finditer(block_clean):
            label = f"({pm.group('lbl')})"
            ptxt = pm.group("txt").strip()
            # strip trailing marks marker like "[7]"
            mk = re.search(r"\[(\d+)\]\s*$", ptxt)
            marks = int(mk.group(1)) if mk else None
            ptxt_clean = re.sub(r"\[\d+\]\s*$", "", ptxt).strip()
            ptxt_clean = re.sub(r"\s+", " ", ptxt_clean)
            parts.append({"label": label, "text": ptxt_clean, "marks": marks})

        # build full question text
        full_text = " ".join(
            f"{p['label']} {p['text']} [{p['marks']}]" if p["marks"] else f"{p['label']} {p['text']}"
            for p in parts
        )

        questions.append({
            "questionNumber": qnum,
            "parts": parts,
            "questionText": full_text,
            "totalMarks": 15,
            "_rawBlock": block_full.strip(),
        })

    return {"questions": questions} if questions else None


def extract_section_b_ms(ms_text: str, q_numbers: list[int]) -> dict:
    """For each question number, grab MS text for (a) and (b)."""
    result = {}
    for qnum in q_numbers:
        parts_collected = []
        # MS uses pattern like "9(a)" or "9(a)(i)"; tolerant match
        # find each "<qnum>(<letter>)<optional roman>" header and grab until next question header or end
        # we want full (a) block and full (b) block
        for letter in ("a", "b"):
            # match the header on its own (start of line or after whitespace)
            # then capture until we hit the next part header (Nletter or N+1(a)) or "Question " line or end
            header = rf"\b{qnum}\({letter}\)"
            mm = re.search(header, ms_text)
            if not mm:
                continue
            start = mm.start()
            # find next stop: another part for any qnum+(letter) where (qnum,letter) != current,
            # or next "Question" header row, or end
            tail = ms_text[mm.end():]
            stop_pat = re.compile(
                rf"(\b\d{{1,2}}\([a-z]\)|Question\s+Answer\s+Marks|©\s*UCLES)",
                flags=re.MULTILINE,
            )
            sm = stop_pat.search(tail)
            end = mm.end() + (sm.start() if sm else len(tail))
            block = ms_text[start:end]
            block_clean = strip_page_chrome(block)
            block_clean = normalize_ws(block_clean)

            # extract marks if present (single trailing integer like " 7" or " 8" on its own
            # often it's a column on the right). Look for " <num>$" or "                <num>$" near top
            # try first: look at first 200 chars for "any X from" + a number on next column
            # simpler: scan for stand-alone integers at end of lines in first few lines
            marks = None
            head_lines = block_clean.split("\n")[:5]
            for hl in head_lines:
                # marks column appears as trailing integer after wide whitespace
                m_mk = re.search(r"\s{2,}(\d{1,2})\s*$", hl)
                if m_mk:
                    cand = int(m_mk.group(1))
                    if 1 <= cand <= 15:
                        marks = cand
                        break

            parts_collected.append({
                "label": f"({letter})",
                "text": block_clean,
                "marks": marks,
            })

        if parts_collected:
            full = "\n\n".join(f"{p['label']}\n{p['text']}" for p in parts_collected)
            result[qnum] = {"parts": parts_collected, "fullText": full}
    return result


def parse_code(code: str):
    """e.g. 's19_41' -> dict."""
    sess, var = code.split("_")
    letter = sess[0]
    yr2 = sess[1:]
    year = 2000 + int(yr2)
    return {
        "session": sess,
        "variant": var,
        "year": year,
        "sessionLetter": letter,
        "sessionLabel": SESSION_LABEL[letter] + f" {year}",
        "variantLabel": f"Paper {var}",
        "paperCode": f"9700/{var}/{SESSION_CODE_LETTER[letter]}/{yr2}",
    }


def main():
    cards = []
    skipped = []
    for code in CODES:
        info = parse_code(code)
        qp_path = RAW / f"9700_{info['session']}_qp_{info['variant']}.pdf"
        ms_path = RAW / f"9700_{info['session']}_ms_{info['variant']}.pdf"
        if not qp_path.exists() or not ms_path.exists():
            skipped.append((code, "missing PDF"))
            continue
        try:
            qp_text = pdftotext(qp_path)
            ms_text = pdftotext(ms_path)
        except subprocess.CalledProcessError as e:
            skipped.append((code, f"pdftotext failed: {e}"))
            continue

        qp_data = extract_section_b_qp(qp_text)
        if not qp_data or not qp_data["questions"]:
            skipped.append((code, "no Section B questions found"))
            continue

        q_numbers = [q["questionNumber"] for q in qp_data["questions"]]
        ms_data = extract_section_b_ms(ms_text, q_numbers)

        for q in qp_data["questions"]:
            qnum = q["questionNumber"]
            ms_q = ms_data.get(qnum, {"parts": [], "fullText": "(MS extraction failed — see source PDF)"})
            # sync marks from MS into question parts if QP missed them
            for qp_part, ms_part in zip(q["parts"], ms_q.get("parts", [])):
                if qp_part.get("marks") is None and ms_part.get("marks") is not None:
                    qp_part["marks"] = ms_part["marks"]

            card = {
                "id": f"9700_{info['session']}_{info['variant']}_q{qnum}",
                "paperCode": info["paperCode"],
                "year": info["year"],
                "session": info["session"],
                "variant": info["variant"],
                "sessionLabel": info["sessionLabel"],
                "variantLabel": info["variantLabel"],
                "questionNumber": qnum,
                "questionText": q["questionText"],
                "parts": q["parts"],
                "totalMarks": 15,
                "markscheme": ms_q["fullText"],
                "markschemeParts": ms_q.get("parts", []),
                "sourceQp": qp_path.name,
                "sourceMs": ms_path.name,
                "sourceQpUrl": f"https://papers.xtremepape.rs/CAIE/AS%20and%20A%20Level/Biology%20(9700)/{qp_path.name}",
                "sourceMsUrl": f"https://papers.xtremepape.rs/CAIE/AS%20and%20A%20Level/Biology%20(9700)/{ms_path.name}",
            }
            cards.append(card)

    out_file = OUT / "cards.json"
    out_file.write_text(json.dumps(cards, indent=2, ensure_ascii=False))
    print(f"Extracted {len(cards)} cards from {len(CODES) - len(skipped)} papers.")
    if skipped:
        print("Skipped:")
        for c, r in skipped:
            print(f"  {c}: {r}")
    print(f"Wrote {out_file}")


if __name__ == "__main__":
    main()
