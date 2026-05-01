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
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono">
              {card.paperCode}
            </span>
            <span>{card.sessionLabel}</span>
            <span>·</span>
            <span>{card.variantLabel}</span>
            <span>·</span>
            <span>Q{card.questionNumber}</span>
          </div>
          <span className="font-mono">[{card.totalMarks} marks]</span>
        </div>

        {!showAnswer ? (
          <QuestionView card={card} />
        ) : (
          <MarkschemeView card={card} />
        )}

        {onFlip && (
          <button
            onClick={onFlip}
            className="mt-6 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold transition"
          >
            {showAnswer ? "Hide answer" : "Show mark scheme"}
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-zinc-400">
          {card.topics?.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1">
          <a
            href={card.sourceQpUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-emerald-300"
          >
            Original QP PDF
          </a>
          <a
            href={card.sourceMsUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-emerald-300"
          >
            Original MS PDF
          </a>
        </div>
      </div>
    </div>
  );
}

function QuestionView({ card }: { card: Card }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
        Question
      </h2>
      <div className="space-y-4 text-base sm:text-lg leading-relaxed text-zinc-100">
        {card.parts.map((p, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="font-mono font-semibold text-emerald-300 shrink-0">
              {p.label}
            </span>
            <div className="flex-1">
              <span>{p.text}</span>
              {p.marks != null && (
                <span className="ml-2 font-mono text-zinc-400">[{p.marks}]</span>
              )}
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
      <h2 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
        Mark scheme
      </h2>
      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-zinc-100">
        {card.markschemeParts.length > 0 ? (
          card.markschemeParts.map((p, idx) => (
            <div key={idx}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono font-semibold text-emerald-300">
                  {p.label}
                </span>
                {p.marks != null && (
                  <span className="font-mono text-zinc-400">[{p.marks} marks]</span>
                )}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-zinc-200 bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
                {p.text}
              </pre>
            </div>
          ))
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-zinc-200 bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
            {card.markscheme}
          </pre>
        )}
      </div>
      <p className="text-xs text-zinc-500 italic">
        Symbols: <code>;</code> = separates marking points · <code>/</code> = alternative wording accepted · <code>AW</code> = alternative wording · <code>AVP</code> = any valid point.
      </p>
    </div>
  );
}

export function CardSelfStudy({ card }: { card: Card }) {
  const [show, setShow] = useState(false);
  return <Flashcard card={card} showAnswer={show} onFlip={() => setShow((s) => !s)} />;
}
