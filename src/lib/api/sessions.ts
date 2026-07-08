import { getSupabaseClient } from "@/lib/supabase/client";
import type { Session } from "@/types";

export async function fetchSessions(): Promise<Session[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("session_date", { ascending: true });
  if (error) throw error;
  return data as Session[];
}

export async function createSession(
  session: Omit<Session, "id" | "created_at" | "updated_at">
): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("sessions").insert(session).select().single();
  if (error) throw error;
  return data as Session;
}

export async function updateSession(
  id: string,
  patch: Partial<Session>
): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("sessions")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}
