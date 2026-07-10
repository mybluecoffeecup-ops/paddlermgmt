import { SocialsCard } from "@/components/info/SocialsCard";
import { SponsorsCard } from "@/components/info/SponsorsCard";
import { TeamInfoCard } from "@/components/info/TeamInfoCard";

export default function InfoPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Info
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Team information and reference documents.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <div className="md:shrink-0">
          <SocialsCard />
        </div>
        <div className="md:min-w-0 md:flex-1">
          <SponsorsCard />
        </div>
      </div>

      <TeamInfoCard />
    </div>
  );
}
