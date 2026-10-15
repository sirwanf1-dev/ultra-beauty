# Ultra Beauty

Mobile-first beauty and personal-care storefront for customers in Iraq.

## Pages

- `index.html` — public storefront.
- `admin.html` — first product-manager prototype.

## Product manager prototype

Open `admin.html` on the published site to try adding and editing product details, English and Kurdish Sorani names/descriptions, IQD regular and sale prices, categories, photos, and stock status. The prototype supports searching, filtering, and JSON backup/import.

**Important:** This first version saves product data in the current browser's local storage only. It is not connected to the live storefront, a shared database, or a secure admin login. Products added here will not appear on customers' devices. Do not use this prototype as the live product-management system yet.

## Next production steps

1. Connect a private admin authentication flow.
2. Set up a shared database and image storage (for example, Supabase).
3. Restrict database and storage access with row-level security and server-side validation.
4. Connect the public product catalogue to the shared database.
5. Test backup, restore, pricing, and mobile workflows before real use.

Never put service-role keys, payment secrets, or private credentials in public HTML or client-side JavaScript.
