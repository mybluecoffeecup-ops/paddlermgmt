import { getSupabaseClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

export async function fetchNotifications(): Promise<Notification[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Notification[];
}

export async function createNotification(
  notification: Omit<Notification, "id" | "created_at" | "read_by">
): Promise<Notification | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function markNotificationRead(
  id: string,
  readBy: string[]
): Promise<Notification | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_by: readBy })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Notification;
}
