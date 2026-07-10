"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { SponsorLogo } from "@/components/info/SponsorLogo";
import type { Sponsor } from "@/components/info/sponsors-data";
import { cn } from "@/lib/utils";

// Tiny line-based markup for `Sponsor.details`: "## " starts a subheading,
// "- " lines group into a bulleted list, anything else is a plain paragraph.
// Lets one sponsor (Muscle Lab's multi-step package deal) have structure
// without turning the data model into a rich content schema for everyone else.
function renderDetails(details: string[]) {
  const nodes: React.ReactNode[] = [];
  let currentList: string[] = [];

  function flushList(key: string) {
    if (currentList.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc space-y-1 pl-5">
        {currentList.map((item, i) => (
          <li key={i} className="text-sm text-slate-700 dark:text-slate-200">
            {item}
          </li>
        ))}
      </ul>
    );
    currentList = [];
  }

  details.forEach((line, idx) => {
    if (line.startsWith("- ")) {
      currentList.push(line.slice(2));
      return;
    }
    flushList(`list-${idx}`);
    if (line.startsWith("## ")) {
      nodes.push(
        <p
          key={idx}
          className="mt-3 text-[11px] font-bold uppercase tracking-wide text-green-700 first:mt-0 dark:text-green-400"
        >
          {line.slice(3)}
        </p>
      );
    } else {
      nodes.push(
        <p key={idx} className="text-sm text-slate-700 dark:text-slate-200">
          {line}
        </p>
      );
    }
  });
  flushList("list-end");
  return nodes;
}

export function SponsorDrawer({
  sponsor,
  onClose,
}: {
  sponsor: Sponsor | null;
  onClose: () => void;
}) {
  const open = sponsor !== null;
  const [displayed, setDisplayed] = useState<Sponsor | null>(null);
  const [entered, setEntered] = useState(false);

  // Render-time state adjustments (React's documented pattern for deriving
  // state from a prop change — pure and synchronous, so not effects):
  // keep showing the last sponsor's content while the panel animates closed,
  // and reset the entrance flag so the next open animates in again.
  if (sponsor && sponsor !== displayed) {
    setDisplayed(sponsor);
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
        aria-label={`${displayed.name} sponsor details`}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200/70 bg-white shadow-xl transition-transform duration-200 dark:border-white/10 dark:bg-pitch-900",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <SponsorLogo
              name={displayed.name}
              logoSrc={displayed.logoSrc}
              className="h-11 w-11 rounded-2xl text-sm"
            />
            <h2 className="truncate font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              {displayed.name}
            </h2>
          </div>
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

        <div className="flex flex-1 flex-col gap-1 p-4">{renderDetails(displayed.details)}</div>

        {displayed.website && (
          <div className="border-t border-slate-100 p-4 dark:border-white/10">
            <a
              href={displayed.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-pitch-900"
            >
              Visit website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
