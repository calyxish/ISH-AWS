import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        <p className="font-sans">
          ISH-AWS is open source under the{" "}
          <Link
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--fg)] hover:decoration-[var(--accent)]"
          >
            MIT License
          </Link>
          . Not affiliated with Amazon Web Services. &ldquo;AWS&rdquo; and &ldquo;Certified Cloud
          Practitioner&rdquo; are trademarks of Amazon.com, Inc.
        </p>
      </div>
    </footer>
  );
}
