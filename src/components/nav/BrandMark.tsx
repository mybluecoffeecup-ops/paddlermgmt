import { PaddlesIcon } from "@/components/ui/PaddlesIcon";
import { cn } from "@/lib/utils";

export function BrandMark({ variant = "card" }: { variant?: "header" | "card" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-ink shadow-[0_0_20px_rgba(253,189,28,0.35)]">
        <PaddlesIcon size={18} />
      </div>
      <div className="leading-tight">
        <p
          className={cn(
            "font-display text-base font-bold uppercase tracking-wide",
            variant === "header" ? "text-white" : "text-slate-900 dark:text-slate-100"
          )}
        >
          Paddles Up
        </p>
        <p
          className={cn(
            "text-[11px] font-semibold",
            variant === "header" ? "text-slate-300" : "text-slate-600 dark:text-slate-300"
          )}
        >
          Paddle Sports Crew Management
        </p>
      </div>
    </div>
  );
}
