import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="ISH-AWS home"
        >
          <Logo />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
