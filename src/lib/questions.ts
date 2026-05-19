import rawBank from "@data/questions.json";
import { parseBank } from "@/lib/schema";
import type { Domain, OrderMode, Question, Settings } from "@/lib/types";

let cached: Question[] | null = null;

export function loadQuestions(): Question[] {
  if (cached) return cached;
  cached = parseBank(rawBank).questions;
  return cached;
}

export function filterByDomains(
  pool: Question[],
  domains: Domain[],
): Question[] {
  if (domains.length === 0) return pool;
  const set = new Set(domains);
  return pool.filter((q) => set.has(q.domain));
}

export function selectByMode(
  pool: Question[],
  mode: Exclude<OrderMode, "range">,
  n: number,
): Question[] {
  const k = Math.min(Math.max(n, 0), pool.length);
  if (k === 0) return [];
  switch (mode) {
    case "first":
      return pool.slice(0, k);
    case "last":
      return pool.slice(pool.length - k);
    case "random":
    default: {
      const a = pool.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, k);
    }
  }
}

/**
 * Slice the full bank by positional 1-based inclusive [start, end] indices.
 * Domain filter is intentionally ignored here — the range IS the selection.
 */
export function selectByRange(
  bank: Question[],
  start: number,
  end: number,
): Question[] {
  const lo = Math.max(1, Math.min(bank.length, Math.floor(start)));
  const hi = Math.max(lo, Math.min(bank.length, Math.floor(end)));
  return bank.slice(lo - 1, hi);
}

export function buildSessionQuestions(settings: Settings): Question[] {
  const all = loadQuestions();
  if (settings.order === "range") {
    const start = settings.rangeStart ?? 1;
    const end = settings.rangeEnd ?? all.length;
    return selectByRange(all, start, end);
  }
  const pool = filterByDomains(all, settings.domains);
  return selectByMode(pool, settings.order, settings.count);
}
