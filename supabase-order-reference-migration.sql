-- Ultra Beauty order-reference migration
-- Run after supabase-orders-setup.sql in Supabase SQL Editor.
-- Preserves all existing order numbers and never moves the sequence backwards.
-- On a fresh/empty database, the next generated reference is UB-1000.

begin;

create sequence if not exists public.ultra_beauty_order_number_seq start with 1000;

lock table public.orders in access exclusive mode;

do $$
declare
  max_order_number bigint;
  sequence_last_value bigint;
  sequence_was_called boolean;
  next_order_number bigint;
begin
  select max(substring(order_number from 4)::bigint)
    into max_order_number
    from public.orders
    where order_number ~ '^UB-[0-9]+$';

  select last_value, is_called
    into sequence_last_value, sequence_was_called
    from public.ultra_beauty_order_number_seq;

  next_order_number := greatest(
    1000::bigint,
    coalesce(max_order_number, 999) + 1,
    case when sequence_was_called then sequence_last_value + 1 else 1000 end
  );

  perform setval(
    'public.ultra_beauty_order_number_seq'::regclass,
    next_order_number,
    false
  );
end $$;

commit;
