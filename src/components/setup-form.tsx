"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { OptionRow } from "@/components/ui/option-row";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { loadQuestions } from "@/lib/questions";
import { clearSession, loadSettings, saveSettings } from "@/lib/storage";
import {
  DEFAULT_SETTINGS,
  DOMAIN_LABELS,
  DOMAINS,
  type Domain,
  type DisplayMode,
  type OrderMode,
  type Settings,
} from "@/lib/types";

const TIME_PRESETS = [10, 20, 30, 45, 60, 90] as const;
const MIN_COUNT = 5;
const MAX_COUNT = 65;

const ORDER_OPTIONS: { value: OrderMode; label: string; description: string }[] = [
  { value: "random", label: "Random", description: "Shuffle the whole pool. Different every session." },
  { value: "first", label: "First N", description: "Take questions from the start of the bank." },
  { value: "last", label: "Last N", description: "Take questions from the end of the bank." },
  { value: "middle", label: "Middle N", description: "Take questions centered in the bank." },
];

const DISPLAY_OPTIONS: { value: DisplayMode; label: string; description: string }[] = [
  {
    value: "one-by-one",
    label: "One question at a time",
    description: "Answer, click Next, repeat. Closest to the real exam.",
  },
  {
    value: "all-at-once",
    label: "All on one page",
    description: "Scroll through every question. Great for review-style practice.",
  },
];

function suggestedMinutes(count: number): number {
  const ideal = Math.round(count * 1.4);
  const preset = TIME_PRESETS.find((m) => m >= ideal) ?? TIME_PRESETS[TIME_PRESETS.length - 1];
  return preset;
}

function countAvailable(domains: Domain[]): number {
  const all = loadQuestions();
  if (domains.length === 0) return all.length;
  const set = new Set(domains);
  return all.filter((q) => set.has(q.domain)).length;
}

export function SetupForm() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const available = useMemo(
    () => (hydrated ? countAvailable(settings.domains) : MAX_COUNT),
    [hydrated, settings.domains],
  );
  const effectiveMax = Math.max(MIN_COUNT, Math.min(MAX_COUNT, available));
  const cappedCount = Math.min(settings.count, effectiveMax);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function toggleDomain(d: Domain) {
    setSettings((s) => {
      const has = s.domains.includes(d);
      const next = has ? s.domains.filter((x) => x !== d) : [...s.domains, d];
      return { ...s, domains: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const finalSettings: Settings = { ...settings, count: cappedCount };
    saveSettings(finalSettings);
    clearSession();
    router.push("/practice");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>How long, how many?</CardTitle>
          <CardDescription>
            Pick the length of your practice session. The real AWS Cloud
            Practitioner exam is 65 questions in 90 minutes.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-col gap-6">
          <Field
            label="Number of questions"
            trailing={`${cappedCount} of ${available} available`}
            hint={
              cappedCount === effectiveMax && effectiveMax < settings.count
                ? `Only ${effectiveMax} match your domain filter — count was clamped.`
                : undefined
            }
          >
            <Slider
              min={MIN_COUNT}
              max={effectiveMax}
              value={cappedCount}
              onValueChange={(n) => update("count", n)}
              aria-label="Number of questions"
            />
          </Field>

          <Field
            label="Time limit"
            hint="When the clock hits zero, the session auto-submits."
          >
            <div className="flex items-center gap-3">
              <Select
                value={String(settings.timeMinutes)}
                onChange={(e) => update("timeMinutes", Number(e.target.value))}
                aria-label="Time limit"
                className="max-w-40"
              >
                {TIME_PRESETS.map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => update("timeMinutes", suggestedMinutes(cappedCount))}
                className="font-sans text-sm text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--fg)] hover:decoration-[var(--accent)]"
              >
                Suggest for {cappedCount} questions
              </button>
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How should questions be picked?</CardTitle>
          <CardDescription>
            Choose how the questions are selected from the bank.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {ORDER_OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              name="order"
              value={o.value}
              type="radio"
              selected={settings.order === o.value}
              onChange={(v) => update("order", v as OrderMode)}
              description={o.description}
            >
              {o.label}
            </OptionRow>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How should questions be shown?</CardTitle>
          <CardDescription>
            Pick a display mode. On phones, both modes adapt to a single column.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {DISPLAY_OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              name="display"
              value={o.value}
              type="radio"
              selected={settings.display === o.value}
              onChange={(v) => update("display", v as DisplayMode)}
              description={o.description}
            >
              {o.label}
            </OptionRow>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Focus on specific domains?</CardTitle>
          <CardDescription>
            Leave all unchecked to draw from every domain.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {DOMAINS.map((d) => (
            <OptionRow
              key={d}
              name={`domain-${d}`}
              value={d}
              type="checkbox"
              selected={settings.domains.includes(d)}
              onChange={() => toggleDomain(d)}
            >
              {DOMAIN_LABELS[d]}
            </OptionRow>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm text-[var(--muted)]">
          Your answers stay on this device. No accounts, no tracking.
        </p>
        <Button type="submit" size="lg" disabled={submitting || available < MIN_COUNT}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading practice
            </>
          ) : (
            <>
              Start practice
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </div>

      {available < MIN_COUNT ? (
        <p className="font-sans text-sm text-[var(--danger)]">
          Not enough questions match your domain filter. Uncheck a domain or
          add more questions to <code>data/questions.json</code>.
        </p>
      ) : null}
    </form>
  );
}
