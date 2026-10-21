-- Ultra Beauty inventory quantity and checkout reservation
-- Run after supabase-setup.sql and supabase-orders-setup.sql in Supabase SQL Editor.
-- Safe to re-run. Existing in-stock products start at 1; out-of-stock products start at 0.

begin;

alter table public.products
  add column if not exists stock_quantity integer;

update public.products
set stock_quantity = case when coalesce(in_stock, false) then 1 else 0 end
where stock_quantity is null;

alter table public.products
  alter column stock_quantity set default 0,
  alter column stock_quantity set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_stock_quantity_nonnegative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_stock_quantity_nonnegative
      check (stock_quantity >= 0);
  end if;
end $$;

update public.products
set in_stock = stock_quantity > 0
where in_stock is distinct from (stock_quantity > 0);

-- The storefront only needs the boolean availability flag. Keep the actual count out
-- of anonymous product reads while leaving authenticated admin access unchanged.
revoke select on table public.products from anon, public;
grant select (
  id, name_en, name_ku, category, price_iqd, sale_price_iqd, volume_ml,
  description_en, description_ku, image_url, image_urls, in_stock, published
) on table public.products to anon;

create or replace function public.apply_product_inventory_for_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_reserve_stock boolean := true;
begin
  if tg_op = 'UPDATE' then
    if old.status is not distinct from new.status then
      return new;
    end if;

    if old.status <> 'cancelled' and new.status = 'cancelled' then
      v_reserve_stock := false;
    elsif old.status = 'cancelled' and new.status <> 'cancelled' then
      v_reserve_stock := true;
    else
      return new;
    end if;
  end if;

  if jsonb_typeof(new.items) is distinct from 'array' then
    raise exception 'Invalid order items for inventory update'
      using errcode = '22023';
  end if;

  for v_item in
    select value from jsonb_array_elements(new.items)
  loop
    if coalesce(v_item->>'productId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or coalesce(v_item->>'quantity', '') !~ '^[1-9][0-9]?$' then
      raise exception 'Invalid product inventory item'
        using errcode = '22023';
    end if;

    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    if v_reserve_stock then
      update public.products as p
      set stock_quantity = p.stock_quantity - v_quantity,
          in_stock = (p.stock_quantity - v_quantity) > 0,
          updated_at = now()
      where p.id = v_product_id
        and p.published = true
        and p.stock_quantity >= v_quantity;

      if not found then
        raise exception 'Insufficient product inventory'
          using errcode = 'P0001';
      end if;
    else
      update public.products as p
      set stock_quantity = p.stock_quantity + v_quantity,
          in_stock = true,
          updated_at = now()
      where p.id = v_product_id;
    end if;
  end loop;

  return new;
end;
$function$;

drop trigger if exists orders_manage_product_stock_insert on public.orders;
create trigger orders_manage_product_stock_insert
before insert on public.orders
for each row
execute function public.apply_product_inventory_for_order();

drop trigger if exists orders_manage_product_stock_status_update on public.orders;
create trigger orders_manage_product_stock_status_update
before update of status on public.orders
for each row
execute function public.apply_product_inventory_for_order();

commit;
