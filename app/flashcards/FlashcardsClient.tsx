"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Card, Rating } from "@/lib/types";
import { rate } from "@/lib/sr";

type DeckMode = "all" | "year" | "session" | "topic" | "paper";

export function FlashcardsClient({ cards }: { cards: Card[] }) {
  const [deckMode, setDeckMode] = useState<DeckMode>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [shuffled, setShuffled] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState<Record<string, Rating>>({});
  const touchStartX = useRef<number | null>(null);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => c.topics?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [cards]);

  const allYears = useMemo(() => [...new Set(cards.map((c) => c.year))].sort(), [cards]);
  const allPapers = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((c) => map.set(`${c.session}_${c.variant}`, `${c.sessionLabel} · ${c.variantLabel}`));
    return [...map.entries()];
  }, [cards]);

  // Build active deck based on filter
  const deck = useMemo(() => {
    let list = cards;
    if (deckMode === "year" && filterValue) list = list.filter((c) => String(c.year) === filterValue);
    if (deckMode === "session" && filterValue) list = list.filter((c) => c.session[0] === filterValue);
    if (deckMode === "topic" && filterValue) list = list.filter((c) => c.topics?.includes(filterValue));
    if (deckMode === "paper" && filterValue) list = list.filter((c) => `${c.session}_${c.variant}` === filterValue);
    return list;
  }, [cards, deckMode, filterValue]);

  // Reset order when deck changes
  useEffect(() => {
    const ids = deck.map((_, i) => i);
    setOrder(shuffled ? shuffle(ids) : ids);
    setIdx(0);
    setFlipped(false);
  }, [deck, shuffled]);

  const total = deck.length;
  const card = order.length > 0 && deck[order[idx]] ? deck[order[idx]] : deck[0];

  const next = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i + 1) % Math.max(1, total)), 100);
  }, [total]);
  const prev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i - 1 + Math.max(1, total)) % Math.max(1, total)), 100);
  }, [total]);
  const flip = useCallback(() => setFlipped((f) => !f), []);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "1" && card) {
        handleRate("again");
      } else if (e.key === "2" && card) {
        handleRate("hard");
      } else if (e.key === "3" && card) {
        handleRate("good");
      } else if (e.key === "4" && card) {
        handleRate("easy");
      } else if (e.key === "s") {
        setShuffled((s) => !s);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flip, next, prev, card]);

  function handleRate(r: Rating) {
    if (!card) return;
    rate(card.id, r, "flashcards");
    setRated((m) => ({ ...m, [card.id]: r }));
    setTimeout(next, 200);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  if (!card || deck.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-3xl font-bold text-primary">No cards in this deck</h1>
        <p className="text-muted">Try a different filter or shuffle.</p>
        <button
          onClick={() => {
            setDeckMode("all");
            setFilterValue("");
          }}
          className="px-4 py-2 rounded-xl bg-accent text-[var(--color-accent-fg)] font-semibold"
        >
          Show all cards
        </button>
      </div>
    );
  }

  const progress = ((idx + 1) / total) * 100;
  const ratedCount = Object.keys(rated).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Flashcards</h1>
          <p className="text-sm text-muted">Click card to flip · ←→ navigate · 1-4 rate · S shuffle</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter
            mode={deckMode}
            value={filterValue}
            onModeChange={setDeckMode}
            onValueChange={setFilterValue}
            years={allYears.map(String)}
            papers={allPapers}
            topics={allTopics}
          />
          <button
            onClick={() => setShuffled((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
              shuffled
                ? "bg-accent text-[var(--color-accent-fg)] border-transparent"
                : "border-token hover:border-accent text-secondary"
            }`}
            title="Shuffle (S)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5M4 20l16-16M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Shuffle
          </button>
        </div>
      </header>

      {/* Progress + counter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted font-mono">
          <span>{idx + 1} / {total}</span>
          <span>{ratedCount} reviewed</span>
        </div>
        <div className="h-1 rounded-full bg-elev overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "var(--color-accent)" }}
          />
        </div>
      </div>

      {/* The card */}
      <div
        className="perspective-1000 mx-auto w-full max-w-3xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={flip}
          aria-label="Flip card"
          className={`relative w-full preserve-3d transition-transform duration-700 cursor-pointer ${flipped ? "rotate-y-180" : ""}`}
          style={{ minHeight: "min(70vh, 540px)" }}
        >
          {/* Front (Question) */}
          <div className="backface-hidden absolute inset-0 rounded-3xl glass shadow-elev p-6 sm:p-10 flex flex-col">
            <CardHeader card={card} side="question" />
            <div className="flex-1 flex items-center">
              <div className="space-y-5 text-left w-full">
                {card.parts.map((p, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <span className="font-mono font-bold text-accent shrink-0 text-lg sm:text-xl">{p.label}</span>
                    <div className="flex-1 text-base sm:text-xl leading-relaxed text-primary">
                      {p.text}
                      {p.marks != null && (
                        <span className="ml-2 font-mono text-muted text-sm">[{p.marks}]</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 text-xs text-dim text-center flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.66 11.5l-5.66-5.66a2 2 0 0 0-2.83 0l-9 9a2 2 0 0 0 0 2.83L9.83 23.16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 9l4 4M3 21h18" strokeLinecap="round" />
              </svg>
              Tap to flip · plan your essay first
            </div>
          </div>

          {/* Back (Mark scheme) */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-3xl glass shadow-elev p-6 sm:p-10 overflow-y-auto text-left">
            <CardHeader card={card} side="markscheme" />
            <div className="space-y-5 mt-4">
              {card.markschemeParts.length > 0 ? (
                card.markschemeParts.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-mono font-bold text-accent">{p.label}</span>
                      {p.marks != null && (
                        <span className="font-mono text-muted text-xs">[{p.marks} marks]</span>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-secondary bg-elev/50 border border-subtle rounded-xl p-3 sm:p-4 overflow-x-auto">
                      {p.text}
                    </pre>
                  </div>
                ))
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-secondary bg-elev/50 border border-subtle rounded-xl p-4">
                  {card.markscheme}
                </pre>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
        <button
          onClick={prev}
          aria-label="Previous"
          className="flex items-center justify-center w-12 h-12 rounded-full glass border border-token shadow-card hover:border-accent transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col sm:flex-row gap-2 mx-2">
          <RateBtn label="Again" sub="<10m" cls="bg-rose-500 text-white" onClick={() => handleRate("again")} active={rated[card.id] === "again"} />
          <RateBtn label="Hard" sub="3d" cls="bg-orange-400 text-zinc-900" onClick={() => handleRate("hard")} active={rated[card.id] === "hard"} />
          <RateBtn label="Good" sub="6d" cls="text-[var(--color-accent-fg)]" style={{ backgroundColor: "var(--color-accent)" }} onClick={() => handleRate("good")} active={rated[card.id] === "good"} />
          <RateBtn label="Easy" sub="14d" cls="bg-sky-400 text-zinc-900" onClick={() => handleRate("easy")} active={rated[card.id] === "easy"} />
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="flex items-center justify-center w-12 h-12 rounded-full glass border border-token shadow-card hover:border-accent transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Topics + source */}
      <div className="flex flex-wrap gap-2 max-w-3xl mx-auto pt-2 text-xs">
        {card.topics?.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-elev border border-subtle text-secondary">
            {t}
          </span>
        ))}
        <a href={card.sourceQpUrl} target="_blank" rel="noreferrer" className="ml-auto underline text-accent hover:opacity-80">
          QP ↗
        </a>
        <a href={card.sourceMsUrl} target="_blank" rel="noreferrer" className="underline text-accent hover:opacity-80">
          MS ↗
        </a>
      </div>

      <p className="text-center text-xs text-dim pt-4">
        <Link href="/study" className="underline hover:text-accent">Smart study (SR queue)</Link>
        {" · "}
        <Link href="/dashboard" className="underline hover:text-accent">Dashboard</Link>
      </p>
    </div>
  );
}

function CardHeader({ card, side }: { card: Card; side: "question" | "markscheme" }) {
  return (
    <div className="flex items-center justify-between mb-4 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-full font-mono text-accent border border-token"
          style={{ backgroundColor: "var(--color-accent-dim)" }}
        >
          {card.paperCode}
        </span>
        <span className="text-muted">{card.sessionLabel} · Q{card.questionNumber}{card.parts?.[0]?.label ?? ""}</span>
      </div>
      <span className="font-mono text-muted">[{card.totalMarks} marks]</span>
      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-dim">
        {side === "question" ? "Question" : "Mark Scheme"}
      </span>
    </div>
  );
}

function RateBtn({
  label,
  sub,
  cls,
  style,
  onClick,
  active,
}: {
  label: string;
  sub: string;
  cls: string;
  style?: React.CSSProperties;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-sm transition-all ${cls} ${
        active ? "ring-4 ring-offset-2 ring-offset-[var(--color-bg)]" : "hover:scale-[1.02]"
      }`}
      style={{ ...style, ...(active ? { boxShadow: "0 0 0 4px var(--color-accent-dim)" } : {}) }}
    >
      <div>{label}</div>
      <div className="text-[10px] opacity-70 font-mono">{sub}</div>
    </button>
  );
}

function Filter({
  mode,
  value,
  onModeChange,
  onValueChange,
  years,
  papers,
  topics,
}: {
  mode: DeckMode;
  value: string;
  onModeChange: (m: DeckMode) => void;
  onValueChange: (v: string) => void;
  years: string[];
  papers: [string, string][];
  topics: string[];
}) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={mode}
        onChange={(e) => {
          onModeChange(e.target.value as DeckMode);
          onValueChange("");
        }}
        className="px-3 py-2 rounded-lg bg-surface border border-token text-sm text-primary"
      >
        <option value="all">All cards</option>
        <option value="year">By year</option>
        <option value="session">By session</option>
        <option value="paper">By paper</option>
        <option value="topic">By topic</option>
      </select>
      {mode !== "all" && (
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-token text-sm text-primary max-w-[180px]"
        >
          <option value="">Choose…</option>
          {mode === "year" && years.map((y) => <option key={y} value={y}>{y}</option>)}
          {mode === "session" && (
            <>
              <option value="m">Feb/Mar</option>
              <option value="s">May/Jun</option>
              <option value="w">Oct/Nov</option>
            </>
          )}
          {mode === "paper" && papers.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          {mode === "topic" && topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
