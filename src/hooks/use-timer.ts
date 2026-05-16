"use client";

import { useEffect, useState } from "react";

export type TimerState = "normal" | "warning" | "critical" | "expired";

export interface TimerInfo {
  remainingMs: number;
  mmss: string;
  state: TimerState;
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function classify(ms: number): TimerState {
  if (ms <= 0) return "expired";
  if (ms < 60_000) return "critical";
  if (ms < 5 * 60_000) return "warning";
  return "normal";
}

export function useTimer(endsAt: number | null, paused = false): TimerInfo {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (paused || endsAt == null) return;
    setNow(Date.now());
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => window.clearInterval(id);
  }, [endsAt, paused]);

  const remaining = endsAt == null ? 0 : Math.max(0, endsAt - now);
  return {
    remainingMs: remaining,
    mmss: format(remaining),
    state: endsAt == null ? "normal" : classify(remaining),
  };
}
