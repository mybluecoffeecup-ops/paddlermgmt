import { getSupabaseClient } from "@/lib/supabase/client";
import type { TeamDocument } from "@/types";

export async function fetchTeamDocuments(): Promise<TeamDocument[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("team_documents")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as TeamDocument[];
}

export async function createTeamDocument(
  document: Omit<TeamDocument, "id" | "created_at" | "updated_at">
): Promise<TeamDocument | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("team_documents")
    .insert(document)
    .select()
    .single();
  if (error) throw error;
  return data as TeamDocument;
}

export async function updateTeamDocument(
  id: string,
  patch: Partial<TeamDocument>
): Promise<TeamDocument | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("team_documents")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as TeamDocument;
}

export async function deleteTeamDocument(id: string): Promise<null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error } = await supabase.from("team_documents").delete().eq("id", id);
  if (error) throw error;
  return null;
}
