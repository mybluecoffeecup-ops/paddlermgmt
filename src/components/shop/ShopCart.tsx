"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { useShopCart } from "@/hooks/use-shop-cart";
import { cn } from "@/lib/utils";

export function ShopCart({
  open,
  onClose,
  cart,
}: {
  open: boolean;
  onClose: () => void;
  cart: ReturnType<typeof useShopCart>;
}) {
  const { submitShopOrder } = useAppData();
  const [shouldRender, setShouldRender] = useState(false);
  const [entered, setEntered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Render-time state adjustments (same pattern as SponsorDrawer/
  // ShopStyleDetail): keep the drawer mounted while it animates closed,
  // and reset the entrance flag so the next open animates in again.
  if (open && !shouldRender) {
    setShouldRender(true);
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
    if (open || !shouldRender) return;
    const timeout = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timeout);
  }, [open, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  const visible = open && entered;

  async function handleSubmit() {
    if (cart.cart.length === 0) return;
    setSubmitting(true);
    try {
      await submitShopOrder(cart.cart);
      cart.clearCart();
      onClose();
    } finally {
      setSubmitting(false);
    }
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
        aria-label="Cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200/70 bg-white shadow-xl transition-transform duration-200 dark:border-white/10 dark:bg-pitch-900",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            <ShoppingCart size={16} /> Cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {cart.cart.length === 0 ? (
          <p className="flex-1 px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            Your cart is empty.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-slate-100 dark:divide-white/10">
            {cart.cart.map((line) => (
              <li
                key={`${line.styleId}-${line.size}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.imageUrl}
                      alt={line.styleName}
                      className="h-full w-full object-cover object-left"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {line.styleName}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Size {line.size}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      line.quantity <= 1
                        ? cart.removeLine(line.styleId, line.size)
                        : cart.updateQuantity(line.styleId, line.size, line.quantity - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 text-slate-700 hover:border-green-700 dark:border-white/10 dark:text-slate-200"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => cart.updateQuantity(line.styleId, line.size, line.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 text-slate-700 hover:border-green-700 dark:border-white/10 dark:text-slate-200"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${line.styleName}`}
                  onClick={() => cart.removeLine(line.styleId, line.size)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-redcard-500/15 hover:text-redcard-700 dark:text-slate-300"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-100 p-4 dark:border-white/10">
          <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {cart.totalCount} item{cart.totalCount === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={cart.cart.length === 0 || submitting}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
          >
            {submitting ? "Submitting…" : "Submit order"}
          </button>
        </div>
      </div>
    </div>
  );
}
