"use client";

import { Check, ExternalLink, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { isCorrect } from "@/lib/scoring";
import {
  DOMAIN_LABELS,
  DOMAINS,
  TOPIC_LABELS,
  type Domain,
  type OptionId,
  type Question,
  type Topic,
} from "@/lib/types";

interface ReviewPanelProps {
  questions: Question[];
  answers: Record<string, OptionId[]>;
}

type DomainFilter = "all" | "incorrect" | Domain;

const DOMAIN_CHIPS: { value: DomainFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "incorrect", label: "Incorrect only" },
  ...DOMAINS.map((d) => ({ value: d as DomainFilter, label: DOMAIN_LABELS[d] })),
];

export function ReviewPanel({ questions, answers }: ReviewPanelProps) {
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "any">("any");

  const presentTopics = useMemo<Topic[]>(() => {
    const set = new Set<Topic>();
    for (const q of questions) {
      if (q.topic) set.add(q.topic);
    }
    return Array.from(set);
  }, [questions]);

  const visible = useMemo(() => {
    return questions
      .map((q, index) => ({
        q,
        index,
        picked: answers[q.id] ?? [],
        ok: isCorrect(q, answers[q.id] ?? []),
      }))
      .filter(({ q, ok }) => {
        if (filter === "incorrect" && ok) return false;
        if (filter !== "all" && filter !== "incorrect" && q.domain !== filter) {
          return false;
        }
        if (topicFilter !== "any" && q.topic !== topicFilter) return false;
        return true;
      });
  }, [questions, answers, filter, topicFilter]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[var(--fg)]">
          Review
        </h2>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_CHIPS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-sans text-sm transition-colors",
                filter === c.value
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--bubble)]",
              )}
              aria-pressed={filter === c.value}
            >
              {c.label}
            </button>
          ))}
        </div>
        {presentTopics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTopicFilter("any")}
              className={cn(
                "rounded-full border px-3 py-1 font-sans text-xs transition-colors",
                topicFilter === "any"
                  ? "border-[var(--accent)] bg-[var(--bubble)] text-[var(--fg)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bubble)]",
              )}
              aria-pressed={topicFilter === "any"}
            >
              Any topic
            </button>
            {presentTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicFilter(t)}
                className={cn(
                  "rounded-full border px-3 py-1 font-sans text-xs transition-colors",
                  topicFilter === t
                    ? "border-[var(--accent)] bg-[var(--bubble)] text-[var(--fg)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bubble)]",
                )}
                aria-pressed={topicFilter === t}
              >
                {TOPIC_LABELS[t]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <Card>
          <p className="font-serif text-[var(--muted)]">
            No questions match this filter.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map(({ q, index, picked, ok }) => (
            <ReviewItem
              key={q.id}
              question={q}
              index={index}
              picked={picked}
              ok={ok}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface ReviewItemProps {
  question: Question;
  index: number;
  picked: OptionId[];
  ok: boolean;
}

function ReviewItem({ question, index, picked, ok }: ReviewItemProps) {
  const pickedSet = new Set(picked);
  const correctSet = new Set(question.correct);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 font-sans text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>
          Question {index + 1} · {DOMAIN_LABELS[question.domain]}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
            ok
              ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
              : "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]",
          )}
        >
          {ok ? (
            <Check className="h-3.5 w-3.5" aria-hidden strokeWidth={3} />
          ) : (
            <X className="h-3.5 w-3.5" aria-hidden strokeWidth={3} />
          )}
          {ok ? "Correct" : "Incorrect"}
        </span>
      </div>

      <p className="font-serif text-lg text-[var(--fg)] prose-reading">
        {question.prompt}
      </p>

      <ul className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const wasPicked = pickedSet.has(opt.id);
          const isRight = correctSet.has(opt.id);
          let tone: "correct" | "wrong" | "missed" | "neutral" = "neutral";
          if (isRight && wasPicked) tone = "correct";
          else if (!isRight && wasPicked) tone = "wrong";
          else if (isRight && !wasPicked) tone = "missed";

          return (
            <li
              key={opt.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                tone === "correct" &&
                  "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)]",
                tone === "wrong" &&
                  "border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
                tone === "missed" &&
                  "border-dashed border-[var(--success)]",
                tone === "neutral" && "border-[var(--border)]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  tone === "correct" &&
                    "border-[var(--success)] bg-[var(--success)] text-[var(--success-fg)]",
                  tone === "wrong" &&
                    "border-[var(--danger)] bg-[var(--danger)] text-[var(--danger-fg)]",
                  tone === "missed" && "border-dashed border-[var(--success)] text-[var(--success)]",
                  tone === "neutral" && "border-[var(--border)] text-[var(--muted)]",
                )}
              >
                {tone === "correct" ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : tone === "wrong" ? (
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span className="font-sans text-xs">{opt.id}</span>
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-serif text-base text-[var(--fg)]">
                  <span className="font-sans text-sm uppercase tracking-wider text-[var(--muted)]">
                    {opt.id}.
                  </span>{" "}
                  {opt.text}
                </span>
                {tone === "missed" ? (
                  <span className="font-sans text-xs uppercase tracking-wider text-[var(--success)]">
                    You missed this correct answer
                  </span>
                ) : null}
                {tone === "wrong" ? (
                  <span className="font-sans text-xs uppercase tracking-wider text-[var(--danger)]">
                    You picked this
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <p className="font-sans text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Why
        </p>
        <p className="mt-1.5 font-serif text-[var(--fg)] prose-reading">
          {question.explanation}
        </p>
        {question.reference ? (
          <a
            href={question.reference}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-sans text-sm text-[var(--accent)] hover:underline"
          >
            Learn more on AWS docs
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </Card>
  );
}
