import { getSupabaseClient } from "@/lib/supabase/client";
import type { BoatType, Lineup, SeatingConfiguration } from "@/types";

export async function fetchLineups(): Promise<Lineup[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("lineups").select("*");
  if (error) throw error;
  return data as Lineup[];
}

export async function createLineup(
  lineup: Omit<Lineup, "id" | "created_at" | "updated_at">
): Promise<Lineup | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("lineups").insert(lineup).select().single();
  if (error) throw error;
  return data as Lineup;
}

export async function updateLineupSeating(
  id: string,
  seatingConfiguration: SeatingConfiguration
): Promise<Lineup | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lineups")
    .update({ seating_configuration: seatingConfiguration })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Lineup;
}

export async function updateLineupBoat(
  id: string,
  boat: BoatType,
  seatingConfiguration: SeatingConfiguration
): Promise<Lineup | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lineups")
    .update({ boat, seating_configuration: seatingConfiguration })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Lineup;
}
