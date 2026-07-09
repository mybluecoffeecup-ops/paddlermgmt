import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/60 bg-white shadow-soft dark:border-white/10 dark:bg-pitch-900/70",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700 dark:text-gold-300">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
