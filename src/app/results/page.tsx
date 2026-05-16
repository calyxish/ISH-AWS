"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ResultsSummary } from "@/components/results-summary";
import { ReviewPanel } from "@/components/review-panel";
import { Button } from "@/components/ui/button";
import { summarize } from "@/lib/scoring";
import { clearSession, loadSession } from "@/lib/storage";
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

  function retake() {
    clearSession();
    router.push("/");
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-12 pt-4 sm:px-6">
      <ResultsSummary summary={summary} durationMs={durationMs} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm text-[var(--muted)]">
          Review every question below. Filter to focus on what tripped you up.
        </p>
        <Button type="button" variant="secondary" onClick={retake}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          New practice
        </Button>
      </div>

      <ReviewPanel
        questions={session.questions}
        answers={session.answers}
      />

      <div className="flex justify-center pt-4">
        <Button type="button" size="lg" onClick={retake}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Start a new practice
        </Button>
      </div>
    </section>
  );
}
