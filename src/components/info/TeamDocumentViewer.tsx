"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { getDocumentEmbed } from "@/lib/document-utils";
import type { TeamDocument } from "@/types";
import { cn } from "@/lib/utils";

export function TeamDocumentViewer({
  document,
  onClose,
}: {
  document: TeamDocument | null;
  onClose: () => void;
}) {
  const open = document !== null;
  const [displayed, setDisplayed] = useState<TeamDocument | null>(null);
  const [entered, setEntered] = useState(false);

  // Render-time state adjustments (React's documented pattern for deriving
  // state from a prop change — pure and synchronous, so not effects):
  // keep showing the last document's content while the panel animates
  // closed, and reset the entrance flag so the next open animates in again.
  if (document && document !== displayed) {
    setDisplayed(document);
  }
  if (!open && entered) {
    setEntered(false);
  }

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

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
  const { embedUrl } = getDocumentEmbed(displayed.url);

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
        aria-label={`${displayed.title} document viewer`}
        className={cn(
          "absolute inset-2 flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl transition-all duration-200 md:inset-8 lg:inset-12 dark:border-white/10 dark:bg-pitch-900",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <h2 className="min-w-0 truncate font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {displayed.title}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={displayed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200/70 px-3 text-xs font-bold uppercase tracking-wide text-slate-700 transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
            >
              <ExternalLink size={13} />
              Open in new tab
            </a>
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
        </div>

        <div className="flex-1">
          {embedUrl ? (
            <iframe src={embedUrl} title={displayed.title} className="h-full w-full border-0" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                This document opens in a new tab.
              </p>
              <a
                href={displayed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-pitch-900"
              >
                <ExternalLink size={15} />
                Open {displayed.title}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
