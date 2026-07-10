"use client";

import { useState } from "react";
import { Check, ClipboardCheck, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { ShopOrderStatusBadge } from "@/components/ui/Badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ShopOrderStatus } from "@/types";

const FILTERS: (ShopOrderStatus | "all")[] = ["pending", "accepted", "rejected", "cancelled", "all"];

export function ShopOrderQueue() {
  const { shopOrders, shopOrderItemsFor, profiles, acceptShopOrder, rejectShopOrder } =
    useAppData();
  const [filter, setFilter] = useState<ShopOrderStatus | "all">("pending");
  const [errorByOrder, setErrorByOrder] = useState<Record<string, string>>({});
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const filtered = [...shopOrders]
    .filter((o) => filter === "all" || o.status === filter)
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return b.created_at.localeCompare(a.created_at);
    });

  async function handleAccept(orderId: string) {
    setAcceptingId(orderId);
    setErrorByOrder((prev) => ({ ...prev, [orderId]: "" }));
    const result = await acceptShopOrder(orderId);
    if (!result.ok) {
      setErrorByOrder((prev) => ({ ...prev, [orderId]: result.error }));
    }
    setAcceptingId(null);
  }

  return (
    <Card>
      <CardHeader
        title="Order Queue"
        subtitle={`${shopOrders.length} total orders`}
        icon={<ClipboardCheck size={16} />}
      />
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-2.5 dark:border-white/10">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
              filter === f
                ? "bg-green-700 text-white"
                : "border border-slate-200/70 text-slate-700 hover:border-green-700 hover:text-green-700 dark:border-white/10 dark:text-slate-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No orders here.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {filtered.map((order) => {
            const items = shopOrderItemsFor(order.id);
            const paddler = profiles.find((p) => p.id === order.paddler_id);
            const error = errorByOrder[order.id];
            return (
              <li key={order.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {paddler?.full_name ?? "Unknown paddler"}
                    </p>
                    <p
                      className="text-[11px] font-semibold text-slate-500"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(order.created_at)}
                    </p>
                  </div>
                  <ShopOrderStatusBadge status={order.status} />
                </div>
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <li key={item.id} className="text-sm text-slate-700 dark:text-slate-200">
                      {item.quantity}× {item.style_name_snapshot} ({item.size_snapshot})
                    </li>
                  ))}
                </ul>
                {error && (
                  <p className="rounded-lg bg-redcard-500/15 px-2 py-1 text-xs font-semibold text-redcard-700 dark:bg-redcard-500/25 dark:text-white">
                    {error}
                  </p>
                )}
                {order.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(order.id)}
                      disabled={acceptingId === order.id}
                      className="flex items-center gap-1 rounded-full bg-green-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-green-800 disabled:opacity-40"
                    >
                      <Check size={12} /> {acceptingId === order.id ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectShopOrder(order.id)}
                      className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-redcard-500 hover:text-redcard-700 dark:border-white/10 dark:text-slate-200"
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
