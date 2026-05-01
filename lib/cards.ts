import rawCards from "./cards.json";
import type { Card } from "./types";
import { tagTopics } from "./topics";

const cards: Card[] = (rawCards as Card[]).map((c) => ({
  ...c,
  topics: tagTopics(c.questionText + " " + c.markscheme),
}));

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
