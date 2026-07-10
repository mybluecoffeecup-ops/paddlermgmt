"use client";

import { useEffect } from "react";

/**
 * Warns before the user leaves a page with unsaved changes. App Router has
 * no router-level navigation-blocking hook, so this combines a native
 * `beforeunload` listener (tab close / refresh / typed URL) with a
 * capture-phase click listener that intercepts in-app `<Link>` clicks
 * (every internal nav in this app renders a plain `<a href="/...">`) before
 * Next's own click handler runs. It only detects intent — `onIntercept`
 * decides what happens next (e.g. show a Save/Discard/Cancel dialog).
 */
export function useUnsavedChangesGuard(isDirty: boolean, onIntercept: (href: string) => void) {
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      event.preventDefault();
      event.stopPropagation();
      onIntercept(href);
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [isDirty, onIntercept]);
}
