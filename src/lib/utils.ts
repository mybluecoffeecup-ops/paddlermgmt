import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Locale is pinned explicitly (rather than left as `undefined`) so the
// server-rendered string always matches the client's first render —
// `undefined` defers to the host's default locale, which differs between
// the Node SSR process and the browser and causes hydration mismatches.
export function formatSessionDate(dateStr: string, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m);
  return (
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) + ` · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
  );
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function getCountdown(targetDateStr: string, now: Date = new Date()): Countdown {
  const target = new Date(`${targetDateStr}T00:00:00`);
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);
  return { days, hours, minutes, seconds, isPast };
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kg.toFixed(1)} kg`;
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDaysIso(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}
