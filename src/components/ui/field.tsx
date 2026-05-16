import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  trailing?: ReactNode;
}

export function Field({
  label,
  hint,
  trailing,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-sm font-medium text-[var(--fg)]">
          {label}
        </span>
        {trailing ? (
          <span className="font-sans text-sm tabular-nums text-[var(--muted)]">
            {trailing}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p className="font-sans text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
