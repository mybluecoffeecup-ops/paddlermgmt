"use client";

import { useState } from "react";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import type { ShopStyle } from "@/types";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

function StyleForm({ initial, onDone }: { initial?: ShopStyle; onDone: () => void }) {
  const { createShopStyle, updateShopStyle, shopSizeCharts } = useAppData();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [sizeChartId, setSizeChartId] = useState(initial?.size_chart_id ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  const canSubmit = name.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    const patch = {
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
      image_url: imageUrl.trim() === "" ? null : imageUrl.trim(),
      size_chart_id: sizeChartId === "" ? null : sizeChartId,
      active,
    };
    if (initial) {
      updateShopStyle(initial.id, patch);
    } else {
      createShopStyle(patch);
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-white/10">
      <div>
        <label className={labelClassName}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClassName}
          placeholder="Club Hoodie"
        />
      </div>
      <div>
        <label className={labelClassName}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClassName}
        />
      </div>
      <div>
        <label className={labelClassName}>Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inputClassName}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelClassName}>Size chart</label>
        <select
          value={sizeChartId}
          onChange={(e) => setSizeChartId(e.target.value)}
          className={inputClassName}
        >
          <option value="">None</option>
          {shopSizeCharts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Active (visible to paddlers)
      </label>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> {initial ? "Save Changes" : "Add Style"}
      </button>
    </div>
  );
}

function SizeRow({ styleId }: { styleId: string }) {
  const { shopStyleSizes, createShopStyleSize, updateShopStyleSize, deleteShopStyleSize } =
    useAppData();
  const sizes = shopStyleSizes.filter((s) => s.style_id === styleId);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("0");

  function handleAddSize() {
    if (newSize.trim() === "") return;
    createShopStyleSize({
      style_id: styleId,
      size: newSize.trim(),
      stock_count: Math.max(0, Number(newStock) || 0),
    });
    setNewSize("");
    setNewStock("0");
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      {sizes.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
            {s.size}
          </span>
          <input
            type="number"
            min={0}
            value={s.stock_count}
            onChange={(e) =>
              updateShopStyleSize(s.id, { stock_count: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-24 rounded-xl border border-slate-200/70 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
          />
          <span className="text-[11px] font-semibold text-slate-500">in stock</span>
          <button
            type="button"
            aria-label={`Remove size ${s.size}`}
            onClick={() => deleteShopStyleSize(s.id)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-slate-600 hover:bg-redcard-500/15 hover:text-redcard-700 dark:text-slate-300"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Size (e.g. M)"
          className="w-24 rounded-xl border border-slate-200/70 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
        />
        <input
          type="number"
          min={0}
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          className="w-24 rounded-xl border border-slate-200/70 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAddSize}
          className="flex items-center gap-1 rounded-full border border-slate-200/70 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-green-700 hover:text-green-700 dark:border-white/10 dark:text-slate-200"
        >
          <Plus size={12} /> Add size
        </button>
      </div>
    </div>
  );
}

export function ShopStyleManager() {
  const { shopStyles } = useAppData();
  const [formMode, setFormMode] = useState<"none" | "create" | ShopStyle>("none");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isFormOpen = formMode !== "none";

  return (
    <Card>
      <CardHeader
        title="Styles & Stock"
        subtitle={`${shopStyles.length} styles`}
        icon={<Package size={16} />}
        action={
          <button
            type="button"
            onClick={() => setFormMode(isFormOpen ? "none" : "create")}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
          >
            {isFormOpen ? <X size={13} /> : <Plus size={13} />}
            {isFormOpen ? "Cancel" : "New Style"}
          </button>
        }
      />
      {isFormOpen ? (
        <StyleForm
          initial={formMode === "create" ? undefined : formMode}
          onDone={() => setFormMode("none")}
        />
      ) : shopStyles.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No styles yet.
        </p>
      ) : (
        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
          {shopStyles.map((style) => (
            <li key={style.id}>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {style.name}
                    {!style.active && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Inactive
                      </span>
                    )}
                  </p>
                  {style.description && (
                    <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {style.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedId((id) => (id === style.id ? null : style.id))}
                    className="rounded-full border border-slate-200/70 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:border-green-700 hover:text-green-700 dark:border-white/10 dark:text-slate-200"
                  >
                    Sizes
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${style.name}`}
                    onClick={() => setFormMode(style)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
              {expandedId === style.id && <SizeRow styleId={style.id} />}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
