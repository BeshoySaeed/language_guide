"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="grid size-11 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      <Moon aria-hidden="true" className="size-[18px] dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-[18px] dark:block" />
    </button>
  );
}
