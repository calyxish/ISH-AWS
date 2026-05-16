"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const order = ["system", "light", "dark"] as const;
type Mode = (typeof order)[number];

const labels: Record<Mode, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (mounted ? (theme as Mode) : "system") ?? "system";
  const next = order[(order.indexOf(current) + 1) % order.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${labels[next]}`}
      title={labels[current]}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg",
        "border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]",
        "transition-colors hover:bg-[var(--bubble)]",
      )}
    >
      {!mounted || current === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : current === "light" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
