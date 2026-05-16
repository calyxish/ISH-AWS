"use client";

import { Repeat, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ResultsSummary } from "@/components/results-summary";
import { ReviewPanel } from "@/components/review-panel";
import { Button } from "@/components/ui/button";
import { summarize } from "@/lib/scoring";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import type { SessionState } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && (!session || !session.submitted)) {
      router.replace("/");
    }
  }, [hydrated, session, router]);

  const summary = useMemo(() => {
    if (!session) return null;
    return summarize(session.questions, session.answers);
  }, [session]);

  if (!hydrated) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <p className="font-sans text-sm text-[var(--muted)]">Loading results…</p>
      </section>
    );
  }

  if (!session || !summary) {
    return null;
  }

  // Treat the moment of submission as "now" approximated by the last persisted
  // session state. We don't store submittedAt explicitly, so use endsAt or now,
  // whichever is smaller, to compute an honest duration.
  const submittedAt = Math.min(Date.now(), session.endsAt);
  const durationMs = submittedAt - session.startedAt;

  function newPractice() {
    clearSession();
    router.push("/");
  }

  function practiceSame() {
    if (!session) return;
    const startedAt = Date.now();
    const fresh: SessionState = {
      startedAt,
      endsAt: startedAt + session.settings.timeMinutes * 60_000,
      questions: session.questions,
      answers: {},
      currentIndex: 0,
      submitted: false,
      settings: session.settings,
    };
    saveSession(fresh);
    router.push("/practice");
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-12 pt-4 sm:px-6">
      <ResultsSummary summary={summary} durationMs={durationMs} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm text-[var(--muted)]">
          Review every question below. Filter to focus on what tripped you up.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="secondary" onClick={newPractice}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            New practice
          </Button>
          <Button type="button" onClick={practiceSame}>
            <Repeat className="h-4 w-4" aria-hidden />
            Practice same questions
          </Button>
        </div>
      </div>

      <ReviewPanel
        questions={session.questions}
        answers={session.answers}
      />

      <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
        <Button type="button" size="lg" onClick={practiceSame}>
          <Repeat className="h-4 w-4" aria-hidden />
          Practice these {session.questions.length} again
        </Button>
        <Button type="button" size="lg" variant="secondary" onClick={newPractice}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Start a new practice
        </Button>
      </div>
    </section>
  );
}
