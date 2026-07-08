import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { RaceCountdowns } from "@/components/dashboard/RaceCountdowns";
import { CoachingFeedback } from "@/components/dashboard/CoachingFeedback";

export default function HomeDashboardPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 md:max-w-3xl md:grid md:grid-cols-2 md:items-start">
      <div className="flex flex-col gap-4 md:col-span-2">
        <ProfileSummaryCard />
      </div>
      <UpcomingSessions />
      <RaceCountdowns />
      <div className="md:col-span-2">
        <CoachingFeedback />
      </div>
    </div>
  );
}
