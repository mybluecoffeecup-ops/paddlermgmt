"use client";

import { useState } from "react";
import { ClipboardList, Minus, Pencil, Plus, Trash2, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { ShopOrderStatusBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import type { CartLine } from "@/types";

export function MyOrders() {
  const { shopOrders, currentUserId, shopOrderItemsFor, updateShopOrderItems, cancelShopOrder } =
    useAppData();
  // Mock mode has no server-side RLS to scope shopOrders to the caller, so
  // this filters client-side too (mirrors NotificationBell's audience
  // filter for the same reason).
  const myOrders = [...shopOrders]
    .filter((o) => o.paddler_id === currentUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editLines, setEditLines] = useState<CartLine[]>([]);

  function startEdit(orderId: string) {
    const items = shopOrderItemsFor(orderId);
    setEditLines(
      items.map((i) => ({
        styleId: i.style_id ?? "",
        size: i.size,
        quantity: i.quantity,
        styleName: i.style_name_snapshot,
        imageUrl: null,
      }))
    );
    setEditingOrderId(orderId);
  }

  function saveEdit() {
    if (!editingOrderId || editLines.length === 0) return;
    updateShopOrderItems(editingOrderId, editLines);
    setEditingOrderId(null);
  }

  return (
    <Card>
      <CardHeader
        title="My Orders"
        subtitle={`${myOrders.length} orders`}
        icon={<ClipboardList size={16} />}
      />
      {myOrders.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          You haven&apos;t placed any orders yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {myOrders.map((order) => {
            const items = shopOrderItemsFor(order.id);
            const isEditing = editingOrderId === order.id;
            return (
              <li key={order.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(order.created_at)}
                  </p>
                  <ShopOrderStatusBadge status={order.status} />
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 p-3 dark:border-white/10">
                    {editLines.map((line, idx) => (
                      <div key={`${line.styleId}-${line.size}`} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {line.styleName} · {line.size}
                        </span>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setEditLines((prev) =>
                              prev.map((l, i) =>
                                i === idx ? { ...l, quantity: Math.max(1, l.quantity - 1) } : l
                              )
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 dark:border-white/10"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setEditLines((prev) =>
                              prev.map((l, i) => (i === idx ? { ...l, quantity: l.quantity + 1 } : l))
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 dark:border-white/10"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove line"
                          onClick={() => setEditLines((prev) => prev.filter((_, i) => i !== idx))}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 hover:bg-redcard-500/15 hover:text-redcard-700 dark:text-slate-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={editLines.length === 0}
                        className="flex-1 rounded-xl bg-green-700 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-40"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingOrderId(null)}
                        className="flex-1 rounded-xl border border-slate-200/70 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:border-white/10 dark:text-slate-200"
                      >
                        Cancel edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {items.map((item) => (
                      <li key={item.id} className="text-sm text-slate-700 dark:text-slate-200">
                        {item.quantity}× {item.style_name_snapshot} ({item.size_snapshot})
                      </li>
                    ))}
                  </ul>
                )}

                {order.status === "pending" && !isEditing && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(order.id)}
                      className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-green-700 hover:text-green-700 dark:border-white/10 dark:text-slate-200"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelShopOrder(order.id)}
                      className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-redcard-500 hover:text-redcard-700 dark:border-white/10 dark:text-slate-200"
                    >
                      <X size={12} /> Cancel order
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
