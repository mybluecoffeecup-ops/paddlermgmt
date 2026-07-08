"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, Users, Waves, Anchor } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Waves },
  { href: "/command-center", label: "Command Center", icon: Users },
  { href: "/lineups", label: "Lineups", icon: LayoutGrid },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, usingLiveBackend } = useAppData();

  const handleSignOut = async () => {
    await getSupabaseClient()?.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#071620] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0b1f2e]/90">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
              <Anchor size={18} strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Paddler</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Crew Management
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/5 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-white text-teal-700 shadow-sm dark:bg-teal-500/20 dark:text-teal-300"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!usingLiveBackend && (
              <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 sm:inline dark:bg-amber-400/10 dark:text-amber-300">
                Demo data
              </span>
            )}
            {usingLiveBackend ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {role === "coach" ? "Coach" : "Paddler"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-white/5">
                <button
                  onClick={() => setRole("paddler")}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-colors",
                    role === "paddler"
                      ? "bg-white text-teal-700 shadow-sm dark:bg-teal-500/20 dark:text-teal-300"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  Paddler
                </button>
                <button
                  onClick={() => setRole("coach")}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-colors",
                    role === "coach"
                      ? "bg-white text-teal-700 shadow-sm dark:bg-teal-500/20 dark:text-teal-300"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  Coach
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 pb-24 pt-4 sm:px-4 md:pb-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-white/10 dark:bg-[#0b1f2e]/95">
        <div className="mx-auto flex max-w-[1400px] items-stretch justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "text-teal-600 dark:text-teal-300"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.label === "Command Center" ? "Coach" : item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
