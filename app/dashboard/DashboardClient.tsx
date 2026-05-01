"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadAll, streak, heatmap, accuracyByTopic, progressOverTime, totalReviews, timeSpentEstimate, clearAll } from "@/lib/sessions";
import { getStats, loadAll as loadSr, reset as resetSr } from "@/lib/sr";

type SlimCard = {
  id: string;
  topics: string[];
  year: number;
  session: string;
  variant: string;
  sessionLabel: string;
  questionNumber: number;
};

export function DashboardClient({ cards, totalCards }: { cards: SlimCard[]; totalCards: number }) {
  const [hydrated, setHydrated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const cardTopicMap = useMemo(() => {
    const m = new Map<string, string[]>();
    cards.forEach((c) => m.set(c.id, c.topics));
    return m;
  }, [cards]);

  const data = useMemo(() => {
    if (!hydrated) return null;
    const evts = loadAll();
    const sr = loadSr();
    const ids = cards.map((c) => c.id);
    const stats = getStats(ids);
    const stk = streak();
    const heat = heatmap(91);
    const topicAcc = accuracyByTopic((id) => cardTopicMap.get(id) ?? []);
    const overTime = progressOverTime(30);
    const reviews = totalReviews();
    const time = timeSpentEstimate();
    const masteryByPaper: Record<string, { learned: number; total: number }> = {};
    cards.forEach((c) => {
      const key = `${c.session}_${c.variant}`;
      if (!masteryByPaper[key]) masteryByPaper[key] = { learned: 0, total: 0 };
      masteryByPaper[key].total += 1;
      if ((sr[c.id]?.reps ?? 0) >= 3) masteryByPaper[key].learned += 1;
    });
    return { evts, sr, stats, stk, heat, topicAcc, overTime, reviews, time, masteryByPaper };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cards, cardTopicMap, tick]);

  if (!data) {
    return <div className="text-center text-muted py-20">Loading dashboard…</div>;
  }

  const { stats, stk, heat, topicAcc, overTime, reviews, time, masteryByPaper } = data;
  const masteryPct = totalCards > 0 ? Math.round((stats.learned / totalCards) * 100) : 0;
  const accuracyOverall =
    reviews > 0
      ? Math.round((data.evts.filter((e) => e.rating === "good" || e.rating === "easy").length / reviews) * 100)
      : 0;
  const minutesSpent = Math.round(time / 60);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-sm text-muted">Your revision progress, all in one place.</p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all progress, ratings, and history? This cannot be undone.")) {
              resetSr();
              clearAll();
              setTick((n) => n + 1);
            }
          }}
          className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 text-xs hover:bg-rose-500/10"
        >
          Reset progress
        </button>
      </header>

      {/* Top KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Mastery" value={`${masteryPct}%`} sub={`${stats.learned}/${totalCards} cards`} accent />
        <Kpi label="Streak" value={`${stk.current}d`} sub={`Best ${stk.best}d`} />
        <Kpi label="Reviews" value={reviews.toLocaleString()} sub={`~${minutesSpent} min total`} />
        <Kpi label="Accuracy" value={`${accuracyOverall}%`} sub={`Good or Easy`} />
      </section>

      {/* Mastery breakdown */}
      <section className="rounded-2xl glass border border-token p-5 shadow-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Mastery breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Pill label="Due now" value={stats.due} color="rose" />
          <Pill label="Learning" value={stats.learning} color="orange" />
          <Pill label="Learned" value={stats.learned} color="emerald" />
          <Pill label="Untouched" value={stats.untouched} color="zinc" />
        </div>
        <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-elev">
          {totalCards > 0 && (
            <>
              <div className="bg-rose-500" style={{ width: `${(stats.due / totalCards) * 100}%` }} />
              <div className="bg-orange-400" style={{ width: `${(stats.learning / totalCards) * 100}%` }} />
              <div style={{ width: `${(stats.learned / totalCards) * 100}%`, backgroundColor: "var(--color-accent)" }} />
            </>
          )}
        </div>
      </section>

      {/* Activity calendar (heatmap) */}
      <section className="rounded-2xl glass border border-token p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Activity · last 13 weeks</h2>
          <span className="text-xs text-muted">{stk.current > 0 ? `🔥 ${stk.current}-day streak` : "No streak yet"}</span>
        </div>
        <Heatmap data={heat} />
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: heatColor(lvl) }}
            />
          ))}
          <span>More</span>
        </div>
      </section>

      {/* Reviews over time */}
      <section className="rounded-2xl glass border border-token p-5 shadow-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Reviews · last 30 days</h2>
        <ReviewsBars data={overTime} />
      </section>

      {/* Accuracy by topic */}
      <section className="rounded-2xl glass border border-token p-5 shadow-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Accuracy by topic</h2>
        {topicAcc.length === 0 ? (
          <p className="text-sm text-muted italic">Rate some cards to see topic accuracy.</p>
        ) : (
          <div className="space-y-2">
            {topicAcc.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>{t.topic}</span>
                  <span className="font-mono text-muted">
                    {Math.round(t.accuracy * 100)}% · {t.total} review{t.total === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-elev overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${t.accuracy * 100}%`,
                      backgroundColor: t.accuracy >= 0.7 ? "var(--color-accent)" : t.accuracy >= 0.4 ? "#fb923c" : "#f87171",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mastery by paper */}
      <section className="rounded-2xl glass border border-token p-5 shadow-card">
        <h2 className="text-lg font-semibold text-primary mb-4">Mastery by paper</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(masteryByPaper)
            .sort()
            .map(([code, m]) => {
              const pct = m.total > 0 ? (m.learned / m.total) * 100 : 0;
              return (
                <Link
                  key={code}
                  href={`/papers/${code}`}
                  className="rounded-xl bg-elev border border-subtle p-3 hover:border-accent transition-colors"
                >
                  <div className="text-[10px] font-mono text-accent">9700/{code.split("_")[1]}</div>
                  <div className="text-xs text-secondary">
                    {code.startsWith("m") ? "Feb/Mar" : code.startsWith("s") ? "May/Jun" : "Oct/Nov"} 20{code.slice(1, 3)}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-token/40 overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: "var(--color-accent)" }} />
                  </div>
                  <div className="text-[10px] text-muted mt-1 font-mono">
                    {m.learned}/{m.total}
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      <p className="text-center text-xs text-dim pt-4">
        <Link href="/study" className="underline hover:text-accent">Smart study</Link>
        {" · "}
        <Link href="/flashcards" className="underline hover:text-accent">Flashcards</Link>
      </p>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl glass border border-token p-4 sm:p-5 shadow-card relative overflow-hidden">
      {accent && (
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(200px 100px at 100% 0%, var(--color-accent-dim), transparent)",
        }} />
      )}
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className={`text-3xl sm:text-4xl font-bold mt-2 font-mono ${accent ? "text-accent" : "text-primary"}`}>
        {value}
      </div>
      <div className="text-[11px] text-dim mt-1">{sub}</div>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    rose: "text-rose-400 border-rose-500/30",
    orange: "text-orange-400 border-orange-500/30",
    emerald: "text-emerald-300 border-emerald-500/30",
    zinc: "text-secondary border-token",
  };
  return (
    <div className={`rounded-xl border ${colorMap[color]} bg-elev/50 p-3`}>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted mt-1">{label}</div>
    </div>
  );
}

function Heatmap({ data }: { data: { day: string; count: number }[] }) {
  // Group into 13 weeks of 7 days
  const weeks: { day: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex gap-1 overflow-x-auto">
      {weeks.map((wk, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {wk.map((d) => {
            const lvl = d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4));
            return (
              <div
                key={d.day}
                title={`${d.day}: ${d.count} review${d.count === 1 ? "" : "s"}`}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: heatColor(lvl) }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function heatColor(lvl: number): string {
  const intensities = [0.06, 0.25, 0.5, 0.75, 1.0];
  if (lvl === 0) return "var(--color-border-subtle)";
  return `color-mix(in srgb, var(--color-accent) ${intensities[lvl] * 100}%, transparent)`;
}

function ReviewsBars({ data }: { data: { day: string; reviews: number; correct: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.reviews));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => {
        const h = (d.reviews / max) * 100;
        const correctH = (d.correct / max) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col-reverse" title={`${d.day}: ${d.reviews} reviews · ${d.correct} correct`}>
            <div
              className="rounded-t-sm"
              style={{ height: `${h}%`, backgroundColor: "var(--color-border)" }}
            >
              <div
                className="rounded-t-sm"
                style={{
                  height: `${(correctH / Math.max(0.01, h)) * 100}%`,
                  backgroundColor: "var(--color-accent)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
