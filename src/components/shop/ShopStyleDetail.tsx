"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Minus, Plus, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import type { CartLine, ShopStyle } from "@/types";
import { cn } from "@/lib/utils";

export function ShopStyleDetail({
  style,
  onClose,
  onAddToCart,
}: {
  style: ShopStyle | null;
  onClose: () => void;
  onAddToCart: (line: CartLine) => void;
}) {
  const { shopStyleSizes, shopSizeCharts } = useAppData();
  const open = style !== null;
  const [displayed, setDisplayed] = useState<ShopStyle | null>(null);
  const [entered, setEntered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Render-time state adjustments (React's documented pattern for deriving
  // state from a prop change — pure and synchronous, so not effects): keep
  // showing the last style's content while the panel animates closed, and
  // reset the entrance flag plus form fields so the next open starts fresh.
  if (style && style !== displayed) {
    setDisplayed(style);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeChart(false);
  }
  if (!open && entered) {
    setEntered(false);
  }

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (open || !displayed) return;
    const timeout = setTimeout(() => setDisplayed(null), 200);
    return () => clearTimeout(timeout);
  }, [open, displayed]);

  useEffect(() => {
    if (!displayed) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [displayed, onClose]);

  if (!displayed) return null;

  const visible = open && entered;
  const sizes = shopStyleSizes.filter((s) => s.style_id === displayed.id);
  const sizeChart = displayed.size_chart_id
    ? shopSizeCharts.find((c) => c.id === displayed.size_chart_id)
    : null;

  function handleAdd() {
    if (!displayed || !selectedSize) return;
    onAddToCart({
      styleId: displayed.id,
      size: selectedSize,
      quantity,
      styleName: displayed.name,
      imageUrl: displayed.image_url,
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${displayed.name} details`}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200/70 bg-white shadow-xl transition-transform duration-200 dark:border-white/10 dark:bg-pitch-900",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <h2 className="truncate font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {displayed.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {displayed.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayed.image_url}
              alt={displayed.name}
              className="w-full rounded-2xl bg-slate-100 dark:bg-white/5"
            />
          )}
          {displayed.description && (
            <p className="text-sm text-slate-700 dark:text-slate-200">{displayed.description}</p>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Size
            </p>
            {sizes.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">No sizes configured yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => {
                  const outOfStock = s.stock_count <= 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(s.size)}
                      className={cn(
                        "flex h-10 min-w-10 items-center justify-center rounded-xl border-2 px-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                        outOfStock
                          ? "cursor-not-allowed border-slate-200 text-slate-300 line-through dark:border-white/10 dark:text-slate-600"
                          : selectedSize === s.size
                            ? "border-green-700 bg-green-700 text-white"
                            : "border-slate-200 text-slate-700 hover:border-green-700 dark:border-white/10 dark:text-slate-200"
                      )}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {sizeChart && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowSizeChart((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200"
              >
                Find my size
                <ChevronDown
                  size={15}
                  className={cn("transition-transform", showSizeChart && "rotate-180")}
                />
              </button>
              {showSizeChart && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sizeChart.image_url}
                  alt={sizeChart.name}
                  className="w-full border-t border-slate-100 dark:border-white/10"
                />
              )}
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-700 hover:border-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-200"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-700 hover:border-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-200"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 dark:border-white/10">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedSize}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
