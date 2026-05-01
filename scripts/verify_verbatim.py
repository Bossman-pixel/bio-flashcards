#!/usr/bin/env python3
"""Programmatic verbatim check.

For every card in cards.json:
  - Re-run pdftotext on source QP and MS.
  - Confirm each question part text appears verbatim in the QP.
  - Confirm each MS marking-point line appears verbatim in the MS.

Strategy:
  - Whitespace-normalize both haystack (PDF) and needle (card) before substring check.
  - For MS: split MS text into individual semicolon-terminated marking points and verify each appears in the source MS.
  - Report any mismatch with file + card + missing fragment.

Exit non-zero if any mismatch.
"""
from __future__ import annotations
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
CARDS = ROOT / "data" / "extracted" / "cards.json"


def pdftotext(path: Path) -> str:
    return subprocess.check_output(
        ["pdftotext", "-layout", str(path), "-"], text=True
    )


def normalize(s: str) -> str:
    """Aggressive whitespace normalize for substring matching."""
    s = s.replace(" ", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def main() -> int:
    cards = json.loads(CARDS.read_text())
    qp_cache: dict[str, str] = {}
    ms_cache: dict[str, str] = {}

    failures: list[tuple[str, str, str]] = []  # (card_id, kind, fragment)
    checked = 0

    for c in cards:
        qp_name = c["sourceQp"]
        ms_name = c["sourceMs"]
        if qp_name not in qp_cache:
            qp_cache[qp_name] = normalize(pdftotext(RAW / qp_name))
        if ms_name not in ms_cache:
            ms_cache[ms_name] = normalize(pdftotext(RAW / ms_name))

        qp_norm = qp_cache[qp_name]
        ms_norm = ms_cache[ms_name]

        # 1. Each question part text must appear verbatim in QP
        for part in c["parts"]:
            needle = normalize(part["text"])
            if not needle:
                failures.append((c["id"], "qp-empty", part["label"]))
                continue
            if needle not in qp_norm:
                failures.append((c["id"], "qp-text", needle[:120]))
            checked += 1

        # 2. Each non-empty marking-scheme line must appear verbatim in MS
        for ms_part in c.get("markschemeParts", []):
            text = ms_part["text"]
            # split into lines, strip headers like "9(a) any seven from: 7"
            for line in text.splitlines():
                line = line.strip()
                if not line:
                    continue
                # skip pure header lines like "9(a) any seven from: 7" (these come from MS itself so they should still match)
                # but also skip empty/bullet-only artifacts like "1" alone
                if re.fullmatch(r"\d+", line):
                    continue
                # strip leading bullet number like "1 " "2 " etc — content remains verbatim
                core = re.sub(r"^\d+\s+", "", line).strip()
                if len(core) < 4:
                    continue
                # also skip helper lines like "to increase crop yield in glass house:"
                # those are verbatim — keep them in
                needle = normalize(core)
                # tolerance: source PDF may have slightly different spacing — already normalized
                if needle not in ms_norm:
                    failures.append((c["id"], "ms-line", needle[:160]))
                checked += 1

    print(f"Checked {checked} fragments across {len(cards)} cards.")
    if failures:
        print(f"\n❌ {len(failures)} verbatim mismatches:")
        for cid, kind, frag in failures[:50]:
            print(f"  [{kind}] {cid}: {frag!r}")
        if len(failures) > 50:
            print(f"  … and {len(failures) - 50} more")
        return 1
    print("\n✅ All fragments verbatim against source PDFs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
