-- Ultra Beauty shared product database
-- Run this in Supabase SQL Editor after creating a Supabase project.
-- Security model: public can read published products only; only approved admin accounts can write.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (char_length(name_en) between 1 and 120),
  name_ku text not null check (char_length(name_ku) between 1 and 120),
  category text not null,
  price_iqd integer not null check (price_iqd >= 0),
  sale_price_iqd integer null check (sale_price_iqd is null or sale_price_iqd >= 0),
  description_en text not null default '',
  description_ku text not null default '',
  image_url text not null default '',
  in_stock boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_price_below_regular check (sale_price_iqd is null or sale_price_iqd < price_iqd)
);

create index if not exists products_published_updated_idx
  on public.products (published, updated_at desc);

create or replace function public.is_ultra_beauty_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  );
$$;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public reads published products" on public.products;
create policy "Public reads published products"
  on public.products for select
  to anon, authenticated
  using (published = true or public.is_ultra_beauty_admin());

drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products"
  on public.products for insert
  to authenticated
  with check (public.is_ultra_beauty_admin());

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products"
  on public.products for update
  to authenticated
  using (public.is_ultra_beauty_admin())
  with check (public.is_ultra_beauty_admin());

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products"
  on public.products for delete
  to authenticated
  using (public.is_ultra_beauty_admin());

-- Public image bucket. Upload/update/delete permissions are restricted to approved admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_ultra_beauty_admin());

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_ultra_beauty_admin())
  with check (bucket_id = 'product-images' and public.is_ultra_beauty_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_ultra_beauty_admin());
