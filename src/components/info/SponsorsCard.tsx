"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/Card";
import { SponsorDrawer } from "@/components/info/SponsorDrawer";
import { SponsorLogo } from "@/components/info/SponsorLogo";
import { SPONSORS, type Sponsor } from "@/components/info/sponsors-data";

export function SponsorsCard() {
  const [selected, setSelected] = useState<Sponsor | null>(null);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader
        title="Sponsors"
        subtitle="Member perks & discounts"
        icon={<Handshake size={16} />}
      />
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        {SPONSORS.map((sponsor) => (
          <button
            key={sponsor.slug}
            type="button"
            onClick={() => setSelected(sponsor)}
            className="flex items-center gap-2 rounded-xl border border-slate-200/70 p-2 text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 hover:border-green-700 dark:border-white/10"
          >
            <SponsorLogo name={sponsor.name} logoSrc={sponsor.logoSrc} className="h-8 w-8 text-[10px]" />
            <span className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-900 dark:text-slate-100">
                {sponsor.name}
              </p>
              <p className="truncate text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {sponsor.summary}
              </p>
            </span>
          </button>
        ))}
      </div>

      <SponsorDrawer sponsor={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
