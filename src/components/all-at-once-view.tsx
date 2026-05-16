"use client";

import { Flag } from "lucide-react";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import type { OptionId, SessionState } from "@/lib/types";

interface AllAtOnceViewProps {
  session: SessionState;
  onAnswer: (questionId: string, picked: OptionId[]) => void;
  onSubmit: () => void;
}

export function AllAtOnceView({
  session,
  onAnswer,
  onSubmit,
}: AllAtOnceViewProps) {
  const { questions, answers } = session;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          total={questions.length}
          picked={answers[q.id] ?? []}
          onChange={(p) => onAnswer(q.id, p)}
        />
      ))}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm text-[var(--muted)]">
          {answeredCount} of {questions.length} answered.
        </p>
        <Button type="button" size="lg" onClick={onSubmit}>
          <Flag className="h-4 w-4" aria-hidden />
          Submit
        </Button>
      </div>
    </div>
  );
}
