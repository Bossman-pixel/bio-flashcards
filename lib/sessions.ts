"use client";

const KEY = "bio-flashcards.sessions.v1";

export type SessionEvent = {
  ts: number; // epoch ms
  cardId: string;
  rating: "again" | "hard" | "good" | "easy";
  surface: "study" | "flashcards" | "paper";
};

export function logEvent(e: Omit<SessionEvent, "ts">) {
  if (typeof window === "undefined") return;
  const all = loadAll();
  all.push({ ...e, ts: Date.now() });
  // cap last 5000
  if (all.length > 5000) all.splice(0, all.length - 5000);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function loadAll(): SessionEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

const DAY = 24 * 60 * 60 * 1000;

export function streak(): { current: number; best: number; lastDay: number | null } {
  const evts = loadAll();
  if (evts.length === 0) return { current: 0, best: 0, lastDay: null };

  const days = new Set<string>();
  for (const e of evts) {
    days.add(toDayKey(e.ts));
  }
  const sortedDays = [...days].sort();
  let current = 0;
  let best = 0;
  let prev: number | null = null;
  let run = 0;
  for (const d of sortedDays) {
    const t = fromDayKey(d);
    if (prev === null || t - prev === DAY) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = t;
  }
  // current = run if last day is today or yesterday
  const todayKey = toDayKey(Date.now());
  const yesterdayKey = toDayKey(Date.now() - DAY);
  const lastKey = sortedDays[sortedDays.length - 1];
  if (lastKey === todayKey || lastKey === yesterdayKey) {
    current = run;
  }
  return { current, best, lastDay: prev };
}

export function heatmap(daysBack = 90): { day: string; count: number }[] {
  const evts = loadAll();
  const buckets: Record<string, number> = {};
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(Date.now() - i * DAY);
    buckets[toDayKey(d.getTime())] = 0;
  }
  for (const e of evts) {
    const k = toDayKey(e.ts);
    if (k in buckets) buckets[k] += 1;
  }
  return Object.entries(buckets)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function accuracyByTopic(allTopicsForCard: (id: string) => string[]) {
  const evts = loadAll();
  const map: Record<string, { good: number; total: number }> = {};
  for (const e of evts) {
    const topics = allTopicsForCard(e.cardId);
    const passed = e.rating === "good" || e.rating === "easy";
    for (const t of topics) {
      if (!map[t]) map[t] = { good: 0, total: 0 };
      map[t].total += 1;
      if (passed) map[t].good += 1;
    }
  }
  return Object.entries(map)
    .map(([topic, v]) => ({ topic, accuracy: v.total ? v.good / v.total : 0, total: v.total }))
    .sort((a, b) => b.total - a.total);
}

export function progressOverTime(daysBack = 30): { day: string; reviews: number; correct: number }[] {
  const evts = loadAll();
  const buckets: Record<string, { reviews: number; correct: number }> = {};
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(Date.now() - i * DAY);
    buckets[toDayKey(d.getTime())] = { reviews: 0, correct: 0 };
  }
  for (const e of evts) {
    const k = toDayKey(e.ts);
    if (k in buckets) {
      buckets[k].reviews += 1;
      if (e.rating === "good" || e.rating === "easy") buckets[k].correct += 1;
    }
  }
  return Object.entries(buckets)
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function totalReviews(): number {
  return loadAll().length;
}

export function timeSpentEstimate(): number {
  // rough: 60s per review average
  return loadAll().length * 60;
}

function toDayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDayKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
