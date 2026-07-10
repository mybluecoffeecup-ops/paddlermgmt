"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { useShopCart } from "@/hooks/use-shop-cart";
import { ShopBrowseGrid } from "@/components/shop/ShopBrowseGrid";
import { ShopStyleDetail } from "@/components/shop/ShopStyleDetail";
import { ShopCart } from "@/components/shop/ShopCart";
import { MyOrders } from "@/components/shop/MyOrders";
import { ShopStyleManager } from "@/components/shop/ShopStyleManager";
import { ShopSizeChartManager } from "@/components/shop/ShopSizeChartManager";
import { ShopOrderQueue } from "@/components/shop/ShopOrderQueue";
import { ShopSalesHistory } from "@/components/shop/ShopSalesHistory";
import { cn } from "@/lib/utils";
import type { ShopStyle } from "@/types";

type Tab = "shop" | "my-orders" | "coach";

export default function OrdersPage() {
  const { role, loading, currentUser } = useAppData();
  const resolved = !loading && currentUser !== undefined;
  const isCoach = resolved && role === "coach";

  const [tab, setTab] = useState<Tab>("shop");
  const [selectedStyle, setSelectedStyle] = useState<ShopStyle | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useShopCart();

  // Render-time state adjustment: if the demo role toggle flips back to
  // paddler while "Coach Tools" is open, don't leave the tab stuck on
  // content the paddler shouldn't see.
  if (tab === "coach" && !isCoach) {
    setTab("shop");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "shop", label: "Shop" },
    { id: "my-orders", label: "My Orders" },
    ...(isCoach ? [{ id: "coach" as const, label: "Coach Tools" }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Orders
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Team gear and apparel orders.
          </p>
        </div>
        {tab === "shop" && (
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-soft transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/20 dark:bg-pitch-900 dark:text-white"
          >
            <ShoppingCart size={18} />
            {cart.totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink">
                {cart.totalCount > 9 ? "9+" : cart.totalCount}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/70 bg-white p-1.5 dark:border-white/10 dark:bg-pitch-900/70">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors",
              tab === t.id
                ? "bg-green-700 text-white shadow-cta"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "shop" && <ShopBrowseGrid onSelectStyle={setSelectedStyle} />}
      {tab === "my-orders" && <MyOrders />}
      {tab === "coach" && isCoach && (
        <div className="flex flex-col gap-4">
          <ShopStyleManager />
          <ShopSizeChartManager />
          <ShopOrderQueue />
          <ShopSalesHistory />
        </div>
      )}

      <ShopStyleDetail
        style={selectedStyle}
        onClose={() => setSelectedStyle(null)}
        onAddToCart={(line) => {
          cart.addLine(line);
          setSelectedStyle(null);
        }}
      />
      <ShopCart open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
    </div>
  );
}
