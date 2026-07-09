import { Construction } from "lucide-react";

export function WorkInProgress({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200/60 bg-white p-10 text-center shadow-soft dark:border-white/10 dark:bg-pitch-900/70">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-ink">
        <Construction size={26} />
      </div>
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-gold-700 dark:text-gold-300">
          Work in Progress
        </p>
        <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
