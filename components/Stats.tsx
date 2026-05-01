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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-900/40 border border-zinc-800" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Due now", value: stats.due, color: "text-rose-300", border: "border-rose-500/30" },
    { label: "Learning", value: stats.learning, color: "text-orange-300", border: "border-orange-500/30" },
    { label: "Learned", value: stats.learned, color: "text-emerald-300", border: "border-emerald-500/30" },
    { label: "Total", value: stats.total, color: "text-zinc-200", border: "border-zinc-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {items.map((it) => (
        <div
          key={it.label}
          className={`rounded-xl p-4 bg-zinc-900/40 border ${it.border}`}
        >
          <div className={`text-3xl font-bold font-mono ${it.color}`}>{it.value}</div>
          <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
