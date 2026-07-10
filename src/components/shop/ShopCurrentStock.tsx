"use client";

import { Boxes } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";

export function ShopCurrentStock() {
  const { shopStyles, shopStyleSizes } = useAppData();

  return (
    <Card>
      <CardHeader
        title="Current Stock"
        subtitle={`${shopStyles.length} items`}
        icon={<Boxes size={16} />}
      />
      {shopStyles.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No styles yet.
        </p>
      ) : (
        <ul className="max-h-52 divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
          {shopStyles.map((style) => {
            const totalLeft = shopStyleSizes
              .filter((s) => s.style_id === style.id)
              .reduce((sum, s) => sum + s.stock_count, 0);
            return (
              <li
                key={style.id}
                className="flex items-center justify-between gap-2 px-4 py-3"
              >
                <p className="min-w-0 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {style.name}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {totalLeft} left
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200/70 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-green-700 hover:text-green-700 dark:border-white/10 dark:text-slate-200"
                  >
                    Restock
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
