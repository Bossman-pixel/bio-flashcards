"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Card } from "@/lib/types";

export function BrowseClient({
  cards,
  topics,
}: {
  cards: Card[];
  topics: string[];
}) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<"all" | number>("all");
  const [session, setSession] = useState<"all" | "m" | "s" | "w">("all");
  const [topic, setTopic] = useState<"all" | string>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return cards.filter((c) => {
      if (year !== "all" && c.year !== year) return false;
      if (session !== "all" && c.session[0] !== session) return false;
      if (topic !== "all" && !c.topics?.includes(topic)) return false;
      if (ql) {
        const hay = (c.questionText + " " + c.markscheme).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [cards, q, year, session, topic]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Browse all cards</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Search question + mark scheme text. Filter by year, session, or topic.
        </p>
      </header>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search… e.g. meiosis, photosynthesis, kidney"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-emerald-400 outline-none text-zinc-100 placeholder:text-zinc-500"
        />
        <div className="flex flex-wrap gap-2">
          <Select
            value={String(year)}
            onChange={(v) => setYear(v === "all" ? "all" : Number(v))}
            options={[
              { value: "all", label: "All years" },
              { value: "2019", label: "2019" },
              { value: "2020", label: "2020" },
              { value: "2021", label: "2021" },
            ]}
          />
          <Select
            value={session}
            onChange={(v) => setSession(v as typeof session)}
            options={[
              { value: "all", label: "All sessions" },
              { value: "m", label: "Feb/Mar" },
              { value: "s", label: "May/Jun" },
              { value: "w", label: "Oct/Nov" },
            ]}
          />
          <Select
            value={topic}
            onChange={(v) => setTopic(v)}
            options={[
              { value: "all", label: "All topics" },
              ...topics.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>
      </div>

      <div className="text-sm text-zinc-400">
        {filtered.length} of {cards.length} cards
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/papers/${c.session}_${c.variant}#${c.id}`}
            className="block rounded-xl border border-zinc-800 hover:border-emerald-400 hover:bg-zinc-900/40 p-4 transition"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono">
                {c.paperCode}
              </span>
              <span className="text-zinc-400">
                {c.sessionLabel} · Q{c.questionNumber}
              </span>
              {c.topics?.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-zinc-100">
              {c.parts.map((p, i) => (
                <span key={i}>
                  <span className="font-mono text-emerald-300">{p.label}</span>{" "}
                  {p.text}
                  {p.marks != null && (
                    <span className="font-mono text-zinc-400"> [{p.marks}]</span>
                  )}{" "}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-zinc-500 py-12">
            No cards match those filters.
          </div>
        )}
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-emerald-400 text-sm text-zinc-100 outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
