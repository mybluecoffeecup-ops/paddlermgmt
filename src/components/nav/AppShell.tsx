"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, User, Users, Waves, Flag, Info, ShoppingBag } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { BrandMark } from "@/components/nav/BrandMark";
import { NotificationBell } from "@/components/nav/NotificationBell";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", mobileLabel: "Home", icon: Waves, coachOnly: false },
  {
    href: "/sessions",
    label: "Session Mgmt",
    mobileLabel: "Sessions",
    icon: Users,
    coachOnly: true,
  },
  { href: "/races", label: "Race Mgmt", mobileLabel: "Races", icon: Flag, coachOnly: false },
  {
    href: "/lineups",
    label: "Lineups",
    mobileLabel: "Lineups",
    icon: LayoutGrid,
    coachOnly: true,
  },
  { href: "/info", label: "Info", mobileLabel: "Info", icon: Info, coachOnly: false },
  {
    href: "/orders",
    label: "Orders",
    mobileLabel: "Orders",
    icon: ShoppingBag,
    coachOnly: false,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, usingLiveBackend, loading, currentUser } = useAppData();

  const resolved = !loading && currentUser !== undefined;
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.coachOnly || !resolved || role === "coach"
  );

  const handleSignOut = async () => {
    await getSupabaseClient()?.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-pitch-900/85 shadow-soft backdrop-blur-md">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
          <div className="justify-self-start">
            <BrandMark variant="header" />
          </div>

          <nav className="hidden items-center gap-1 justify-self-center md:flex">
            {visibleNavItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                    active
                      ? "bg-white/10 text-white shadow-soft"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            {!usingLiveBackend && (
              <span className="hidden rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink sm:inline">
                Demo data
              </span>
            )}
            {usingLiveBackend ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  {role === "coach" ? "Coach" : "Paddler"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex min-h-11 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 text-xs font-bold uppercase tracking-wide">
                <button
                  onClick={() => setRole("paddler")}
                  className={cn(
                    "min-h-9 rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                    role === "paddler"
                      ? "bg-gold-500 text-ink shadow-soft"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  Paddler
                </button>
                <button
                  onClick={() => setRole("coach")}
                  className={cn(
                    "min-h-9 rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                    role === "coach"
                      ? "bg-gold-500 text-ink shadow-soft"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  Coach
                </button>
              </div>
            )}
            <NotificationBell />
            <Link
              href="/profile"
              aria-label="My profile"
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold uppercase text-white shadow-soft transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                pathname === "/profile" && "ring-2 ring-gold-500"
              )}
            >
              {currentUser ? (
                currentUser.full_name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
              ) : (
                <User size={15} />
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 pb-24 pt-4 sm:px-4 md:pb-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-pitch-900/85 shadow-soft-lg backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-[1400px] items-stretch justify-around px-2 py-1.5">
          {visibleNavItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                  active ? "text-gold-500" : "text-white/50"
                )}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.mobileLabel}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
