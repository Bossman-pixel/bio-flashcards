import Link from "next/link";
import { getPapers, getAllCards } from "@/lib/cards";
import { Stats } from "@/components/Stats";

export default function HomePage() {
  const papers = getPapers();
  const allCards = getAllCards();
  const allIds = allCards.map((c) => c.id);

  const grouped = papers.reduce<Record<number, typeof papers>>((acc, p) => {
    (acc[p.year] ??= []).push(p);
    return acc;
  }, {});

  const sessionLetter: Record<string, string> = {
    m: "Feb/Mar",
    s: "May/Jun",
    w: "Oct/Nov",
  };

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Bio 9700 <span className="text-emerald-400">Section B</span> Flashcards
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          {allCards.length} essay questions from Paper 4 · 2019–2021 · all sessions ·
          verbatim mark schemes · spaced repetition built in.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/study"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold"
          >
            Start studying →
          </Link>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-emerald-400 text-zinc-200"
          >
            Browse all cards
          </Link>
        </div>
        <Stats ids={allIds} />
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">By paper</h2>
        {Object.entries(grouped)
          .sort(([a], [b]) => +a - +b)
          .map(([year, list]) => (
            <div key={year} className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-emerald-400 font-mono">
                {year}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {list.map((p) => (
                  <Link
                    key={p.code}
                    href={`/papers/${p.code}`}
                    className="rounded-xl border border-zinc-800 hover:border-emerald-400 hover:bg-zinc-900/40 p-3 sm:p-4 transition group"
                  >
                    <div className="text-[11px] font-mono text-emerald-300/70">
                      9700/{p.variant}
                    </div>
                    <div className="font-semibold mt-1 text-sm sm:text-base">
                      {sessionLetter[p.session[0]]} {p.year}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {p.cards.length} essay{p.cards.length === 1 ? "" : "s"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
