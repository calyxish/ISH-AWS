import { cn } from "@/lib/cn";
import {
  DOMAIN_LABELS,
  DOMAINS,
  type ResultSummary,
} from "@/lib/types";

interface ResultsSummaryProps {
  summary: ResultSummary;
  durationMs: number;
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function ResultsSummary({ summary, durationMs }: ResultsSummaryProps) {
  const { correct, total, percent, scaled, passed, byDomain } = summary;
  const percentDisplay = Math.round(percent * 100);

  return (
    <section className="flex flex-col gap-6">
      <div
        className={cn(
          "rounded-2xl border bg-[var(--surface)]",
          passed
            ? "border-t-4 border-[var(--border)] border-t-[var(--success)]"
            : "border-t-4 border-[var(--border)] border-t-[var(--danger)]",
        )}
      >
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className={cn(
                "font-sans text-xs uppercase tracking-[0.18em]",
                passed ? "text-[var(--success)]" : "text-[var(--danger)]",
              )}
            >
              {passed ? "Passed" : "Not yet"}
            </p>
            <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-[var(--fg)] sm:text-5xl">
              {passed ? "Nice work." : "Closer next time."}
            </h1>
            <p className="mt-3 max-w-prose font-serif text-[var(--muted)] prose-reading">
              You answered {correct} of {total} correctly ({percentDisplay}%) in{" "}
              {formatDuration(durationMs)}.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="font-sans text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Scaled score (estimate)
            </span>
            <span
              className={cn(
                "font-serif text-5xl font-medium tabular-nums",
                passed ? "text-[var(--success)]" : "text-[var(--danger)]",
              )}
            >
              {scaled}
            </span>
            <span className="font-sans text-xs text-[var(--muted)]">
              Pass at 700 · range 100–1000
            </span>
          </div>
        </div>
        <p className="border-t border-[var(--border)] px-6 py-3 font-sans text-xs text-[var(--muted)]">
          AWS uses a non-public scaled-scoring system. This estimate is a
          linear approximation of your raw percentage and is for guidance only.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="mb-4 font-serif text-xl font-medium tracking-tight text-[var(--fg)]">
          By domain
        </h2>
        <div className="flex flex-col gap-3">
          {DOMAINS.map((d) => {
            const stat = byDomain[d];
            if (stat.total === 0) return null;
            const pct = (stat.correct / stat.total) * 100;
            return (
              <div key={d} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-base text-[var(--fg)]">
                    {DOMAIN_LABELS[d]}
                  </span>
                  <span className="font-sans text-sm tabular-nums text-[var(--muted)]">
                    {stat.correct} / {stat.total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={stat.correct}
                    aria-valuemin={0}
                    aria-valuemax={stat.total}
                    aria-label={`${DOMAIN_LABELS[d]} score`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
