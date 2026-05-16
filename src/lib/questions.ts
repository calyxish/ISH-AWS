import rawBank from "@data/questions.json";
import { parseBank } from "@/lib/schema";
import type { Domain, OrderMode, Question } from "@/lib/types";

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
  mode: OrderMode,
  n: number,
): Question[] {
  const k = Math.min(Math.max(n, 0), pool.length);
  if (k === 0) return [];
  switch (mode) {
    case "first":
      return pool.slice(0, k);
    case "last":
      return pool.slice(pool.length - k);
    case "middle": {
      const start = Math.floor((pool.length - k) / 2);
      return pool.slice(start, start + k);
    }
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

export function buildSessionQuestions(
  domains: Domain[],
  mode: OrderMode,
  n: number,
): Question[] {
  const pool = filterByDomains(loadQuestions(), domains);
  return selectByMode(pool, mode, n);
}
