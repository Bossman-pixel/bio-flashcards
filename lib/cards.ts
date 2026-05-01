import rawCards from "./cards.json";
import type { Card } from "./types";
import { tagTopics } from "./topics";

/**
 * Split each Section B essay (which has independent (a) and (b) parts on
 * different sub-topics) into one flashcard per part. Cambridge candidates
 * answer the whole essay but the two parts are unrelated, so for revision
 * each part is its own "card" — this matches how Anki / Quizlet decks work.
 *
 * id convention: 9700_s19_41_q9a, 9700_s19_41_q9b
 */
const cards: Card[] = (rawCards as Card[]).flatMap((c) => {
  // Pair question parts with mark-scheme parts by label (e.g. "(a)").
  const msByLabel = new Map(
    (c.markschemeParts ?? []).map((p) => [p.label, p]),
  );

  if (!c.parts || c.parts.length === 0) {
    return [
      {
        ...c,
        topics: tagTopics(c.questionText + " " + c.markscheme),
      },
    ];
  }

  return c.parts.map((part) => {
    const labelLetter = part.label.replace(/[()]/g, ""); // "(a)" -> "a"
    const msPart = msByLabel.get(part.label);
    const partMs = msPart?.text ?? "";
    const partMarks = part.marks ?? msPart?.marks ?? null;

    const questionText = `${part.label} ${part.text}${partMarks != null ? ` [${partMarks}]` : ""}`;
    const markscheme = msPart
      ? `${msPart.label}\n${msPart.text}`
      : "(Mark scheme for this part not extracted — see source PDF.)";

    return {
      ...c,
      id: `${c.id}${labelLetter}`,
      // Override the question fields to be just this part.
      questionText,
      parts: [part],
      totalMarks: partMarks ?? c.totalMarks,
      markscheme,
      markschemeParts: msPart ? [msPart] : [],
      // Re-tag topics from this part's text only — keeps topics tight to the
      // sub-question rather than the whole essay.
      topics: tagTopics(questionText + " " + markscheme),
    } as Card;
  });
});

export function getAllCards(): Card[] {
  return cards;
}

export function getCard(id: string): Card | undefined {
  return cards.find((c) => c.id === id);
}

export function getPapers() {
  const map = new Map<
    string,
    { code: string; year: number; session: string; variant: string; sessionLabel: string; variantLabel: string; cards: Card[] }
  >();
  for (const c of cards) {
    const key = `${c.session}_${c.variant}`;
    if (!map.has(key)) {
      map.set(key, {
        code: key,
        year: c.year,
        session: c.session,
        variant: c.variant,
        sessionLabel: c.sessionLabel,
        variantLabel: c.variantLabel,
        cards: [],
      });
    }
    map.get(key)!.cards.push(c);
  }
  return [...map.values()].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const order: Record<string, number> = { m: 0, s: 1, w: 2 };
    const sa = order[a.session[0]] ?? 9;
    const sb = order[b.session[0]] ?? 9;
    if (sa !== sb) return sa - sb;
    return a.variant.localeCompare(b.variant);
  });
}

export function getCardsByPaper(code: string): Card[] {
  return cards.filter((c) => `${c.session}_${c.variant}` === code);
}

export function getAllTopics(): string[] {
  const set = new Set<string>();
  for (const c of cards) {
    for (const t of c.topics ?? []) set.add(t);
  }
  return [...set].sort();
}
