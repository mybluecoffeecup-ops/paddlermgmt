import { WorkInProgress } from "@/components/ui/WorkInProgress";

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

      <WorkInProgress
        title="Team Info"
        description="Team information and a reference document library are coming here."
      />
    </div>
  );
}
