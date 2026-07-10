import { getSupabaseClient } from "@/lib/supabase/client";
import type { ShopOrder, ShopOrderItem, ShopSizeChart, ShopStyle, ShopStyleSize } from "@/types";

export async function fetchShopStyles(): Promise<ShopStyle[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_styles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as ShopStyle[];
}

export async function createShopStyle(
  style: Omit<ShopStyle, "id" | "created_at" | "updated_at">
): Promise<ShopStyle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shop_styles").insert(style).select().single();
  if (error) throw error;
  return data as ShopStyle;
}

export async function updateShopStyle(
  id: string,
  patch: Partial<ShopStyle>
): Promise<ShopStyle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_styles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ShopStyle;
}

export async function fetchShopStyleSizes(): Promise<ShopStyleSize[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shop_style_sizes").select("*");
  if (error) throw error;
  return data as ShopStyleSize[];
}

export async function createShopStyleSize(
  entry: Omit<ShopStyleSize, "id" | "created_at" | "updated_at">
): Promise<ShopStyleSize | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_style_sizes")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as ShopStyleSize;
}

export async function updateShopStyleSize(
  id: string,
  patch: Partial<ShopStyleSize>
): Promise<ShopStyleSize | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_style_sizes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ShopStyleSize;
}

export async function deleteShopStyleSize(id: string): Promise<null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error } = await supabase.from("shop_style_sizes").delete().eq("id", id);
  if (error) throw error;
  return null;
}

export async function fetchShopSizeCharts(): Promise<ShopSizeChart[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shop_size_charts").select("*");
  if (error) throw error;
  return data as ShopSizeChart[];
}

export async function createShopSizeChart(
  chart: Omit<ShopSizeChart, "id" | "created_at">
): Promise<ShopSizeChart | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_size_charts")
    .insert(chart)
    .select()
    .single();
  if (error) throw error;
  return data as ShopSizeChart;
}

export async function fetchShopOrders(): Promise<ShopOrder[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ShopOrder[];
}

export async function fetchShopOrderItems(): Promise<ShopOrderItem[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("shop_order_items").select("*");
  if (error) throw error;
  return data as ShopOrderItem[];
}

export async function createShopOrder(
  order: Pick<ShopOrder, "paddler_id" | "status">,
  items: Array<Omit<ShopOrderItem, "id" | "order_id" | "created_at">>
): Promise<ShopOrder | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data: orderData, error: orderError } = await supabase
    .from("shop_orders")
    .insert(order)
    .select()
    .single();
  if (orderError) throw orderError;
  const newOrder = orderData as ShopOrder;

  const { error: itemsError } = await supabase
    .from("shop_order_items")
    .insert(items.map((item) => ({ ...item, order_id: newOrder.id })));
  if (itemsError) throw itemsError;

  return newOrder;
}

export async function replaceShopOrderItems(
  orderId: string,
  items: Array<Omit<ShopOrderItem, "id" | "order_id" | "created_at">>
): Promise<null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { error: deleteError } = await supabase
    .from("shop_order_items")
    .delete()
    .eq("order_id", orderId);
  if (deleteError) throw deleteError;

  if (items.length > 0) {
    const { error: insertError } = await supabase
      .from("shop_order_items")
      .insert(items.map((item) => ({ ...item, order_id: orderId })));
    if (insertError) throw insertError;
  }
  return null;
}

export async function updateShopOrder(
  id: string,
  patch: Partial<ShopOrder>
): Promise<ShopOrder | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shop_orders")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ShopOrder;
}

export async function acceptShopOrder(
  id: string
): Promise<{ order: ShopOrder | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { order: null, error: null };
  const { data, error } = await supabase.rpc("accept_shop_order", { p_order_id: id });
  if (error) return { order: null, error: error.message };
  return { order: data as ShopOrder, error: null };
}
