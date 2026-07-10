import { getSupabaseClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/types";

export async function fetchCalendarEvents(): Promise<CalendarEvent[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data as CalendarEvent[];
}

export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">
): Promise<CalendarEvent | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data as CalendarEvent;
}

export async function updateCalendarEvent(
  id: string,
  patch: Partial<CalendarEvent>
): Promise<CalendarEvent | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("calendar_events")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CalendarEvent;
}
