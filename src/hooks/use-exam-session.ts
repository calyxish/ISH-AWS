"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildSessionQuestions } from "@/lib/questions";
import {
  clearSession,
  loadSession,
  loadSettings,
  saveSession,
} from "@/lib/storage";
import type { OptionId, SessionState, Settings } from "@/lib/types";

export type ExamPhase = "loading" | "no-settings" | "active" | "submitted";

interface UseExamSessionResult {
  phase: ExamPhase;
  session: SessionState | null;
  setAnswer: (questionId: string, picked: OptionId[]) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  submit: () => void;
  reset: () => void;
}

function createSession(settings: Settings): SessionState {
  const questions = buildSessionQuestions(settings);
  const startedAt = Date.now();
  return {
    startedAt,
    endsAt: startedAt + settings.timeMinutes * 60_000,
    questions,
    answers: {},
    currentIndex: 0,
    submitted: false,
    settings,
  };
}

export function useExamSession(): UseExamSessionResult {
  const [phase, setPhase] = useState<ExamPhase>("loading");
  const [session, setSession] = useState<SessionState | null>(null);
  const persistTimeout = useRef<number | null>(null);

  useEffect(() => {
    const existing = loadSession();
    if (existing && !existing.submitted) {
      setSession(existing);
      setPhase("active");
      return;
    }
    if (existing && existing.submitted) {
      setSession(existing);
      setPhase("submitted");
      return;
    }
    const settings = loadSettings();
    const built = createSession(settings);
    if (built.questions.length === 0) {
      setPhase("no-settings");
      return;
    }
    saveSession(built);
    setSession(built);
    setPhase("active");
  }, []);

  // Debounced persistence on every session change.
  useEffect(() => {
    if (!session) return;
    if (persistTimeout.current != null) {
      window.clearTimeout(persistTimeout.current);
    }
    persistTimeout.current = window.setTimeout(() => {
      saveSession(session);
    }, 200);
    return () => {
      if (persistTimeout.current != null) {
        window.clearTimeout(persistTimeout.current);
      }
    };
  }, [session]);

  const setAnswer = useCallback((questionId: string, picked: OptionId[]) => {
    setSession((s) => {
      if (!s || s.submitted) return s;
      return {
        ...s,
        answers: { ...s.answers, [questionId]: picked },
      };
    });
  }, []);

  const goTo = useCallback((index: number) => {
    setSession((s) => {
      if (!s) return s;
      const clamped = Math.max(0, Math.min(index, s.questions.length - 1));
      return { ...s, currentIndex: clamped };
    });
  }, []);

  const next = useCallback(() => {
    setSession((s) => {
      if (!s) return s;
      return {
        ...s,
        currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
      };
    });
  }, []);

  const prev = useCallback(() => {
    setSession((s) => {
      if (!s) return s;
      return { ...s, currentIndex: Math.max(s.currentIndex - 1, 0) };
    });
  }, []);

  const submit = useCallback(() => {
    setSession((s) => {
      if (!s || s.submitted) return s;
      const finalized = { ...s, submitted: true };
      saveSession(finalized);
      return finalized;
    });
    setPhase("submitted");
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setSession(null);
    setPhase("loading");
  }, []);

  return { phase, session, setAnswer, goTo, next, prev, submit, reset };
}
