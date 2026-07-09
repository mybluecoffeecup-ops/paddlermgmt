"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-ink shadow-soft-lg transition-all hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      <Moon size={22} className="dark:hidden" />
      <Sun size={22} className="hidden dark:block" />
    </button>
  );
}
