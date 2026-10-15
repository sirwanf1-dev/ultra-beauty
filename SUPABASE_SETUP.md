# Ultra Beauty: shared product database setup

This project is hosted as a static GitHub Pages site. To share products between the admin page and customers' phones, it needs a hosted database and image storage. Supabase is the selected backend.

## Important: protect the existing product

The current dashboard stores products in the browser that created them. **Do not clear browser data or uninstall/reset the browser.** Open `admin.html` on that same phone and use **Export backup (JSON)**. Keep the downloaded file. It contains your current catalogue and may contain the uploaded product image.

## Create the shared backend

1. Create a Supabase project at https://supabase.com/ and choose a project name such as `ultra-beauty`.
2. Open **SQL Editor** in the Supabase dashboard.
3. Open this repository file, `supabase-setup.sql`, copy all of it into a new SQL query, and run it.
4. In Supabase, open **Project Settings → API** (the labels may change). Copy the **Project URL** and the **publishable/anon key**. Never copy or expose a **service_role/secret key**.
5. Open **Authentication → Users** and create the admin account using an email address and a strong password.
6. Copy that user's UUID, then run the following SQL in SQL Editor, replacing the example UUID with the actual user UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-THE-ADMIN-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```

## What is ready / what remains

- `supabase-setup.sql` defines the shared product table, public read access for published products, admin-only changes, and product image storage.
- Public visitors can only read products marked `published = true`.
- Product edits, uploads and deletes are restricted to admin accounts listed in `admin_users`.
- The current `admin.html` and storefront still need the project URL and publishable key wired into their pages, and the existing browser-only product needs to be imported. That final connection should be completed after the project credentials are available.
- Do not paste passwords, secret keys, service-role keys, customer data or payment credentials into chat or public GitHub files. The project URL and publishable/anon key are designed to be public, but only use them with the RLS policies in this SQL file in place.

## Product data shape

The shared database stores English and Kurdish Sorani names and descriptions, category, regular and sale prices in IQD, image URL, stock status, and whether the item is published. A sale price must be lower than the regular price.

## Publishing safely

After the pages are connected, import the saved JSON backup, check the product photo and IQD prices, then mark the product as published. Test on a separate phone/browser before announcing the shop. This setup does not enable card checkout or automated FIB payment.
