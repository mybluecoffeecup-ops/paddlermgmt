"use client";

import { useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/utils";

export function CommentsSection({
  sessionId,
  raceId,
}: {
  sessionId?: string;
  raceId?: string;
}) {
  const { commentsFor, createComment, deleteComment, profiles, currentUserId, role } =
    useAppData();
  const [draft, setDraft] = useState("");

  const comments = commentsFor({ sessionId, raceId }).sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  function handlePost() {
    const body = draft.trim();
    if (!body) return;
    createComment({
      session_id: sessionId ?? null,
      race_id: raceId ?? null,
      author_id: currentUserId,
      body,
    });
    setDraft("");
  }

  return (
    <Card>
      <CardHeader
        title="Comments"
        subtitle={`${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        icon={<MessageCircle size={16} />}
      />
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {comments.map((comment) => {
          const author = profileById.get(comment.author_id);
          const canDelete = comment.author_id === currentUserId || role === "coach";
          return (
            <li key={comment.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {author?.full_name ?? "Unknown"}
                  </p>
                  <span
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(comment.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                  {comment.body}
                </p>
              </div>
              {canDelete && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  aria-label="Delete comment"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-redcard-500/10 hover:text-redcard-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          );
        })}
        {comments.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <MessageCircle size={28} className="text-slate-300 dark:text-white/20" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No comments yet. Be the first to say something.
            </span>
          </li>
        )}
      </ul>
      <div className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-white/10">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePost();
          }}
          placeholder="Add a comment..."
          className="w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
        />
        <button
          onClick={handlePost}
          disabled={!draft.trim()}
          aria-label="Post comment"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white shadow-cta transition-all hover:bg-green-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
        >
          <Send size={15} />
        </button>
      </div>
    </Card>
  );
}
