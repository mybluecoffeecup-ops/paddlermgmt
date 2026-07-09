import { getSupabaseClient } from "@/lib/supabase/client";
import type { Comment } from "@/types";

export async function fetchComments(): Promise<Comment[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Comment[];
}

export async function createComment(
  comment: Omit<Comment, "id" | "created_at">
): Promise<Comment | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("comments").insert(comment).select().single();
  if (error) throw error;
  return data as Comment;
}

export async function deleteComment(id: string): Promise<null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
  return null;
}
