import { WorkInProgress } from "@/components/ui/WorkInProgress";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Orders
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Team gear and apparel orders.
        </p>
      </div>

      <WorkInProgress title="Orders" />
    </div>
  );
}
