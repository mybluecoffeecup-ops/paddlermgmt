import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export async function fetchProfiles(): Promise<Profile[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(
  id: string,
  patch: Partial<Profile>
): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
