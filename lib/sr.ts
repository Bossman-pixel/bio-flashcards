"use client";
import type { Rating, SrState } from "./types";
import { logEvent } from "./sessions";

const STORAGE_KEY = "bio-flashcards.sr.v1";
const DAY_MS = 24 * 60 * 60 * 1000;

export const defaultSrState: SrState = {
  ease: 2.5,
  interval: 0,
  reps: 0,
  lapses: 0,
  due: 0,
  lastSeen: null,
};

export function loadAll(): Record<string, SrState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAll(state: Record<string, SrState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function get(id: string): SrState {
  const all = loadAll();
  return all[id] ?? { ...defaultSrState };
}

export function rate(id: string, rating: Rating, surface: "study" | "flashcards" | "paper" = "study"): SrState {
  const all = loadAll();
  const cur = all[id] ?? { ...defaultSrState };
  const next = applyRating(cur, rating);
  all[id] = next;
  saveAll(all);
  logEvent({ cardId: id, rating, surface });
  return next;
}

// SM-2-style algorithm tuned for short revision windows.
function applyRating(s: SrState, rating: Rating): SrState {
  const now = Date.now();
  let { ease, interval, reps, lapses } = s;
  let intervalDays: number;

  if (rating === "again") {
    lapses += 1;
    reps = 0;
    intervalDays = 0; // re-show within session (10 min)
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (rating === "hard") ease = Math.max(1.3, ease - 0.15);
    if (rating === "easy") ease = ease + 0.15;

    if (reps === 1) {
      intervalDays = rating === "easy" ? 4 : 1;
    } else if (reps === 2) {
      intervalDays = rating === "easy" ? 7 : rating === "hard" ? 3 : 6;
    } else {
      const prev = Math.max(1, interval / DAY_MS);
      const mult = rating === "hard" ? 1.2 : rating === "easy" ? ease * 1.3 : ease;
      intervalDays = Math.round(prev * mult);
    }
  }

  const intervalMs = rating === "again" ? 10 * 60 * 1000 : intervalDays * DAY_MS;
  return {
    ease,
    interval: intervalMs,
    reps,
    lapses,
    due: now + intervalMs,
    lastSeen: now,
  };
}

export function getDueCount(ids: string[]): number {
  const all = loadAll();
  const now = Date.now();
  let n = 0;
  for (const id of ids) {
    const s = all[id];
    if (!s || s.due <= now) n += 1;
  }
  return n;
}

export function getStats(ids: string[]) {
  const all = loadAll();
  const now = Date.now();
  let due = 0,
    learning = 0,
    learned = 0,
    untouched = 0;
  for (const id of ids) {
    const s = all[id];
    if (!s) {
      untouched += 1;
      due += 1;
      continue;
    }
    if (s.due <= now) due += 1;
    if (s.reps === 0) learning += 1;
    else if (s.reps >= 3) learned += 1;
    else learning += 1;
  }
  return { due, learning, learned, untouched, total: ids.length };
}

export function pickDue(ids: string[]): string[] {
  const all = loadAll();
  const now = Date.now();
  const due: { id: string; priority: number }[] = [];
  for (const id of ids) {
    const s = all[id];
    if (!s) {
      due.push({ id, priority: 0 });
    } else if (s.due <= now) {
      due.push({ id, priority: now - s.due });
    }
  }
  due.sort((a, b) => b.priority - a.priority);
  return due.map((d) => d.id);
}

export function reset() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
