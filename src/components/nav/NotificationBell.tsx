"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { cn, formatRelativeTime } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, currentUserId, role, markNotificationRead } = useAppData();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock mode has no server-side RLS to scope 'coach'-audience rows to
  // coaches only, so this filter has to happen client-side too.
  const visible = notifications.filter((n) => n.audience === "all" || role === "coach");
  const sorted = [...visible].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const unreadCount = sorted.filter((n) => !n.read_by.includes(currentUserId)).length;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(notification: (typeof sorted)[number]) {
    markNotificationRead(notification.id);
    setOpen(false);
    if (notification.session_id) router.push(`/sessions/${notification.session_id}`);
    else if (notification.race_id) router.push(`/races/${notification.race_id}`);
    else if (notification.order_id) router.push("/orders");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-soft transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft-lg dark:border-white/10 dark:bg-pitch-900">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-white/10">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              Notifications
            </p>
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
            {sorted.map((notification) => {
              const unread = !notification.read_by.includes(currentUserId);
              return (
                <li key={notification.id}>
                  <button
                    onClick={() => handleSelect(notification)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5",
                      unread && "bg-green-500/5 dark:bg-green-400/5"
                    )}
                  >
                    <div className="flex w-full items-center gap-1.5">
                      {unread && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
                      )}
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {notification.body}
                    </p>
                    <p
                      className="text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </button>
                </li>
              );
            })}
            {sorted.length === 0 && (
              <li className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                No notifications yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
