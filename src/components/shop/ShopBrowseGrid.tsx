"use client";

import { ShoppingBag } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import type { ShopStyle } from "@/types";

export function ShopBrowseGrid({ onSelectStyle }: { onSelectStyle: (style: ShopStyle) => void }) {
  const { shopStyles } = useAppData();
  const activeStyles = shopStyles.filter((s) => s.active);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Browse"
        subtitle={`${activeStyles.length} styles available`}
        icon={<ShoppingBag size={16} />}
      />
      {activeStyles.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No styles available right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4">
          {activeStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style)}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 p-2 text-left transition-all hover:border-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10"
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                {style.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={style.image_url}
                    alt={style.name}
                    className="h-full w-full object-cover object-left"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div>
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {style.name}
                </p>
                {style.description && (
                  <p className="line-clamp-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {style.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
