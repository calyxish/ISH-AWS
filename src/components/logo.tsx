import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  /** When true, hides the wordmark and only renders the "I" + dot mark (for tight nav slots). */
  markOnly?: boolean;
}

export function Logo({ className, markOnly = false }: LogoProps) {
  if (markOnly) {
    return (
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ISH-AWS"
        className={cn("h-8 w-8", className)}
      >
        <rect
          x="13"
          y="6"
          width="6"
          height="16"
          rx="1.5"
          fill="var(--fg)"
        />
        <circle cx="24" cy="22" r="3.5" fill="var(--accent)" />
      </svg>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-serif text-2xl tracking-tight",
        className,
      )}
      aria-label="ISH-AWS"
    >
      <span className="font-medium text-[var(--fg)]">ISH</span>
      <span
        aria-hidden
        className="inline-block h-2 w-2 translate-y-[-0.15em] rounded-full bg-[var(--accent)]"
      />
      <span className="sr-only">AWS</span>
    </span>
  );
}
