"use client";

import { useState } from "react";
import {
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  Plus,
  Presentation,
  Table,
  Trash2,
  X,
} from "lucide-react";

import { useAppData } from "@/hooks/app-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { TeamDocumentViewer } from "@/components/info/TeamDocumentViewer";
import { getDocumentEmbed, type DocumentKind } from "@/lib/document-utils";
import { cn } from "@/lib/utils";
import type { TeamDocument } from "@/types";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-ink transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:shadow-soft dark:border-white/10 dark:bg-pitch-900/70 dark:text-white";
const labelClassName =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

const KIND_ICONS: Record<DocumentKind, React.ComponentType<{ size?: number }>> = {
  "Google Doc": FileText,
  "Google Slides": Presentation,
  "Google Sheet": Table,
  "Google Form": ClipboardList,
  Link: Link2,
};

function TeamDocumentForm({
  initial,
  onDone,
}: {
  initial?: TeamDocument;
  onDone: () => void;
}) {
  const { createTeamDocument, updateTeamDocument, currentUserId } = useAppData();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const canSubmit = title.trim() !== "" && url.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    const patch = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() === "" ? null : description.trim(),
    };
    if (initial) {
      updateTeamDocument(initial.id, patch);
    } else {
      createTeamDocument({ ...patch, created_by: currentUserId });
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-white/10">
      <div>
        <label className={labelClassName}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="New Paddler Information Pack"
        />
      </div>

      <div>
        <label className={labelClassName}>URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClassName}
          placeholder="https://docs.google.com/presentation/d/..."
        />
      </div>

      <div>
        <label className={labelClassName}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClassName}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-700 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:focus-visible:ring-offset-pitch-900"
      >
        <Plus size={15} /> {initial ? "Save Changes" : "Add Document"}
      </button>
    </div>
  );
}

export function TeamInfoCard() {
  const { teamDocuments, role, loading, currentUser, deleteTeamDocument } = useAppData();
  const resolved = !loading && currentUser !== undefined;
  const isCoach = resolved && role === "coach";

  const [isCreating, setIsCreating] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TeamDocument | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TeamDocument | null>(null);

  const isEditingOrCreating = isCreating || editingDocument !== null;

  function closeForm() {
    setIsCreating(false);
    setEditingDocument(null);
  }

  return (
    <Card>
      <CardHeader
        title="Team Info"
        subtitle="Reference documents & guides"
        icon={<BookOpen size={16} />}
        action={
          isCoach ? (
            <button
              type="button"
              onClick={() => {
                if (isEditingOrCreating) {
                  closeForm();
                } else {
                  setIsCreating(true);
                }
              }}
              className="flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-soft transition-colors hover:border-green-700 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:text-slate-300"
            >
              {isEditingOrCreating ? <X size={13} /> : <Plus size={13} />}
              {isEditingOrCreating ? "Cancel" : "Add Document"}
            </button>
          ) : undefined
        }
      />

      {isEditingOrCreating ? (
        <TeamDocumentForm initial={editingDocument ?? undefined} onDone={closeForm} />
      ) : teamDocuments.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          No documents yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {teamDocuments.map((doc) => {
            const { kind } = getDocumentEmbed(doc.url);
            const Icon = KIND_ICONS[kind];
            const confirmingDelete = confirmDeleteId === doc.id;
            return (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSelected(doc)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {doc.title}
                    </p>
                    {doc.description && (
                      <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {doc.description}
                      </p>
                    )}
                  </span>
                  <ExternalLink size={15} className="shrink-0 text-slate-400" />
                </button>

                {isCoach && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${doc.title}`}
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setEditingDocument(doc);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      <Pencil size={14} />
                    </button>
                    {confirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          deleteTeamDocument(doc.id);
                          setConfirmDeleteId(null);
                        }}
                        className={cn(
                          "flex h-8 items-center gap-1 rounded-full bg-redcard-500 px-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-redcard-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                        )}
                      >
                        Confirm?
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${doc.title}`}
                        onClick={() => setConfirmDeleteId(doc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-redcard-500/15 hover:text-redcard-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-slate-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <TeamDocumentViewer document={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
