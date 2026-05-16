import {
  DOMAINS,
  type Domain,
  type DomainStat,
  type OptionId,
  type Question,
  type ResultSummary,
} from "@/lib/types";

export function isCorrect(q: Question, picked: OptionId[]): boolean {
  const want = new Set(q.correct);
  const got = new Set(picked);
  if (want.size !== got.size) return false;
  for (const id of want) {
    if (!got.has(id)) return false;
  }
  return true;
}

export function summarize(
  questions: Question[],
  answers: Record<string, OptionId[]>,
): ResultSummary {
  const total = questions.length;
  let correct = 0;
  const byDomain = DOMAINS.reduce(
    (acc, d) => {
      acc[d] = { correct: 0, total: 0 };
      return acc;
    },
    {} as Record<Domain, DomainStat>,
  );

  for (const q of questions) {
    byDomain[q.domain].total += 1;
    if (isCorrect(q, answers[q.id] ?? [])) {
      correct += 1;
      byDomain[q.domain].correct += 1;
    }
  }

  const percent = total === 0 ? 0 : correct / total;
  const scaled = Math.round(100 + percent * 900);
  const passed = scaled >= 700;

  return { total, correct, percent, scaled, passed, byDomain };
}
