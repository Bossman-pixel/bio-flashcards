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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Browse</h1>
        <p className="text-muted text-sm mt-1">
          Search question + mark scheme text. Filter by year, session, or topic.
        </p>
      </header>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search… meiosis, photosynthesis, bioinformatics…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-4 py-3 rounded-xl glass border border-token focus:border-accent outline-none text-primary placeholder:text-dim transition-colors"
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

      <div className="text-sm text-muted">
        {filtered.length} of {cards.length} cards
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/papers/${c.session}_${c.variant}#${c.id}`}
            className="block rounded-xl glass border border-token hover:border-accent hover:shadow-elev p-4 transition-all"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full font-mono text-accent" style={{ backgroundColor: "var(--color-accent-dim)" }}>
                {c.paperCode}
              </span>
              <span className="text-muted">{c.sessionLabel} · Q{c.questionNumber}</span>
              {c.topics?.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-elev border border-subtle text-secondary">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-primary">
              {c.parts.map((p, i) => (
                <span key={i}>
                  <span className="font-mono text-accent">{p.label}</span> {p.text}
                  {p.marks != null && <span className="font-mono text-muted"> [{p.marks}]</span>}{" "}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted py-12">No cards match those filters.</div>
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
      className="px-3 py-2 rounded-lg glass border border-token hover:border-accent text-sm text-primary outline-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
