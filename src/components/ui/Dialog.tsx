"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant: "primary" | "caution" | "ghost";
  autoFocus?: boolean;
}

const VARIANT_CLASSES: Record<DialogAction["variant"], string> = {
  primary: "bg-green-700 text-white hover:bg-green-800",
  caution: "bg-gold-500 text-ink hover:bg-gold-400",
  ghost:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5",
};

export function Dialog({
  open,
  title,
  description,
  actions,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description?: string;
  actions: DialogAction[];
  onOpenChange: (open: boolean) => void;
}) {
  const autoFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    autoFocusRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-sm rounded-md border-2 border-ink bg-white p-5 dark:border-white/40 dark:bg-pitch-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="dialog-title"
          className="font-display text-lg font-bold uppercase tracking-wide text-ink dark:text-white"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {description}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              ref={action.autoFocus ? autoFocusRef : undefined}
              onClick={action.onClick}
              className={cn(
                "rounded px-4 py-2 text-xs font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                VARIANT_CLASSES[action.variant]
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
