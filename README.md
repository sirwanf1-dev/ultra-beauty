# Ultra Beauty

Mobile-first beauty and personal-care storefront for customers in Iraq, in English and Kurdish Sorani.

## Pages

- `index.html` — public storefront.
- `admin.html` — secure product manager connected to Supabase.

## Product manager

The product manager uses Supabase Auth. Only signed-in accounts listed in `public.admin_users` can read or change catalogue records. Product images selected from a device are uploaded to the protected `product-images` bucket.

New products are published by default so they appear on the storefront after saving. Choose **Draft** to keep an item hidden. Out-of-stock products can remain published and are shown as unavailable.

If products were entered in the older browser-only dashboard, open `admin.html` in that same browser and choose **Import saved browser products** after signing in. They are imported as drafts for review; the browser copy is retained.

## Supabase setup

1. Run `supabase-setup.sql` in the Supabase SQL Editor.
2. Set the project publishable/anon key in `supabase-config.js`. The project URL is already configured. Never put a service-role or secret key in this file.
3. Create an admin account in Supabase Authentication → Users.
4. Add that account's user UUID to `public.admin_users`. See `SUPABASE_SETUP.md`.
5. Sign in at the published `admin.html` page.

The storefront reads only rows with `published = true`. Product prices are stored as whole IQD amounts. A sale price must be lower than the regular price.

## Orders

`supabase-orders-setup.sql` defines order storage. The `submit-order` Edge Function verifies prices against the shared catalogue. Deploy it separately when order checkout is ready. Keep service-role and provider credentials in Supabase secrets only.
