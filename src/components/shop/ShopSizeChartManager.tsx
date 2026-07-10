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
  const [imageDataUrl, setImageDataUrl] = useState("");
  const canSubmit = name.trim() !== "" && imageDataUrl !== "";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCreate() {
    if (!canSubmit) return;
    createShopSizeChart({ name: name.trim(), image_url: imageDataUrl });
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
        <label className={labelClassName}>Upload chart image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm font-semibold text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-green-700 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-white dark:text-slate-200"
        />
      </div>
      {imageDataUrl && (
        <img
          src={imageDataUrl}
          alt="Selected chart preview"
          className="max-h-48 w-full rounded-xl border border-slate-200/70 object-contain dark:border-white/10"
        />
      )}
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
  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);

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
        <ul className="max-h-44 divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
          {shopSizeCharts.map((chart) => (
            <li key={chart.id}>
              <button
                type="button"
                onClick={() =>
                  setExpandedChartId((id) => (id === chart.id ? null : chart.id))
                }
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-white/5"
              >
                {chart.name}
              </button>
              {expandedChartId === chart.id && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                  <img
                    src={chart.image_url}
                    alt={chart.name}
                    className="max-h-64 w-full rounded-xl border border-slate-200/70 object-contain dark:border-white/10"
                  />
                </div>
              )}
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
