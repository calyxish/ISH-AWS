"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AllAtOnceView } from "@/components/all-at-once-view";
import { OneByOneView } from "@/components/one-by-one-view";
import { ProgressBar } from "@/components/progress-bar";
import { Timer } from "@/components/timer";
import { Button } from "@/components/ui/button";
import { useExamSession } from "@/hooks/use-exam-session";
import { useTimer } from "@/hooks/use-timer";

export default function PracticePage() {
  const router = useRouter();
  const exam = useExamSession();
  const timer = useTimer(
    exam.session?.endsAt ?? null,
    exam.phase !== "active",
  );

  // Auto-submit when the timer expires.
  useEffect(() => {
    if (exam.phase === "active" && timer.state === "expired") {
      exam.submit();
    }
  }, [exam.phase, exam.submit, timer.state]);

  // After submission, navigate to results.
  useEffect(() => {
    if (exam.phase === "submitted") {
      router.replace("/results");
    }
  }, [exam.phase, router]);

  // If we have no session (e.g. domain filter excluded everything), bounce home.
  useEffect(() => {
    if (exam.phase === "no-settings") {
      router.replace("/");
    }
  }, [exam.phase, router]);

  const answered = useMemo(() => {
    if (!exam.session) return 0;
    return Object.values(exam.session.answers).filter((a) => a.length > 0).length;
  }, [exam.session]);

  if (exam.phase === "loading" || !exam.session) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <p className="font-sans text-sm text-[var(--muted)]">Loading practice…</p>
      </section>
    );
  }

  const total = exam.session.questions.length;

  function confirmSubmit() {
    if (!exam.session) return;
    const unanswered = total - answered;
    const msg =
      unanswered > 0
        ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`
        : "Submit your answers and see your score?";
    if (window.confirm(msg)) {
      exam.submit();
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Timer mmss={timer.mmss} state={timer.state} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={confirmSubmit}
          >
            Submit
          </Button>
        </div>
        <ProgressBar
          value={answered}
          max={total}
          label="Answered"
          className="mt-3"
        />
      </div>

      {exam.session.settings.display === "one-by-one" ? (
        <OneByOneView
          session={exam.session}
          onAnswer={exam.setAnswer}
          onPrev={exam.prev}
          onNext={exam.next}
          onGoTo={exam.goTo}
          onSubmit={confirmSubmit}
        />
      ) : (
        <AllAtOnceView
          session={exam.session}
          onAnswer={exam.setAnswer}
          onSubmit={confirmSubmit}
        />
      )}
    </section>
  );
}
