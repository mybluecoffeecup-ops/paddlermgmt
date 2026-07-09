import { getSupabaseClient } from "@/lib/supabase/client";
import type { WorkoutProgram } from "@/types";

const WORKOUT_PROGRAM_ID = "00000000-0000-0000-0000-000000000001";

export async function fetchWorkoutProgram(): Promise<WorkoutProgram | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("workout_program")
    .select("*")
    .eq("id", WORKOUT_PROGRAM_ID)
    .single();
  if (error) throw error;
  return data as WorkoutProgram;
}

export async function upsertWorkoutProgram(
  content: string,
  updatedBy: string | null
): Promise<WorkoutProgram | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("workout_program")
    .upsert({ id: WORKOUT_PROGRAM_ID, content, updated_by: updatedBy })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutProgram;
}
