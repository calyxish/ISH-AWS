"use client";

import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { OptionId, SessionState } from "@/lib/types";

interface OneByOneViewProps {
  session: SessionState;
  onAnswer: (questionId: string, picked: OptionId[]) => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
}

export function OneByOneView({
  session,
  onAnswer,
  onPrev,
  onNext,
  onGoTo,
  onSubmit,
}: OneByOneViewProps) {
  const [showGrid, setShowGrid] = useState(false);
  const { questions, currentIndex, answers } = session;
  const q = questions[currentIndex];
  const picked = answers[q.id] ?? [];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <QuestionCard
        question={q}
        index={currentIndex}
        total={questions.length}
        picked={picked}
        onChange={(p) => onAnswer(q.id, p)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>

        <button
          type="button"
          onClick={() => setShowGrid((v) => !v)}
          className="font-sans text-sm text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--fg)] hover:decoration-[var(--accent)]"
          aria-expanded={showGrid}
          aria-controls="question-grid"
        >
          {showGrid ? "Hide grid" : "Jump to question"} ({answeredCount}/{questions.length} answered)
        </button>

        {isLast ? (
          <Button type="button" onClick={onSubmit}>
            <Flag className="h-4 w-4" aria-hidden />
            Submit
          </Button>
        ) : (
          <Button type="button" onClick={onNext}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>

      {showGrid ? (
        <div
          id="question-grid"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="mb-3 flex items-center justify-between font-sans text-xs text-[var(--muted)]">
            <span>Tap any number to jump.</span>
            <span>
              Answered cells are filled.
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {questions.map((qq, i) => {
              const isAnswered = (answers[qq.id]?.length ?? 0) > 0;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => onGoTo(i)}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg border font-sans text-sm tabular-nums transition-colors",
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                      : isAnswered
                        ? "border-[var(--accent)] bg-[var(--bubble)] text-[var(--fg)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bubble)]",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Go to question ${i + 1}${isAnswered ? ", answered" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
