-- Ultra Beauty order storage
-- Run after supabase-setup.sql in the Supabase SQL Editor.
-- Orders are written by the submit-order Edge Function using the server-side service role.
-- Do not grant anonymous users SELECT access to orders or order_items.

create sequence if not exists public.ultra_beauty_order_number_seq start 1000;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('UB-' || nextval('public.ultra_beauty_order_number_seq')::text),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (char_length(customer_phone) between 6 and 40),
  city text not null check (char_length(city) between 1 and 100),
  delivery_address text not null check (char_length(delivery_address) between 5 and 500),
  delivery_instructions text not null default '' check (char_length(delivery_instructions) <= 500),
  payment_method text not null check (payment_method in ('cash_on_delivery','fib_manual')),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50),
  subtotal_iqd integer not null check (subtotal_iqd >= 0),
  delivery_fee_iqd integer not null check (delivery_fee_iqd >= 0),
  total_iqd integer not null check (total_iqd = subtotal_iqd + delivery_fee_iqd),
  status text not null default 'new' check (status in ('new','confirmed','preparing','with_driver','delivered','cancelled')),
  notification_email_status text not null default 'pending' check (notification_email_status in ('pending','sent','failed','not_configured')),
  notification_whatsapp_status text not null default 'pending' check (notification_whatsapp_status in ('pending','sent','failed','not_configured')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Only approved admins can read orders" on public.orders;
create policy "Only approved admins can read orders"
  on public.orders for select
  to authenticated
  using (public.is_ultra_beauty_admin());

drop policy if exists "Only approved admins can update orders" on public.orders;
create policy "Only approved admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_ultra_beauty_admin())
  with check (public.is_ultra_beauty_admin());

-- No anon/authenticated INSERT policy: public orders must be validated by the Edge Function.
-- Service-role access is server-side only. Never place the service-role key in HTML or GitHub.
