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
    <div className="space-y-12">
      <header className="space-y-4 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elev border border-subtle text-xs font-medium text-accent">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 0 8px var(--color-accent)" }} />
          Verbatim from official CIE PDFs · 1098 fragments verified
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary leading-[1.05]">
          Bio 9700{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-accent), var(--color-cobalt))" }}
          >
            Section B
          </span>
          <br />
          Flashcards.
        </h1>
        <p className="text-secondary max-w-2xl text-base sm:text-lg leading-relaxed">
          {allCards.length} essay questions from Paper 4 · 2019–2021 · all sessions ·
          verbatim mark schemes · spaced repetition built in.
        </p>
        <div className="flex flex-wrap gap-3 pt-3">
          <Link
            href="/flashcards"
            className="px-6 py-3 rounded-xl font-semibold shadow-card hover:shadow-elev transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-fg)" }}
          >
            Start with flashcards →
          </Link>
          <Link
            href="/study"
            className="px-6 py-3 rounded-xl border border-token hover:border-accent text-primary font-semibold transition-colors"
          >
            Smart study (SR)
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-secondary hover:text-accent transition-colors"
          >
            Track progress
          </Link>
        </div>
        <div className="pt-4">
          <Stats ids={allIds} />
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">By paper</h2>
          <Link href="/browse" className="text-xs text-muted hover:text-accent">
            Browse all →
          </Link>
        </div>
        {Object.entries(grouped)
          .sort(([a], [b]) => +a - +b)
          .map(([year, list]) => (
            <div key={year} className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.18em] text-accent font-mono">
                {year}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {list.map((p) => (
                  <Link
                    key={p.code}
                    href={`/papers/${p.code}`}
                    className="group rounded-xl border border-token glass shadow-card hover:shadow-elev hover:border-accent hover:-translate-y-0.5 p-3 sm:p-4 transition-all"
                  >
                    <div className="text-[10px] font-mono text-accent">9700/{p.variant}</div>
                    <div className="font-semibold mt-1 text-sm text-primary">
                      {sessionLetter[p.session[0]]} {p.year}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {p.cards.length} essay{p.cards.length === 1 ? "" : "s"}
                    </div>
                    <div className="mt-2 h-0.5 rounded-full bg-elev overflow-hidden">
                      <div className="h-full w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: "var(--color-accent)" }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </section>

      <section className="rounded-3xl glass border border-token p-6 sm:p-8 shadow-card">
        <h2 className="text-xl font-semibold text-primary mb-3">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <Step n={1} title="Read" body="Question front. Plan your essay mentally — what would you write for [7] and [8]?" />
          <Step n={2} title="Flip" body="Tap card or press space. Verbatim mark scheme appears with every alternative wording marked with /" />
          <Step n={3} title="Rate" body="Again / Hard / Good / Easy — algorithm schedules next review. Track progress in dashboard." />
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="space-y-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm"
        style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
      >
        {n}
      </div>
      <div className="font-semibold text-primary">{title}</div>
      <div className="text-muted">{body}</div>
    </div>
  );
}
