import { SetupForm } from "@/components/setup-form";

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-10 flex flex-col gap-3">
        <p className="font-sans text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          AWS Cloud Practitioner
        </p>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-[var(--fg)] sm:text-5xl">
          Practice like it counts.
        </h1>
        <p className="max-w-prose font-serif text-lg text-[var(--muted)] prose-reading">
          Pick a length, a time limit, and how questions are served. ISH-AWS
          will time you, score you the way AWS scores you, and walk you through
          every question afterwards so the next attempt is sharper.
        </p>
      </div>
      <SetupForm />
    </section>
  );
}
