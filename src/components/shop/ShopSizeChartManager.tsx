"use client";

import { useState } from "react";
import { Plus, Ruler, X } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

function NewChartForm({ onDone }: { onDone: () => void }) {
  const { createShopSizeChart } = useAppData();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const canSubmit = name.trim() !== "" && imageUrl.trim() !== "";

  function handleCreate() {
    if (!canSubmit) return;
    createShopSizeChart({ name: name.trim(), image_url: imageUrl.trim() });
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
          placeholder="Unisex Apparel"
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
      <button
        onClick={handleCreate}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> Add Chart
      </button>
    </div>
  );
}

export function ShopSizeChartManager() {
  const { shopSizeCharts } = useAppData();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Card>
      <CardHeader
        title="Size Charts"
        subtitle={`${shopSizeCharts.length} charts`}
        icon={<Ruler size={16} />}
        action={
          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
          >
            {isCreating ? <X size={13} /> : <Plus size={13} />}
            {isCreating ? "Cancel" : "New Chart"}
          </button>
        }
      />
      {isCreating ? (
        <NewChartForm onDone={() => setIsCreating(false)} />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {shopSizeCharts.map((chart) => (
            <li
              key={chart.id}
              className="px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              {chart.name}
            </li>
          ))}
          {shopSizeCharts.length === 0 && (
            <li className="px-4 py-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              No size charts yet.
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
