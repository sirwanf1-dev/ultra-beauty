-- Ultra Beauty homepage carousel setup
-- Run after supabase-setup.sql in the Supabase SQL Editor.
-- Safe to re-run: this adds only the slide table, policies and existing slide entries.

begin;

create table if not exists public.storefront_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null unique check (image_url ~ '^https://'),
  storage_path text unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create index if not exists storefront_slides_order_idx
  on public.storefront_slides (sort_order asc, created_at asc);

alter table public.storefront_slides enable row level security;

drop policy if exists "Public can read storefront slides" on public.storefront_slides;
create policy "Public can read storefront slides"
  on public.storefront_slides for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add storefront slides" on public.storefront_slides;
create policy "Admins can add storefront slides"
  on public.storefront_slides for insert
  to authenticated
  with check (public.is_ultra_beauty_admin());

drop policy if exists "Admins can update storefront slides" on public.storefront_slides;
create policy "Admins can update storefront slides"
  on public.storefront_slides for update
  to authenticated
  using (public.is_ultra_beauty_admin())
  with check (public.is_ultra_beauty_admin());

drop policy if exists "Admins can remove storefront slides" on public.storefront_slides;
create policy "Admins can remove storefront slides"
  on public.storefront_slides for delete
  to authenticated
  using (public.is_ultra_beauty_admin());

grant select on public.storefront_slides to anon, authenticated;
grant insert, update, delete on public.storefront_slides to authenticated;

insert into public.storefront_slides (image_url, sort_order)
values
  ('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85', 0),
  ('https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85', 1),
  ('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85', 2),
  ('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85', 3)
on conflict (image_url) do nothing;

commit;
