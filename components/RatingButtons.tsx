"use client";
import type { Rating } from "@/lib/types";

const buttons: { rating: Rating; label: string; sub: string; bg: string; fg: string }[] = [
  { rating: "again", label: "Again", sub: "<10m", bg: "#f43f5e", fg: "#fff" },
  { rating: "hard", label: "Hard", sub: "~3d", bg: "#fb923c", fg: "#1a0f00" },
  { rating: "good", label: "Good", sub: "~6d", bg: "var(--color-accent)", fg: "var(--color-accent-fg)" },
  { rating: "easy", label: "Easy", sub: "~14d", bg: "#38bdf8", fg: "#001a2a" },
];

export function RatingButtons({ onRate }: { onRate: (r: Rating) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-3xl mx-auto mt-4">
      {buttons.map((b) => (
        <button
          key={b.rating}
          onClick={() => onRate(b.rating)}
          className="py-3 sm:py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-elev"
          style={{ backgroundColor: b.bg, color: b.fg }}
        >
          <div>{b.label}</div>
          <div className="text-[11px] opacity-70 font-mono">{b.sub}</div>
        </button>
      ))}
    </div>
  );
}
