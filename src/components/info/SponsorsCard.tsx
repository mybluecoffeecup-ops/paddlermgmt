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
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(104px,140px))]">
        {SPONSORS.map((sponsor) => (
          <button
            key={sponsor.slug}
            type="button"
            onClick={() => setSelected(sponsor)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/70 p-3 text-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 hover:border-green-700 dark:border-white/10"
          >
            <SponsorLogo name={sponsor.name} logoSrc={sponsor.logoSrc} className="h-10 w-10 text-xs" />
            <span className="w-full min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {sponsor.name}
              </p>
              <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
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
