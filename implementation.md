# Implementation

This document is the engineer's view of ISH-AWS: how the app is wired, where state lives, how questions are validated and scored, and how to extend it.

---

## High-level architecture

A static Next.js 15 App Router site. No backend, no database, no auth. Everything the user sees runs client-side after the initial server render of HTML.

```
                 ┌────────────────────────────┐
                 │   data/questions.json      │   (validated by Zod at first load)
                 └─────────────┬──────────────┘
                               │
              ┌────────────────▼─────────────────┐
              │  src/lib/questions.ts            │   load() → Question[]
              │   selectByMode(): random / first │
              │     / last / middle              │
              └────────────────┬─────────────────┘
                               │
              ┌────────────────▼─────────────────┐
              │  hooks/use-exam-session.ts       │   in-memory + localStorage
              │   SessionState                   │
              └─────┬──────────┬──────────┬──────┘
                    │          │          │
              ┌─────▼──┐  ┌────▼────┐ ┌───▼─────────┐
              │ /      │  │ /pract  │ │ /results    │
              │ setup  │  │ runtime │ │ score+review│
              └────────┘  └─────────┘ └─────────────┘
```

No data leaves the device. Everything persists in `localStorage`.

---

## File map

```
src/
  app/
    layout.tsx              fonts, ThemeProvider, metadata, viewport, header
    page.tsx                "/" — setup form (landing)
    practice/page.tsx       "/practice" — runtime, dispatches one-by-one vs all-at-once
    results/page.tsx        "/results" — score + review
    globals.css             tokens, Tailwind v4 @theme block, base resets
  components/
    logo.tsx                SVG wordmark "ISH" + accent dot
    theme-provider.tsx      next-themes wrapper
    theme-toggle.tsx        sun/moon/system tri-toggle
    setup-form.tsx          count, time, ordering, display mode, domain filter
    question-card.tsx       renders single (radio) or multi (checkbox) question
    one-by-one-view.tsx     paginated runtime
    all-at-once-view.tsx    scroll runtime
    timer.tsx               countdown pill with warning states
    progress-bar.tsx        answered/total
    results-summary.tsx     score banner + domain breakdown
    review-panel.tsx        per-question review with filters
    footer.tsx              "MIT • Not affiliated with AWS"
    ui/                     shadcn primitives (Button, Card, RadioGroup, Checkbox, …)
  lib/
    types.ts                Question, Domain, SessionState, Settings, Result
    schema.ts               Zod schema for questions.json
    questions.ts            load + filter + selectByMode
    scoring.ts              grade + summarize + scaled estimate
    storage.ts              typed localStorage helpers (settings, session)
    cn.ts                   className helper (clsx + tailwind-merge)
  hooks/
    use-timer.ts            countdown driven by requestAnimationFrame
    use-exam-session.ts     creates, persists, and finalizes a session
data/
  questions.json            ~65 CCP questions
public/                     icons, favicon, og-image, manifest
```

---

## Data model

```ts
// src/lib/types.ts

export type Domain =
  | "cloud-concepts"
  | "security-compliance"
  | "cloud-technology"
  | "billing-pricing-support";

export type OptionId = "A" | "B" | "C" | "D" | "E";

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;            // stable slug, e.g. "ccp-0001"
  domain: Domain;
  type: "single" | "multi";
  selectCount?: number;  // multi only — usually 2; required when type === "multi"
  prompt: string;
  options: QuestionOption[];
  correct: OptionId[];   // length 1 for single, >=2 for multi
  explanation: string;
  reference?: string;    // optional AWS docs URL
}

export type OrderMode = "random" | "first" | "last" | "middle";
export type DisplayMode = "one-by-one" | "all-at-once";

export interface Settings {
  count: number;          // 5..65
  timeMinutes: number;    // 10..90
  order: OrderMode;
  display: DisplayMode;
  domains: Domain[];      // empty means "all"
}

export interface SessionState {
  startedAt: number;
  endsAt: number;
  questions: Question[];                    // already filtered + ordered
  answers: Record<string, OptionId[]>;      // questionId -> selected option ids
  currentIndex: number;                     // for one-by-one
  submitted: boolean;
  settings: Settings;
}
```

`questions.json` shape: `{ "version": 1, "questions": Question[] }`. Zod validates at runtime on first load; a malformed file throws a friendly error in the UI.

---

## Selection logic

`src/lib/questions.ts`:

```ts
function selectByMode(
  pool: Question[],
  mode: OrderMode,
  n: number,
): Question[] {
  const k = Math.min(n, pool.length);
  switch (mode) {
    case "first": return pool.slice(0, k);
    case "last":  return pool.slice(pool.length - k);
    case "middle": {
      const start = Math.floor((pool.length - k) / 2);
      return pool.slice(start, start + k);
    }
    case "random": {
      // Fisher–Yates; seeded only if we ever need reproducibility.
      const a = pool.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, k);
    }
  }
}
```

Domain filtering happens before selection. If `settings.domains` is non-empty, the pool is filtered to those domains first.

---

## Scoring

AWS CCP multi-response is **all-or-nothing**: you must pick exactly the correct set. The grader reflects that:

```ts
// src/lib/scoring.ts

export function isCorrect(q: Question, picked: OptionId[]): boolean {
  const want = new Set(q.correct);
  const got = new Set(picked);
  if (want.size !== got.size) return false;
  for (const id of want) if (!got.has(id)) return false;
  return true;
}

export function summarize(
  questions: Question[],
  answers: Record<string, OptionId[]>,
) {
  const total = questions.length;
  let correct = 0;
  const byDomain: Record<Domain, { correct: number; total: number }> = {
    "cloud-concepts":        { correct: 0, total: 0 },
    "security-compliance":   { correct: 0, total: 0 },
    "cloud-technology":      { correct: 0, total: 0 },
    "billing-pricing-support": { correct: 0, total: 0 },
  };
  for (const q of questions) {
    const ok = isCorrect(q, answers[q.id] ?? []);
    byDomain[q.domain].total += 1;
    if (ok) {
      correct += 1;
      byDomain[q.domain].correct += 1;
    }
  }
  const percent = total === 0 ? 0 : correct / total;
  const scaled  = Math.round(100 + percent * 900);  // 100..1000
  const passed  = scaled >= 700;
  return { total, correct, percent, scaled, passed, byDomain };
}
```

The scaled value is labeled in the UI as an **estimate**. AWS's actual scaling is non-linear and not published, so we don't pretend to reproduce it.

---

## Session lifecycle

1. **Setup** (`/`): user picks settings. `<form>` submits → write `Settings` to localStorage → navigate to `/practice`.
2. **Practice** (`/practice`):
   - On mount, `useExamSession` looks for an in-progress session in localStorage.
     - If found and not expired → resume.
     - Else → build a new session from current `Settings` and store it.
   - Every change to `answers` / `currentIndex` is persisted (debounced ~250ms).
   - Timer ticks via `useTimer`; on expiry → `submit()` is called automatically.
   - User submit → `submitted = true` → navigate to `/results`.
3. **Results** (`/results`):
   - Reads the submitted session from localStorage. If none, redirects to `/`.
   - Renders `<ResultsSummary>` + `<ReviewPanel>`.
   - "Retake" returns to `/` with current settings prefilled.

LocalStorage keys (typed in `src/lib/storage.ts`):
- `ish-aws:settings` — last Settings.
- `ish-aws:session` — current SessionState.

---

## Timer

`hooks/use-timer.ts` exposes `{ remainingMs, mmss, state }` where `state` is `"normal" | "warning" | "critical" | "expired"`. Driven by `requestAnimationFrame` and re-renders only when `mmss` flips a second (cheap). On `state === "expired"`, the consumer auto-submits.

---

## Adding questions

1. Open `data/questions.json`.
2. Append an object matching the schema. The `id` must be unique; prefer `ccp-0066`, `ccp-0067`, …
3. `npm run build` will fail if anything's invalid (Zod runs as part of the module that loads the JSON, and Next.js imports it during the build). The error message will name the offending question.

Authoring tips:
- Keep prompts under ~60 words. CCP-style prompts are scenarios, not trivia.
- For multi questions, set `selectCount` and ensure `correct.length === selectCount`.
- Always write an `explanation`. The review screen is where most learning happens.
- Tag the right `domain` — the results page breaks down performance by domain.

---

## Why no backend

Three reasons:
1. **Privacy.** Practice data is sensitive (it tells you which AWS topics you don't know). Keeping it on-device removes any "should we collect this" question.
2. **Zero ops.** A static site costs $0 on Vercel and never goes down for maintenance.
3. **Open source friendliness.** Anyone can fork, swap their own `questions.json`, and deploy. No infra setup, no secrets, no schema migrations.

If a future version needs sync across devices, the right move is to add an *optional* sync layer (e.g. encrypted blob on a user's own storage provider) — not to turn the app into a stateful service.

---

## Verification

End-to-end checks before calling a change "done":

1. `npm run typecheck` — clean.
2. `npm run lint` — clean.
3. `npm run build` — clean. The build also validates `questions.json` (Zod).
4. `npm run dev` — manually run a session in each display mode, force a multi-response wrong, force a timer expiry on a 1-minute session.
5. Resize to 375px — no horizontal scroll, all controls reachable.
6. Toggle dark/light — no token leaks, contrast still holds.
