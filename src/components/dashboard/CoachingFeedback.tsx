"use client";

import { Lock, MessageSquareQuote } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";

export function CoachingFeedback() {
  const { currentUser } = useAppData();

  return (
    <Card className="bg-gold-50 dark:bg-pitch-900">
      <CardHeader
        title="Coaching Feedback Corner"
        subtitle="Private cues from your coaching staff"
        icon={<MessageSquareQuote size={16} />}
        action={
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
            <Lock size={11} /> Private
          </span>
        }
      />
      <div className="px-4 py-4">
        {currentUser?.coaching_feedback ? (
          <blockquote className="border-l-4 border-gold-400 pl-3 text-sm italic leading-relaxed text-slate-700 dark:border-gold-500 dark:text-slate-200">
            &ldquo;{currentUser.coaching_feedback}&rdquo;
          </blockquote>
        ) : (
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No feedback yet — check back after your next session.
          </p>
        )}
      </div>
    </Card>
  );
}
