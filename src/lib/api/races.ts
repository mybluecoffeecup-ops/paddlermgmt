import { getSupabaseClient } from "@/lib/supabase/client";
import type { AttendanceStatus, Race, RaceCommitment } from "@/types";

export async function fetchRaces(): Promise<Race[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .order("race_date", { ascending: true });
  if (error) throw error;
  return data as Race[];
}

export async function createRace(
  race: Omit<Race, "id" | "created_at" | "updated_at">
): Promise<Race | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("races").insert(race).select().single();
  if (error) throw error;
  return data as Race;
}

export async function updateRace(id: string, patch: Partial<Race>): Promise<Race | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("races")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Race;
}

export async function fetchRaceCommitments(): Promise<RaceCommitment[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("race_commitments").select("*");
  if (error) throw error;
  return data as RaceCommitment[];
}

export async function upsertRaceCommitment(
  raceId: string,
  paddlerId: string,
  patch: { status?: AttendanceStatus; has_paid?: boolean; notes?: string | null }
): Promise<RaceCommitment | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("race_commitments")
    .upsert(
      { race_id: raceId, paddler_id: paddlerId, ...patch },
      { onConflict: "race_id,paddler_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as RaceCommitment;
}
