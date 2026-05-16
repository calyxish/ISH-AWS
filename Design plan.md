# Design Plan

ISH-AWS uses a warm, editorial visual language — closer to a quality reading app than a dashboard. The goal is to make sitting down to practice feel like opening a book, not logging into a console.

---

## Principles

1. **Warm over cold.** Cream and terracotta, not white-on-blue. Studying is unpleasant enough without a clinical UI.
2. **Borders, not shadows.** Every surface is defined by a single hairline border. No drop shadows anywhere. Flat depth, like a printed page.
3. **Serif for reading.** Long prose — prompts, explanations, headings — is set in a serif (Fraunces). Sans-serif (Inter) is reserved for small interface labels: timer digits, button text, badges.
4. **Color is never the only signal.** Correct/incorrect always carry an icon as well as a hue. Pass/fail always carry a word.
5. **No emoji.** Anywhere. Use lucide icons or text.

---

## Color tokens

Tokens are CSS variables on `:root` (light) and `.dark` (dark) inside `src/app/globals.css`. Tailwind v4 maps utility classes onto them via `@theme`.

| Token        | Light       | Dark        | Purpose                                          |
|--------------|-------------|-------------|--------------------------------------------------|
| `--bg`       | `#F0ECE0`   | `#2b2a27`   | Page background                                  |
| `--surface`  | `#ffffff`   | `#1f1e1b`   | Cards, composer-like inputs                      |
| `--border`   | `#E5E0D6`   | `#3d3a35`   | Hairline borders                                 |
| `--bubble`   | `#E5E0D6`   | `#393937`   | User-message-like surfaces (selected option fill)|
| `--fg`       | `#1a1a18`   | `#eeeeee`   | Primary text                                     |
| `--muted`    | `#5b5950`   | `#a3a098`   | Secondary text, captions, helper text            |
| `--accent`   | `#c96442`   | `#c96442`   | Primary action, highlights, "ISH" dot            |
| `--success`  | `#5b8a5a`   | `#7fb07e`   | Correct-answer state                             |
| `--danger`   | `#a8533d`   | `#d68a72`   | Incorrect-answer state, time-critical warnings   |

The accent is intentionally the same in both modes — the terracotta is the through-line.

---

## Type

- **Display + body**: [Fraunces](https://fonts.google.com/specimen/Fraunces), loaded via `next/font/google`. Used for prompts, explanations, headings, score banner.
- **UI labels**: Inter, loaded the same way. Used for buttons, timer digits, badges, the question grid in the drawer.
- **Reading rhythm**: `line-height: 1.65rem` on prompts and explanations. Default `1.5` everywhere else.

Type scale:

| Role            | Size           | Weight | Family   |
|-----------------|----------------|--------|----------|
| Page H1         | 2rem / 2.5rem  | 500    | Fraunces |
| Section H2      | 1.5rem / 2rem  | 500    | Fraunces |
| Question prompt | 1.25rem / 1.75 | 450    | Fraunces |
| Body            | 1rem / 1.65    | 400    | Fraunces |
| UI label        | 0.875rem       | 500    | Inter    |
| Timer digits    | 1.125rem       | 500    | Inter (tabular numerals) |

---

## Components

### Card
- Background: `--surface`
- Border: `1px solid --border`
- Radius: `1rem` (`rounded-2xl`)
- Padding: `1.25rem` (mobile) → `1.5rem` (≥768px)
- No shadow.

### Button
- **Primary**: solid `--accent` fill, `--surface`-colored text. Hover slightly darker.
- **Secondary**: `--surface` fill, `--border` outline, `--fg` text.
- **Ghost**: transparent fill, `--fg` text, hover fills `--bubble`.
- Radius `0.5rem`, height `2.5rem`, min-touch-target 44×44 on mobile.

### Radio / Checkbox (option row)
- Row is the click target. Border `1px solid --border`, radius `0.75rem`, padding `0.75rem 1rem`.
- Selected state: fill `--bubble`, border `--accent`.
- Review correct: border `--success`, lucide `Check` glyph in `--success`.
- Review incorrect chosen: border `--danger`, lucide `X` glyph in `--danger`.
- Review correct missed: border dashed `--success` (so you can tell "you should have picked this").

### Timer
- A pill at top-right. `--surface` background, `--border` border, tabular-numerals Inter.
- States: normal (`--fg`), warning (`--accent` text under 5 minutes), critical (`--danger` text under 1 minute).
- Aria-live polite; screen readers hear minute updates.

### Score banner (results page)
- Full-width band. Pass: `--success` thin top-border, Fraunces "Passed" headline. Fail: `--danger` thin top-border, "Not yet" headline (deliberately gentle — encouraging rather than punitive).
- Below: raw `X / Y`, percentage, scaled estimate with a small caption "AWS uses a scaled 100–1000 system; this is an approximation."

### Domain bar
- Horizontal bar, `--border` track, `--accent` fill. Label left, `correct / total` right.

---

## Layout

- Page width: `max-w-3xl` (768px) centered. Wide enough for comfortable reading, narrow enough to avoid eye-strain line lengths.
- Vertical rhythm: `gap-6` between sections, `gap-3` inside cards.
- Mobile gutters: `px-4`. Desktop: `px-6`.

---

## Theme switching

- `next-themes` with `attribute="class"`, `defaultTheme="system"`.
- Toggle in the top-right of the nav: sun/moon icons from lucide. Three states cycle: system → light → dark.
- Transitions disabled on theme change (`disableTransitionOnChange`) to prevent the flash of mid-transition colors.

---

## Accessibility

- Color contrast ≥ 4.5:1 for body text in both modes (checked against tokens).
- All interactive controls are reachable by keyboard. Focus ring: 2px `--accent`, 2px offset against `--surface`.
- Radio/checkbox use shadcn primitives (Radix under the hood) — correct ARIA roles, keyboard navigation, and grouping for free.
- `prefers-reduced-motion`: respected — transitions become instant, no fades over 100ms.
- Touch targets ≥ 44×44 on mobile.

---

## Logo

A wordmark — serif "ISH" in `--fg` followed by a solid `--accent` circle baseline-aligned with the cap height. The favicon collapses this to a single "I" with the dot, since "ISH" is unreadable at 16×16.

The wordmark also serves as the OG image (1200×630) with the strapline "AWS Cloud Practitioner — focused practice." centered beneath it.

---

## What we deliberately *don't* do

- No drop shadows.
- No skeuomorphic gradients or glass effects.
- No avatars or chat-bubble icons.
- No emoji.
- No animations longer than 150ms (and none on theme change).
- No third-party fonts beyond Fraunces + Inter.
