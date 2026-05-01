"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Card, Rating } from "@/lib/types";
import { Flashcard } from "@/components/Card";
import { RatingButtons } from "@/components/RatingButtons";
import { pickDue, rate, getStats, reset } from "@/lib/sr";

export function StudyClient({ cards }: { cards: Card[] }) {
  const cardById = useMemo(
    () => Object.fromEntries(cards.map((c) => [c.id, c])),
    [cards]
  );
  const allIds = useMemo(() => cards.map((c) => c.id), [cards]);

  const [queue, setQueue] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [sessionDone, setSessionDone] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const due = pickDue(allIds);
    setQueue(due.length ? due : [...allIds]);
    setStats(getStats(allIds));
  }, [allIds]);

  if (!hydrated || !stats) {
    return (
      <div className="text-center text-zinc-400 py-20">Loading session…</div>
    );
  }

  const currentId = queue[0];
  const current = currentId ? cardById[currentId] : null;

  function handleRate(r: Rating) {
    if (!current) return;
    rate(current.id, r);
    setSessionDone((n) => n + 1);
    setShowAnswer(false);
    setQueue((q) => {
      const next = q.slice(1);
      if (r === "again") next.push(current.id);
      return next;
    });
    setStats(getStats(allIds));
  }

  if (!current) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-3xl font-bold">All done for now 🎉</h1>
        <p className="text-zinc-400">
          You finished {sessionDone} card{sessionDone === 1 ? "" : "s"} this session.
        </p>
        <p className="text-zinc-500 text-sm">
          Come back later — cards will reappear when due.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold"
          >
            Home
          </Link>
          <button
            onClick={() => {
              if (confirm("Reset all study progress? This cannot be undone.")) {
                reset();
                window.location.reload();
              }
            }}
            className="px-5 py-2.5 rounded-xl border border-rose-500/50 text-rose-300 hover:bg-rose-500/10"
          >
            Reset progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <div>
          <span className="font-mono">{sessionDone}</span> done ·{" "}
          <span className="font-mono">{queue.length}</span> in queue
        </div>
        <div className="flex gap-3">
          <span>Due: <span className="text-rose-300 font-mono">{stats.due}</span></span>
          <span>Learned: <span className="text-emerald-300 font-mono">{stats.learned}</span></span>
        </div>
      </header>

      <Flashcard
        card={current}
        showAnswer={showAnswer}
        onFlip={() => setShowAnswer((s) => !s)}
      />

      {showAnswer && <RatingButtons onRate={handleRate} />}

      {!showAnswer && (
        <p className="text-center text-xs text-zinc-500">
          Read the question, plan your essay, then reveal the mark scheme.
        </p>
      )}
    </div>
  );
}
