# ISH-AWS

A warm, focused practice site for the **AWS Certified Cloud Practitioner (CLF-C02)** exam.

ISH-AWS is a single-page Next.js app with no backend. Questions live in a JSON file. You pick how many questions, how long, how they're ordered, and how they're displayed; the app times you, scores you with the same all-or-nothing rule AWS uses for multi-response items, and lets you review every question afterwards with an explanation.

Designed to feel calm and editorial — cream surfaces, terracotta accent, serif type — rather than the cold dashboard look most exam-prep sites default to.

---

## Features

- **Practice setup** — choose 5–65 questions, 10–90 minutes, ordering (Random / First N / Last N / Middle N), and display mode (one-by-one or all-at-once).
- **Faithful CCP scoring** — multi-response questions require *all* correct options selected for credit, matching the real exam. Raw score plus an estimated AWS-style scaled score (100–1000, pass at 700).
- **Review mode** — after submitting, walk through every question with your answer, the correct answer, and an explanation. Filter by incorrect-only or by domain.
- **Light + dark theme** — warm cream / charcoal, terracotta accent in both modes. Respects OS preference, remembers your choice.
- **Mobile-first responsive** — works on a phone, tablet, or desktop.
- **No backend, no tracking, no accounts** — your session and settings are stored in `localStorage` only.

---

## Run locally

```bash
git clone https://github.com/<your-user>/ISH-AWS.git
cd ISH-AWS
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Deploy

Push to GitHub, import the repo on [Vercel](https://vercel.com/new), accept the defaults. The app is a static Next.js project — no environment variables required.

---

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) primitives + [lucide-react](https://lucide.dev) icons
- [next-themes](https://github.com/pacocoursey/next-themes) for theme persistence
- [Zod](https://zod.dev) for validating the question bank

---

## Repository layout

```
ISH-AWS/
  README.md            this file
  Design plan.md       visual design system, tokens, components
  implementation.md    architecture, data flow, scoring algorithm
  data/questions.json  the question bank
  src/                 app source
  public/              icons, favicon, OG image
```

See [`implementation.md`](./implementation.md) for the full file map and how to add new questions.

---

## Contributing questions

The question bank is `data/questions.json`. Every entry follows the schema in [`src/lib/schema.ts`](./src/lib/schema.ts). Open a PR with new questions and the Zod validator will fail your build if anything's malformed — that's intentional.

---

## License

MIT. See [`LICENSE`](./LICENSE).

This project is unaffiliated with Amazon Web Services. "AWS" and "Certified Cloud Practitioner" are trademarks of Amazon.com, Inc.
