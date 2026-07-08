import { getSupabaseClient } from "@/lib/supabase/client";
import type { Attendance, AttendanceStatus } from "@/types";

export async function fetchAttendance(): Promise<Attendance[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("attendance").select("*");
  if (error) throw error;
  return data as Attendance[];
}

export async function upsertAttendance(
  sessionId: string,
  paddlerId: string,
  status: AttendanceStatus,
  paddlerNotes?: string | null
): Promise<Attendance | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        session_id: sessionId,
        paddler_id: paddlerId,
        status,
        paddler_notes: paddlerNotes ?? null,
      },
      { onConflict: "session_id,paddler_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Attendance;
}
