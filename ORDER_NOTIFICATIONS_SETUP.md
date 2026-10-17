# Ultra Beauty order notifications — implementation and setup

Notification destination configured in the code:
- WhatsApp Business recipient: `9647706943110` (international format without the leading + for Meta API)
- Email recipient: `sirwanf1@gmail.com`

## Current state

The public storefront is static GitHub Pages and submits orders to the Supabase `submit-order` Edge Function. The repository contains the storefront integration, server-side function and order schema. The checkout screenshot showed a stale-basket rejection from the live endpoint; deploy the current function after applying the order-reference migration so it accepts stable product IDs. The function will send alerts only after the required provider secrets are configured in Supabase. No credentials belong in GitHub or browser code.

## Architecture

1. The storefront submits the customer's name, phone, city, address, payment choice and product IDs/quantities to the `submit-order` Supabase Edge Function.
2. The function validates stable product IDs against published products, re-reads server prices (never trusts browser totals), saves the order and generates a unique reference such as `UB-1000`.
3. The function sends a full order summary by email through Resend.
4. It sends a WhatsApp Business template message through Meta's WhatsApp Cloud API with customer name, mobile number, full delivery address and order reference.
5. The admin dashboard will need a protected authenticated orders view; public users must never be able to read orders.

## Required authorizations — do not send credentials in chat

### 1. Create/authorize the Supabase project

- Open https://supabase.com/dashboard and create a project named `ultra-beauty`, or authorize access to an existing project.
- Run `supabase-setup.sql` and then `supabase-orders-setup.sql` in its SQL Editor.
- On an existing setup, run `supabase-order-reference-migration.sql` before deploying the current Edge Function. It preserves previous order references and safely advances the sequence; a clean database starts at `UB-1000`.
- Keep the project URL and publishable/anon key for the frontend connection.
- The server-side service-role key must be added only as a Supabase Edge Function secret. Never commit it or paste it into chat.

### 2. Email with Resend

- Create/authorize a Resend account at https://resend.com/.
- For reliable production sending, verify a domain you control in Resend and use a sender address on that domain.
- If you do not have a domain, you can test with Resend's shared `onboarding@resend.dev` sender by leaving `RESEND_FROM_EMAIL` unset; the function uses it as its default. This sender is restricted to testing and the Resend account's own email address. Since this project's notification recipient is `sirwanf1@gmail.com`, the test path requires the Resend account to use that same email. It is not a production sender.
- Add secrets to the Supabase Edge Function:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` (optional for the test sender; use a verified sender for production)
  - `ORDER_NOTIFICATION_EMAIL=sirwanf1@gmail.com`

### 3. WhatsApp Business via Meta Cloud API

- Create/authorize a Meta business app with WhatsApp Cloud API at https://developers.facebook.com/apps/.
- The business number that sends messages must be registered with the API; it may not be the same number used as the notification recipient.
- Add Supabase secrets:
  - `WHATSAPP_ACCESS_TOKEN` (long-lived/system-user token)
  - `WHATSAPP_PHONE_NUMBER_ID` (sender phone number ID from Meta, not the visible phone number)
  - `WHATSAPP_ORDER_TEMPLATE_NAME` (approved template name)
  - `WHATSAPP_TEMPLATE_LANGUAGE` (e.g. `en` or an approved Sorani template language code)
  - `ORDER_NOTIFICATION_WHATSAPP=9647706943110`
- Create and get approval for a utility template with four body variables, in this exact order: customer name, customer mobile number, full delivery address (address and city), and order reference. For example: “New Ultra Beauty order. Customer: {{1}}. Mobile: {{2}}. Delivery address: {{3}}. Reference: {{4}}.”
- Meta can require template messages for business-initiated alerts. Do not assume a WhatsApp notification works until an approved template and real credentials have been tested.

### 4. Supabase Edge Function secrets and deployment

The owner notification destinations are `sirwanf1@gmail.com` and WhatsApp `+9647706943110`. Set provider credentials as server-side Supabase secrets using the dashboard secrets UI or Supabase CLI; never put them in GitHub:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SITE_ORIGIN=https://sirwanf1-dev.github.io`
- `ORDER_NOTIFICATION_EMAIL=sirwanf1@gmail.com`
- `ORDER_NOTIFICATION_WHATSAPP=9647706943110`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ORDER_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANGUAGE`

Deploy `supabase/functions/submit-order/index.ts` as the Edge Function named `submit-order`. Use Supabase's official CLI and keep secrets in Supabase, not GitHub. If the function is public, enable rate limiting/abuse protection before taking real orders.

## Important remaining integration work

- The storefront now sends product IDs with the basket so orders stay linked to the current catalogue even if product names change. Deploy the updated function together with the website before accepting orders.
- The product manager does not currently include an orders list. Use the order reference in the email and WhatsApp alerts to identify an order; the protected `orders` table remains the source of order status.
- Delivery uses the storefront policy: free when the product subtotal is over 20,000 IQD; otherwise 3,000 IQD in listed Kurdistan cities and 5,000 IQD elsewhere.
- Add a real rate-limit / anti-spam layer and test failed notification delivery and duplicate submissions.
- Only advertise ordering as live after a controlled test order verifies the saved reference and both notification channels. Do not use a real customer order for this check.
