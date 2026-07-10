"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { AttendanceBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, Profile } from "@/types";

export function SignupsDrawer({
  status,
  people,
  onClose,
}: {
  status: AttendanceStatus | null;
  people: Profile[];
  onClose: () => void;
}) {
  const open = status !== null;
  const [displayed, setDisplayed] = useState<AttendanceStatus | null>(null);
  const [entered, setEntered] = useState(false);

  // Render-time state adjustments (same pattern as SponsorDrawer): keep
  // showing the last status's content while the panel animates closed, and
  // reset the entrance flag so the next open animates in again.
  if (status && status !== displayed) {
    setDisplayed(status);
  }
  if (!open && entered) {
    setEntered(false);
  }

  // Delay the entrance transition by one frame: a CSS transition can't
  // animate if the element is already painted at its target state.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Keep the panel mounted briefly after close so the exit transition has
  // something to animate away, then drop the content.
  useEffect(() => {
    if (open || !displayed) return;
    const timeout = setTimeout(() => setDisplayed(null), 200);
    return () => clearTimeout(timeout);
  }, [open, displayed]);

  useEffect(() => {
    if (!displayed) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [displayed, onClose]);

  if (!displayed) return null;

  const visible = open && entered;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${displayed} signups`}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200/70 bg-white shadow-xl transition-transform duration-200 dark:border-white/10 dark:bg-pitch-900",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <h2 className="truncate font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {displayed} ({people.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="flex-1 divide-y divide-slate-100 dark:divide-white/10">
          {people.map((profile) => (
            <li key={profile.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile.full_name}
              </p>
              <AttendanceBadge status={displayed} />
            </li>
          ))}
          {people.length === 0 && (
            <li className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              Nobody here yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
