"use client";
import type { Rating } from "@/lib/types";

const buttons: { rating: Rating; label: string; sub: string; cls: string }[] = [
  { rating: "again", label: "Again", sub: "<10m", cls: "bg-rose-500 hover:bg-rose-400 text-zinc-900" },
  { rating: "hard", label: "Hard", sub: "~3d", cls: "bg-orange-400 hover:bg-orange-300 text-zinc-900" },
  { rating: "good", label: "Good", sub: "~6d", cls: "bg-emerald-500 hover:bg-emerald-400 text-zinc-900" },
  { rating: "easy", label: "Easy", sub: "~14d", cls: "bg-sky-400 hover:bg-sky-300 text-zinc-900" },
];

export function RatingButtons({ onRate }: { onRate: (r: Rating) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-3xl mx-auto mt-4">
      {buttons.map((b) => (
        <button
          key={b.rating}
          onClick={() => onRate(b.rating)}
          className={`py-3 sm:py-4 rounded-xl font-semibold transition ${b.cls}`}
        >
          <div>{b.label}</div>
          <div className="text-[11px] opacity-70 font-mono">{b.sub}</div>
        </button>
      ))}
    </div>
  );
}
