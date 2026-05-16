"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface OptionRowProps {
  name: string;
  value: string;
  selected: boolean;
  type: "radio" | "checkbox";
  onChange: (value: string) => void;
  children: ReactNode;
  description?: string;
  disabled?: boolean;
}

export function OptionRow({
  name,
  value,
  selected,
  type,
  onChange,
  children,
  description,
  disabled,
}: OptionRowProps) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
        selected
          ? "border-[var(--accent)] bg-[var(--bubble)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bubble)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border",
          type === "radio" ? "rounded-full" : "rounded-md",
          selected
            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
      >
        {selected ? (
          type === "radio" ? (
            <span className="h-2 w-2 rounded-full bg-[var(--accent-fg)]" />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          )
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-serif text-base text-[var(--fg)]">{children}</span>
        {description ? (
          <span className="font-sans text-sm text-[var(--muted)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
