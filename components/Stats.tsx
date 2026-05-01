"use client";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/sr";

export function Stats({ ids }: { ids: string[] }) {
  const [stats, setStats] = useState<{
    due: number;
    learning: number;
    learned: number;
    untouched: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    setStats(getStats(ids));
  }, [ids]);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl glass border border-token shimmer" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Due", value: stats.due, color: "rose" },
    { label: "Learning", value: stats.learning, color: "orange" },
    { label: "Learned", value: stats.learned, color: "emerald" },
    { label: "Total", value: stats.total, color: "zinc" },
  ];

  const colorMap: Record<string, { fg: string; ring: string }> = {
    rose: { fg: "var(--color-danger, #f87171)", ring: "rgba(248, 113, 113, 0.25)" },
    orange: { fg: "var(--color-warn, #fb923c)", ring: "rgba(251, 146, 60, 0.25)" },
    emerald: { fg: "var(--color-accent)", ring: "var(--color-accent-dim)" },
    zinc: { fg: "var(--color-text-primary)", ring: "var(--color-border)" },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((it) => {
        const c = colorMap[it.color];
        return (
          <div
            key={it.label}
            className="rounded-2xl glass border border-token p-4 shadow-card relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none opacity-50" style={{ background: `radial-gradient(circle, ${c.ring}, transparent 70%)` }} />
            <div className="text-3xl sm:text-4xl font-bold font-mono" style={{ color: c.fg }}>
              {it.value}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted mt-2">{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}
