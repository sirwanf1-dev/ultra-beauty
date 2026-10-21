# Ultra Beauty: shared product database setup

This project is hosted as a static GitHub Pages site. Supabase provides the shared product catalogue, admin authentication and product image storage.

## Protect existing browser-saved products

Products entered in the older dashboard are stored only in that browser. **Do not clear browser data or reset that browser.** After setup, open `admin.html` in the same browser and use **Import saved browser products**. The importer keeps the browser copy and brings products into Supabase as unpublished drafts for review.

## Set up the shared backend

1. Open the Ultra Beauty Supabase project and choose **SQL Editor**.
2. Run the repository file `supabase-setup.sql`. It creates the products table, admin access policies and the `product-images` bucket.
3. The project's browser-safe publishable key and URL are already configured in `supabase-config.js`. If that key is rotated later, update it with the new publishable key only. Never use a **service_role** or **secret** key in any browser file.
4. Never use a **service_role** or **secret** key in `supabase-config.js`, HTML or any browser code. The browser key is public; row-level security protects the data.

## Approve your admin account

1. In Supabase, open **Authentication → Users** and create your admin account with an email and password.
2. Copy that user's UUID.
3. Run this in the SQL Editor, replacing the example UUID with the account's UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-THE-ADMIN-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```

## Product volume and multiple photos

After publishing the updated website code, open Supabase **SQL Editor** and run `supabase-product-volume-images.sql` from this repository. This adds the optional `volume_ml` field and an `image_urls` array, and copies existing main image URLs into that array. It is safe to re-run and does not delete product records.

## Product stock quantities

After running `supabase-setup.sql`, `supabase-product-volume-images.sql`, and `supabase-orders-setup.sql`, run `supabase-stock-inventory-migration.sql` in Supabase **SQL Editor**. It is safe to re-run. Existing products marked in stock are initialized to quantity `1`, and products marked out of stock to `0`; update actual quantities in Product Manager. The site shows only whether a product is available, never its stock count. Orders reserve inventory atomically, and cancelling an order returns those units.

In the Product Manager, enter a volume such as `30` or `100` in **Volume · mL**. English and Kurdish Sorani description fields have no character limit in the page. Use **Add product photos** to select one or more images; each image is uploaded to the shared storage, and the first/main image remains the storefront card image. Saved photos can be removed in the editor.

## Add and publish products

1. Open `admin.html` on the published site and sign in with the approved account.
2. Add the English and Kurdish Sorani names, category, regular IQD price, optional lower sale price, image, and the `ژماره‌` available quantity.
3. Set the quantity to `0` for unavailable or enter the number available. Leave the discount price blank when there is no discount; the storefront will show no crossed-out price.
4. Keep **Published** selected to show the product on the storefront when you save. Choose **Draft** to keep it private.
4. Products from the old browser dashboard can be brought in with **Import saved browser products**. Review their names, prices and images, then edit and publish them as needed.

Public visitors can read published products and view product images. Product creation, edits, image uploads and deletion require an authenticated account listed in `admin_users`.

## Product fields

The database stores English and Sorani names and descriptions, category, regular and optional sale prices in IQD, image URL, stock quantity, availability status, and publication status. The database rejects negative prices, quantities, and sale prices that are not below the regular price. The public storefront can read only the availability status; it does not receive the stock quantity.

Order storage and the `submit-order` Edge Function are separate setup steps. The inventory migration reserves stock when an order is placed and restores it if that order is cancelled. After updating the Edge Function code, deploy `supabase/functions/submit-order/index.ts` to the Supabase project. Do not place service-role keys, payment credentials, customer data or passwords in public GitHub files or chat.

## Manage homepage slides

The homepage carousel is shared through Supabase. After the original setup is in place, run `supabase-carousel-setup.sql` once in the project's SQL Editor. It creates a public-read, admin-write slide table and adds the four images already used by the storefront, so you can manage them from the Product Manager.

In `admin.html`, sign in and use **Homepage slides** to add or remove carousel images. The upload preview shows a centered 16:9 crop. Uploaded files are converted to 1600 × 900 JPEGs before saving. Removing an uploaded slide removes it from the carousel and cleans up its slide image; the original four remote images are only removed from the carousel list.

The migration is safe to re-run. It only adds the carousel table, its row-level security policies and the existing slide entries; it does not change product or order records. The storefront keeps its built-in carousel if the migration has not been applied yet.
