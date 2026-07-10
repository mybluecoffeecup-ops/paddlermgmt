"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App segment render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
      <AlertTriangle className="text-redcard-500" size={32} />
      <h2 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
        Something went wrong loading this page
      </h2>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-2xl bg-green-700 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-green-800"
      >
        Try again
      </button>
    </div>
  );
}
