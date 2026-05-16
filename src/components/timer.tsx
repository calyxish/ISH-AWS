"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TimerState } from "@/hooks/use-timer";

interface TimerProps {
  mmss: string;
  state: TimerState;
  className?: string;
}

const stateClass: Record<TimerState, string> = {
  normal: "text-[var(--fg)]",
  warning: "text-[var(--warning)]",
  critical: "text-[var(--danger)]",
  expired: "text-[var(--danger)]",
};

export function Timer({ mmss, state, className }: TimerProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)]",
        "bg-[var(--surface)] px-3 font-sans text-sm",
        stateClass[state],
        className,
      )}
    >
      <Clock className="h-4 w-4" aria-hidden />
      <span className="tabular-nums font-medium">{mmss}</span>
    </div>
  );
}
