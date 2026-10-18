-- Ultra Beauty product volume and multiple images
-- Run once in Supabase SQL Editor after the updated Product Manager code is published.
-- Safe to re-run. Existing main images are copied into image_urls; no product rows are deleted.

alter table public.products
  add column if not exists volume_ml numeric null,
  add column if not exists image_urls text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_volume_ml_nonnegative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_volume_ml_nonnegative
      check (volume_ml is null or volume_ml >= 0);
  end if;
end $$;

update public.products
set image_urls = array[image_url]
where coalesce(image_url, '') <> ''
  and coalesce(cardinality(image_urls), 0) = 0;
