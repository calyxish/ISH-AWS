"use client";

import { Card } from "@/components/ui/card";
import { OptionRow } from "@/components/ui/option-row";
import { cn } from "@/lib/cn";
import { DOMAIN_LABELS, type OptionId, type Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  picked: OptionId[];
  onChange: (picked: OptionId[]) => void;
  disabled?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  index,
  total,
  picked,
  onChange,
  disabled,
  className,
}: QuestionCardProps) {
  const isMulti = question.type === "multi";
  const limit = question.selectCount ?? question.correct.length;
  const helper = isMulti
    ? `Choose ${limit}.`
    : "Choose one.";

  function toggleOption(id: string) {
    const optId = id as OptionId;
    if (disabled) return;
    if (!isMulti) {
      onChange([optId]);
      return;
    }
    const has = picked.includes(optId);
    if (has) {
      onChange(picked.filter((x) => x !== optId));
      return;
    }
    if (picked.length >= limit) {
      // Replace the oldest pick so the user can fluidly change their mind.
      onChange([...picked.slice(1), optId]);
      return;
    }
    onChange([...picked, optId]);
  }

  return (
    <Card className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>
          Question {index + 1} of {total}
        </span>
        <span aria-hidden>·</span>
        <span>{DOMAIN_LABELS[question.domain]}</span>
        <span aria-hidden>·</span>
        <span>{helper}</span>
      </div>

      <p className="font-serif text-xl text-[var(--fg)] prose-reading">
        {question.prompt}
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <OptionRow
            key={opt.id}
            name={`q-${question.id}`}
            value={opt.id}
            type={isMulti ? "checkbox" : "radio"}
            selected={picked.includes(opt.id)}
            onChange={toggleOption}
            disabled={disabled}
          >
            <span className="font-sans text-sm uppercase tracking-wider text-[var(--muted)]">
              {opt.id}.
            </span>{" "}
            {opt.text}
          </OptionRow>
        ))}
      </div>
    </Card>
  );
}
