"use client";

import { BarChart3 } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";

export function ShopSalesHistory() {
  const { shopOrders, shopOrderItems } = useAppData();
  const acceptedOrderIds = new Set(
    shopOrders.filter((o) => o.status === "accepted").map((o) => o.id)
  );
  const acceptedItems = shopOrderItems.filter((i) => acceptedOrderIds.has(i.order_id));

  const totals = new Map<string, { styleName: string; size: string; quantity: number }>();
  for (const item of acceptedItems) {
    const key = `${item.style_name_snapshot}::${item.size_snapshot}`;
    const existing = totals.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      totals.set(key, {
        styleName: item.style_name_snapshot,
        size: item.size_snapshot,
        quantity: item.quantity,
      });
    }
  }
  const rows = Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity);
  const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <Card>
      <CardHeader title="Sales History" subtitle={`${totalUnits} units sold`} icon={<BarChart3 size={16} />} />
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No accepted orders yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {rows.map((row) => (
            <li
              key={`${row.styleName}::${row.size}`}
              className="flex items-center justify-between gap-2 px-4 py-2.5"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {row.styleName} · {row.size}
              </span>
              <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {row.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
