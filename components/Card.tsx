"use client";
import { useState } from "react";
import type { Card } from "@/lib/types";

export function Flashcard({
  card,
  showAnswer,
  onFlip,
}: {
  card: Card;
  showAnswer: boolean;
  onFlip?: () => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-3xl glass border border-token shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full font-mono text-accent border border-token"
              style={{ backgroundColor: "var(--color-accent-dim)" }}
            >
              {card.paperCode}
            </span>
            <span className="text-muted">{card.sessionLabel}</span>
            <span className="text-dim">·</span>
            <span className="text-muted">Q{card.questionNumber}{card.parts?.[0]?.label ?? ""}</span>
          </div>
          <span className="font-mono text-muted">[{card.totalMarks}]</span>
        </div>

        {!showAnswer ? <QuestionView card={card} /> : <MarkschemeView card={card} />}

        {onFlip && (
          <button
            onClick={onFlip}
            className="mt-6 w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-fg)" }}
          >
            {showAnswer ? "Hide answer" : "Show mark scheme"}
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          {card.topics?.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-elev border border-subtle text-secondary">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 text-xs flex flex-wrap gap-x-4 gap-y-1">
          <a href={card.sourceQpUrl} target="_blank" rel="noreferrer" className="underline text-accent hover:opacity-80">
            Original QP PDF ↗
          </a>
          <a href={card.sourceMsUrl} target="_blank" rel="noreferrer" className="underline text-accent hover:opacity-80">
            Original MS PDF ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function QuestionView({ card }: { card: Card }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Question</h2>
      <div className="space-y-4 text-base sm:text-lg leading-relaxed text-primary">
        {card.parts.map((p, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="font-mono font-bold text-accent shrink-0">{p.label}</span>
            <div className="flex-1">
              <span>{p.text}</span>
              {p.marks != null && <span className="ml-2 font-mono text-muted text-sm">[{p.marks}]</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarkschemeView({ card }: { card: Card }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Mark scheme</h2>
      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-primary">
        {card.markschemeParts.length > 0 ? (
          card.markschemeParts.map((p, idx) => (
            <div key={idx}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono font-bold text-accent">{p.label}</span>
                {p.marks != null && <span className="font-mono text-muted text-xs">[{p.marks} marks]</span>}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-secondary border border-subtle rounded-xl p-3 overflow-x-auto" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-elevated) 70%, transparent)" }}>
                {p.text}
              </pre>
            </div>
          ))
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-secondary border border-subtle rounded-xl p-3 overflow-x-auto" style={{ backgroundColor: "var(--color-surface-elevated)" }}>
            {card.markscheme}
          </pre>
        )}
      </div>
      <p className="text-xs text-dim italic">
        Symbols: <code className="font-mono">;</code> separates marking points · <code className="font-mono">/</code> alternative wording · <code className="font-mono">AW</code> alt wording · <code className="font-mono">AVP</code> any valid point.
      </p>
    </div>
  );
}

export function CardSelfStudy({ card }: { card: Card }) {
  const [show, setShow] = useState(false);
  return <Flashcard card={card} showAnswer={show} onFlip={() => setShow((s) => !s)} />;
}
