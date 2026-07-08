"use client";

import { Lock, MessageSquareQuote } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";

export function CoachingFeedback() {
  const { currentUser } = useAppData();

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-ember-50/60 dark:border-teal-500/20 dark:from-teal-500/5 dark:to-ember-500/5">
      <CardHeader
        title="Coaching Feedback Corner"
        subtitle="Private cues from your coaching staff"
        icon={<MessageSquareQuote size={16} />}
        action={
          <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-300">
            <Lock size={11} /> Private
          </span>
        }
      />
      <div className="px-4 py-4">
        {currentUser?.coaching_feedback ? (
          <blockquote className="border-l-4 border-teal-400 pl-3 text-sm italic leading-relaxed text-slate-700 dark:text-slate-200">
            &ldquo;{currentUser.coaching_feedback}&rdquo;
          </blockquote>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No feedback yet — check back after your next session.
          </p>
        )}
      </div>
    </Card>
  );
}
