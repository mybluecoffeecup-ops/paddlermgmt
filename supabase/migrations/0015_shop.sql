-- Shop: team apparel ordering. Paddlers browse styles/sizes, add to a
-- client-only cart, and submit orders for manual coach accept/reject — no
-- in-app payment. Stock is only decremented on accept, via the
-- accept_shop_order() RPC below — never at submission time, and never via
-- a plain UPDATE (see the shop_orders RLS policies further down).

create type shop_order_status as enum ('pending', 'accepted', 'rejected', 'cancelled');

-- ---------------------------------------------------------------------------
-- shop_size_charts — shared across styles; link-only image (pasted URL),
-- same pattern as team_documents. No Storage upload anywhere in this app.
-- ---------------------------------------------------------------------------
create table shop_size_charts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table shop_size_charts enable row level security;

create policy "shop_size_charts_select_authenticated" on shop_size_charts
  for select using (auth.role() = 'authenticated');
create policy "shop_size_charts_write_coach" on shop_size_charts
  for all using (is_coach()) with check (is_coach());

-- ---------------------------------------------------------------------------
-- shop_styles
-- ---------------------------------------------------------------------------
create table shop_styles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  active boolean not null default true,
  size_chart_id uuid references shop_size_charts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shop_styles_active_idx on shop_styles (active);

create trigger shop_styles_set_updated_at before update on shop_styles
  for each row execute function set_updated_at();

alter table shop_styles enable row level security;

-- shop_styles: readable by all (including inactive rows — the paddler
-- browse grid filters active=true client-side), writable by coaches only.
create policy "shop_styles_select_authenticated" on shop_styles
  for select using (auth.role() = 'authenticated');
create policy "shop_styles_write_coach" on shop_styles
  for all using (is_coach()) with check (is_coach());

-- ---------------------------------------------------------------------------
-- shop_style_sizes — `size` is free text per style (e.g. "XS"-"XXL", or
-- numeric like "38") — deliberately not a global enum.
-- ---------------------------------------------------------------------------
create table shop_style_sizes (
  id uuid primary key default gen_random_uuid(),
  style_id uuid not null references shop_styles (id) on delete cascade,
  size text not null,
  stock_count int not null default 0 check (stock_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (style_id, size)
);

create index shop_style_sizes_style_id_idx on shop_style_sizes (style_id);

create trigger shop_style_sizes_set_updated_at before update on shop_style_sizes
  for each row execute function set_updated_at();

alter table shop_style_sizes enable row level security;

-- shop_style_sizes: readable by all, writable by coaches only. This
-- "write_coach" policy covers direct stock edits (coach setting
-- stock_count directly), but NOT stock decrements on accept — those go
-- through accept_shop_order() only, which runs as security definer and
-- bypasses this policy entirely.
create policy "shop_style_sizes_select_authenticated" on shop_style_sizes
  for select using (auth.role() = 'authenticated');
create policy "shop_style_sizes_write_coach" on shop_style_sizes
  for all using (is_coach()) with check (is_coach());

-- ---------------------------------------------------------------------------
-- shop_orders
-- ---------------------------------------------------------------------------
create table shop_orders (
  id uuid primary key default gen_random_uuid(),
  paddler_id uuid not null references profiles (id) on delete cascade,
  status shop_order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references profiles (id) on delete set null
);

create index shop_orders_paddler_id_idx on shop_orders (paddler_id);
create index shop_orders_status_idx on shop_orders (status);

create trigger shop_orders_set_updated_at before update on shop_orders
  for each row execute function set_updated_at();

alter table shop_orders enable row level security;

create policy "shop_orders_select_own_or_coach" on shop_orders
  for select using (paddler_id = auth.uid() or is_coach());

create policy "shop_orders_insert_own_pending" on shop_orders
  for insert with check (paddler_id = auth.uid() and status = 'pending');

-- Paddler: pending -> cancelled only, on their own order. decided_by is
-- set to the paddler themselves for a cancellation — same shape as a
-- coach decision, so "all decided orders" is one query, no separate
-- cancelled_at column needed.
create policy "shop_orders_update_paddler_cancel" on shop_orders
  for update
  using (paddler_id = auth.uid() and status = 'pending')
  with check (
    paddler_id = auth.uid() and status = 'cancelled'
    and decided_by = auth.uid() and decided_at is not null
  );

-- Coach: pending -> rejected only, via plain UPDATE. Coaches must NOT be
-- able to reach 'accepted' this way — that transition only happens inside
-- accept_shop_order() below, which is the only path that atomically
-- decrements stock. If a normal UPDATE could also set status='accepted',
-- a coach client could bypass the stock guard entirely, so this policy's
-- WITH CHECK deliberately excludes it.
create policy "shop_orders_update_coach_reject" on shop_orders
  for update
  using (is_coach() and status = 'pending')
  with check (
    is_coach() and status = 'rejected'
    and decided_by = auth.uid() and decided_at is not null
  );
-- No delete policy — orders are never hard-deleted.

-- ---------------------------------------------------------------------------
-- shop_order_items — style_name_snapshot/size_snapshot are denormalized
-- display copies captured at insert time, so order history stays readable
-- if a style is later renamed/deactivated. `size` is the live/editable
-- value (it can change while the order is pending); `size_snapshot` is
-- fixed at insert time and used for DISPLAY ONLY, never for stock matching.
-- ---------------------------------------------------------------------------
create table shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop_orders (id) on delete cascade,
  style_id uuid references shop_styles (id) on delete set null,
  size text not null,
  quantity int not null check (quantity > 0),
  style_name_snapshot text not null,
  size_snapshot text not null,
  created_at timestamptz not null default now(),
  unique (order_id, style_id, size)
);

create index shop_order_items_order_id_idx on shop_order_items (order_id);

alter table shop_order_items enable row level security;

create policy "shop_order_items_select_via_order" on shop_order_items
  for select using (
    exists (
      select 1 from shop_orders o
      where o.id = order_id and (o.paddler_id = auth.uid() or is_coach())
    )
  );

-- Insert/update/delete: only while the parent order is still 'pending' and
-- owned by the caller — this covers both "build the order at checkout" and
-- "edit a pending order's line items". Coaches get no write policy here:
-- they never edit a paddler's own line items.
create policy "shop_order_items_write_own_pending" on shop_order_items
  for all
  using (
    exists (select 1 from shop_orders o
      where o.id = order_id and o.paddler_id = auth.uid() and o.status = 'pending')
  )
  with check (
    exists (select 1 from shop_orders o
      where o.id = order_id and o.paddler_id = auth.uid() and o.status = 'pending')
  );

-- ---------------------------------------------------------------------------
-- accept_shop_order: the only path from pending -> accepted. Atomically
-- decrements stock across every line item and flips the order's status in
-- one transaction, so a double-click or concurrent accept can't
-- double-decrement stock or drop it below zero.
-- ---------------------------------------------------------------------------
create or replace function accept_shop_order(p_order_id uuid)
returns shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order shop_orders;
  v_item record;
  v_updated int;
begin
  if not is_coach() then
    raise exception 'Only coaches can accept orders';
  end if;

  select * into v_order from shop_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'Order is not pending (current status: %)', v_order.status;
  end if;

  for v_item in select * from shop_order_items where order_id = p_order_id loop
    -- A line item whose style was since deleted (style_id set null by the
    -- FK) has nothing to decrement against — skip stock tracking for it
    -- rather than blocking acceptance forever on a coach's own prior delete.
    if v_item.style_id is null then
      continue;
    end if;

    update shop_style_sizes
      set stock_count = stock_count - v_item.quantity
      where style_id = v_item.style_id
        and size = v_item.size            -- CURRENT size, not size_snapshot:
                                            -- size can change while pending;
                                            -- size_snapshot is display-only.
        and stock_count >= v_item.quantity;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Insufficient stock for % (size %)',
        v_item.style_name_snapshot, v_item.size;
    end if;
  end loop;

  update shop_orders
    set status = 'accepted', decided_by = auth.uid(), decided_at = now()
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

revoke all on function accept_shop_order(uuid) from public;
grant execute on function accept_shop_order(uuid) to authenticated;
