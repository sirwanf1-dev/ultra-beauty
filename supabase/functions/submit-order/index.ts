// Ultra Beauty public order endpoint.
// Deploy as a Supabase Edge Function. All provider credentials belong in Supabase secrets.
// Never place SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY or WhatsApp access tokens in browser code.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "https://sirwanf1-dev.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function reply(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}
function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function money(value: number): string {
  return new Intl.NumberFormat("en-IQ").format(value) + " IQD";
}

const DELIVERY_AREAS: Record<string, { nameKu: string; feeIqd: number }> = {
  "سلێمانی": { nameKu: "سلێمانی", feeIqd: 3000 },
  "هەولێر": { nameKu: "هەولێر", feeIqd: 4000 },
  "کەرکوک": { nameKu: "کەرکوک", feeIqd: 4000 },
  "کەلار": { nameKu: "کەلار", feeIqd: 4000 },
  "دهۆک": { nameKu: "دهۆک", feeIqd: 4000 },
  "تانجەڕۆ": { nameKu: "تانجەڕۆ", feeIqd: 4000 },
  "هوانە": { nameKu: "هەوانە", feeIqd: 4000 },
  "ڕزگۆیز": { nameKu: "ڕزگۆیز", feeIqd: 4000 },
  "بەردەکەر": { nameKu: "بەردەکەر", feeIqd: 4000 },
  "قەرەداغ": { nameKu: "قەرەداغ", feeIqd: 4000 },
  "سیتەک": { nameKu: "سیتەک", feeIqd: 4000 },
  "چوارتا": { nameKu: "چوارتا", feeIqd: 4000 },
  "کەنەکەوە": { nameKu: "کەنەکەوە", feeIqd: 4000 },
  "ڕانیە": { nameKu: "ڕانیە", feeIqd: 4000 },
  "چەمچەماڵ": { nameKu: "چەمچەماڵ", feeIqd: 4000 },
  "تاسلوجە": { nameKu: "تاسلوجە", feeIqd: 4000 },
  "بازیان": { nameKu: "بازیان", feeIqd: 4000 },
  "تەکیە": { nameKu: "تەکیە", feeIqd: 4000 },
  "بەردەقامران": { nameKu: "بەردەقامران", feeIqd: 4000 },
  "هەڵەبجەی تازە": { nameKu: "هەڵەبجەی تازە", feeIqd: 4000 },
  "دەربەندیخان": { nameKu: "دەربەندیخان", feeIqd: 4000 },
  "پێنجوێن": { nameKu: "پێنجوێن", feeIqd: 4000 },
  "سەیدسادق": { nameKu: "سەیدسادق", feeIqd: 4000 },
  "زەرایه‌ن": { nameKu: "زەرایان", feeIqd: 4000 },
  "عەربه‌ت": { nameKu: "عەمریت", feeIqd: 4000 },
  "سەموود": { nameKu: "سەموود", feeIqd: 4000 },
  "ڕزگاری": { nameKu: "ڕزگاری", feeIqd: 4000 },
  "باوەنور": { nameKu: "باوەنور", feeIqd: 4000 },
  "کفری": { nameKu: "کەفری", feeIqd: 4000 },
  "پیرەمەگرون": { nameKu: "پیرەمەگڕون", feeIqd: 4000 },
  "دوکان": { nameKu: "دوکان", feeIqd: 4000 },
  "خەلەکان": { nameKu: "خەڵەکان", feeIqd: 4000 },
  "چوارقوڕنە": { nameKu: "چوارقوڕنە", feeIqd: 4000 },
  "حاجیاوا": { nameKu: "حاجیاوا", feeIqd: 4000 },
  "سه‌نگەسەر": { nameKu: "سێنگەسەر", feeIqd: 4000 },
  "قەڵادزێ": { nameKu: "قەڵادزێ", feeIqd: 4000 },
  "کۆیە": { nameKu: "کۆیە", feeIqd: 4000 },
  "تەق تەق": { nameKu: "تەق تەق", feeIqd: 4000 },
  "پشدەر": { nameKu: "پشدەر", feeIqd: 4000 },
  "سۆران": { nameKu: "سۆران", feeIqd: 4000 },
  "خەلیفان": { nameKu: "خەلیفان", feeIqd: 4000 },
  "پیرمام": { nameKu: "پیرمام", feeIqd: 4000 },
  "مەسیف": { nameKu: "مەسیف", feeIqd: 4000 },
  "شەقڵاوە": { nameKu: "شەقڵاوە", feeIqd: 4000 },
  "هەریر": { nameKu: "هەریر", feeIqd: 4000 },
  "باڵه‌کایەتی": { nameKu: "بەلەکایەتی", feeIqd: 4000 },
  "مێرگەسور": { nameKu: "مێرگەسور", feeIqd: 4000 },
  "بله‌": { nameKu: "بڵە", feeIqd: 4000 },
  "بارزان": { nameKu: "بارزان", feeIqd: 4000 },
  "سەیدکان": { nameKu: "سەیدکان", feeIqd: 4000 },
  "بەستۆرە": { nameKu: "بەستۆرە", feeIqd: 4000 },
  "ڕەواندز": { nameKu: "ڕەواندز", feeIqd: 4000 },
  "چۆمان": { nameKu: "چۆمان", feeIqd: 4000 },
  "حاجی ئۆمەران": { nameKu: "حاجی ئۆمەران", feeIqd: 4000 },
  "زاخۆ": { nameKu: "زاخۆ", feeIqd: 4000 },
  "شێخان": { nameKu: "شێخان", feeIqd: 4000 },
  "بەردەڕەش": { nameKu: "بەردەڕەش", feeIqd: 4000 },
  "شیلادزێ": { nameKu: "شیلادزێ", feeIqd: 4000 },
  "کەڵەک": { nameKu: "کەلەک", feeIqd: 4000 },
  "قەسری": { nameKu: "قەسری", feeIqd: 4000 },
  "مەخمور": { nameKu: "مەخمور", feeIqd: 4000 },
  "وەرتی": { nameKu: "وەرتی", feeIqd: 4000 },
  "قوش تەپە": { nameKu: "قوش تەپە", feeIqd: 4000 },
  "ناحیەی شوان": { nameKu: "ناحیەی شوان", feeIqd: 4000 },
  "دۆزخورماتوو": { nameKu: "دۆزخورماتوو", feeIqd: 4000 },
  "بەغداد": { nameKu: "بەغداد", feeIqd: 6000 },
  "باشووری عێراق": { nameKu: "باشووری عێراق", feeIqd: 8000 },
  "ناو شاری سلێمانی": { nameKu: "سلێمانی", feeIqd: 3000 },
  "هەوانە": { nameKu: "هەوانە", feeIqd: 4000 },
  "ئاڵە": { nameKu: "ئاڵە", feeIqd: 4000 },
  "کانی شێنە": { nameKu: "کانی شێنە", feeIqd: 4000 },
  "مەلا داود": { nameKu: "مەلا داود", feeIqd: 4000 },
  "تۆوە سپی": { nameKu: "تۆوە سپی", feeIqd: 4000 },
  "سەرداراوا": { nameKu: "سەرداراوا", feeIqd: 4000 },
  "ئالایی": { nameKu: "ئالایی", feeIqd: 4000 },
  "تێنال": { nameKu: "تێنال", feeIqd: 4000 },
  "بانیجان": { nameKu: "بانیجان", feeIqd: 4000 },
  "زەرایان": { nameKu: "زەرایان", feeIqd: 4000 },
  "عەمریت": { nameKu: "عەمریت", feeIqd: 4000 },
  "کانی گۆران": { nameKu: "کانی گۆران", feeIqd: 4000 },
  "بەنگرد": { nameKu: "بەنگرد", feeIqd: 4000 },
  "کەفری": { nameKu: "کەفری", feeIqd: 4000 },
  "پیرەمەگڕون": { nameKu: "پیرەمەگڕون", feeIqd: 4000 },
  "خەڵەکان": { nameKu: "خەڵەکان", feeIqd: 4000 },
  "سێنگەسەر": { nameKu: "سێنگەسەر", feeIqd: 4000 },
  "سەروچاوا": { nameKu: "سەروچاوا", feeIqd: 4000 },
  "بەلەکایەتی": { nameKu: "بەلەکایەتی", feeIqd: 4000 },
  "بڵە": { nameKu: "بڵە", feeIqd: 4000 },
  "باسرمه": { nameKu: "باسرمه", feeIqd: 4000 },
  "تاکەر": { nameKu: "تاکەر", feeIqd: 4000 },
  "تامەندی": { nameKu: "تامەندی", feeIqd: 4000 },
  "سیمێل": { nameKu: "سیمێل", feeIqd: 4000 },
  "کەلەک": { nameKu: "کەلەک", feeIqd: 4000 },
  "ڕۆڤیا": { nameKu: "ڕۆڤیا", feeIqd: 4000 },
  "سەرەسنک": { nameKu: "سەرەسنک", feeIqd: 4000 },
  "باتیف": { nameKu: "باتیف", feeIqd: 4000 },
  "کوێر": { nameKu: "کوێر", feeIqd: 4000 },
  "هێران": { nameKu: "هێران", feeIqd: 4000 },
  "نازنین": { nameKu: "نازنین", feeIqd: 4000 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return reply(503, { error: "Order service is not configured yet." });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "Invalid JSON." }); }

  // Simple honeypot for low-effort bot submissions.
  if (clean(body.website, 200)) return reply(200, { ok: true, orderNumber: "received" });

  const customerName = clean(body.customerName, 120);
  const customerPhone = clean(body.customerPhone, 40);
  const deliveryAreaId = clean(body.city, 100);
  const address = clean(body.address, 500);
  const instructions = clean(body.instructions, 500);
  const paymentMethod = clean(body.paymentMethod, 40);
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (customerName.length < 2 || customerPhone.length < 6 || !deliveryAreaId || address.length < 5) {
    return reply(400, { error: "Please provide your name, phone number, city and full delivery address." });
  }
  if (!["cash_on_delivery", "fib_manual"].includes(paymentMethod)) {
    return reply(400, { error: "Please choose a supported payment method." });
  }
  if (rawItems.length < 1 || rawItems.length > 50) return reply(400, { error: "Your basket is empty or contains too many items." });

  // Prices always come from published Supabase products, never from browser totals.
  // Prefer stable product UUIDs; accept name_en only for older cached storefront pages.
  type RequestedItem = { productId?: string; name?: string; quantity: number };
  const requested = new Map<string, RequestedItem>();
  for (const item of rawItems as any[]) {
    const rawProductId = clean(item?.productId, 36).toLowerCase();
    const productId = rawProductId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(rawProductId) ? rawProductId : "";
    const name = clean(item?.name, 160);
    const qty = Number(item?.quantity);
    if ((rawProductId && !productId) || (!productId && !name) || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return reply(400, { error: "One or more basket items are invalid. Please reload the shop and try again." });
    }
    const key = productId ? `id:${productId}` : `name:${name}`;
    const previous = requested.get(key);
    const combinedQuantity = (previous?.quantity ?? 0) + qty;
    if (combinedQuantity > 99) return reply(400, { error: "A basket item cannot exceed 99 units." });
    requested.set(key, { ...(productId ? { productId } : { name }), quantity: combinedQuantity });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const requestedIds = [...requested.values()].flatMap(item => item.productId ? [item.productId] : []);
  const requestedNames = [...requested.values()].flatMap(item => item.name ? [item.name] : []);
  const productColumns = "id,name_en,name_ku,price_iqd,sale_price_iqd,in_stock,published";
  const productRows: any[] = [];
  if (requestedIds.length) {
    const { data, error } = await supabase.from("products").select(productColumns).in("id", requestedIds).eq("published", true);
    if (error) {
      console.error("Product ID lookup failed", error.message);
      return reply(500, { error: "We could not verify current product prices. Please try again later." });
    }
    productRows.push(...(data ?? []));
  }
  if (requestedNames.length) {
    const { data, error } = await supabase.from("products").select(productColumns).in("name_en", requestedNames).eq("published", true);
    if (error) {
      console.error("Product name lookup failed", error.message);
      return reply(500, { error: "We could not verify current product prices. Please try again later." });
    }
    productRows.push(...(data ?? []));
  }
  const uniqueProducts: any[] = [];
  const seenProductIds = new Set<string>();
  for (const product of productRows) {
    if (seenProductIds.has(product.id)) continue;
    seenProductIds.add(product.id);
    uniqueProducts.push(product);
  }
  const productById = new Map<string, any>();
  const productByName = new Map<string, any>();
  for (const product of uniqueProducts) {
    productById.set(product.id, product);
    if (!requestedNames.includes(product.name_en)) continue;
    if (productByName.has(product.name_en)) {
      console.error("Ambiguous product name in catalogue", product.name_en);
      return reply(500, { error: "The product catalogue contains duplicate names. Please refresh the basket or contact Ultra Beauty." });
    }
    productByName.set(product.name_en, product);
  }
  const items: any[] = [];
  for (const requestedItem of requested.values()) {
    const product: any = requestedItem.productId ? productById.get(requestedItem.productId) : productByName.get(requestedItem.name ?? "");
    const quantity = requestedItem.quantity;
    if (!product || !product.in_stock) {
      return reply(400, { error: "A basket product is no longer published or in stock. Please reload the shop and try again." });
    }
    const unitPriceIqd = Number(product.sale_price_iqd ?? product.price_iqd);
    if (!Number.isInteger(unitPriceIqd) || unitPriceIqd < 0 || unitPriceIqd * quantity > 2147483647) {
      return reply(400, { error: `The price for “${product.name_en}” is not configured correctly yet. Please contact Ultra Beauty.` });
    }
    items.push({
      productId: product.id,
      nameEn: product.name_en,
      nameKu: product.name_ku,
      quantity,
      unitPriceIqd,
      lineTotalIqd: unitPriceIqd * quantity,
    });
  }
  const subtotal = items.reduce((sum, item) => sum + item.lineTotalIqd, 0);
  const deliveryArea = DELIVERY_AREAS[deliveryAreaId];
  if (!deliveryArea) return reply(400, { error: "Please choose one of the available delivery areas." });
  const cityLabel = deliveryArea.nameKu;
  const deliveryFee = deliveryArea.feeIqd;
  const total = subtotal + deliveryFee;
  if (!Number.isSafeInteger(total) || total > 2147483647) {
    return reply(400, { error: "Your order total exceeds the supported amount. Please contact Ultra Beauty." });
  }
  const { data: order, error: insertError } = await supabase.from("orders").insert({
    customer_name: customerName,
    customer_phone: customerPhone,
    city: cityLabel,
    delivery_address: address,
    delivery_instructions: instructions,
    payment_method: paymentMethod,
    items,
    subtotal_iqd: subtotal,
    delivery_fee_iqd: deliveryFee,
    total_iqd: total,
  }).select("id,order_number,created_at").single();

  if (insertError || !order) {
    console.error("Order insert failed", insertError?.message);
    return reply(500, { error: "We could not save your order. Please try again or contact us on WhatsApp." });
  }

  const itemLines = items.map((x: any) => `• ${x.nameEn} × ${x.quantity} — ${money(x.lineTotalIqd)}`).join("\n");
  const paymentLabel = paymentMethod === "cash_on_delivery" ? "Cash on delivery" : "FIB manual transfer";
  const emailText = [
    `New Ultra Beauty order: ${order.order_number}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `City: ${cityLabel}`,
    `Address: ${address}`,
    instructions ? `Delivery instructions: ${instructions}` : "",
    `Payment: ${paymentLabel}`,
    "",
    "Items:",
    itemLines,
    "",
    `Subtotal: ${money(subtotal)}`,
    `Delivery: ${deliveryFee === 0 ? "Free" : money(deliveryFee)}`,
    `Total: ${money(total)}`,
    `Status: New`,
  ].filter(Boolean).join("\n");

  let emailStatus = "not_configured";
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("ORDER_NOTIFICATION_EMAIL") ?? "sirwanf1@gmail.com";
  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") ?? "Ultra Beauty Orders <onboarding@resend.dev>",
          to: [notifyEmail],
          subject: `New Ultra Beauty order ${order.order_number} — ${money(total)}`,
          text: emailText,
        }),
      });
      emailStatus = response.ok ? "sent" : "failed";
      if (!response.ok) console.error("Email provider failed", response.status, (await response.text()).slice(0, 300));
    } catch (error) {
      emailStatus = "failed";
      console.error("Email provider error", String(error));
    }
  }

  let whatsappStatus = "not_configured";
  const waToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const waPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const waTemplate = Deno.env.get("WHATSAPP_ORDER_TEMPLATE_NAME");
  const waLanguage = Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") ?? "en";
  const waRecipient = (Deno.env.get("ORDER_NOTIFICATION_WHATSAPP") ?? "9647706943110").replace(/\D/g, "");
  if (waToken && waPhoneNumberId && waTemplate) {
    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${waPhoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${waToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: waRecipient,
          type: "template",
          template: {
            name: waTemplate,
            language: { code: waLanguage },
            components: [{ type: "body", parameters: [
              { type: "text", text: customerName },
              { type: "text", text: customerPhone },
              { type: "text", text: `${address}, ${cityLabel}` },
              { type: "text", text: order.order_number },
            ] }],
          },
        }),
      });
      whatsappStatus = response.ok ? "sent" : "failed";
      if (!response.ok) console.error("WhatsApp provider failed", response.status, (await response.text()).slice(0, 300));
    } catch (error) {
      whatsappStatus = "failed";
      console.error("WhatsApp provider error", String(error));
    }
  }

  await supabase.from("orders").update({
    notification_email_status: emailStatus,
    notification_whatsapp_status: whatsappStatus,
  }).eq("id", order.id);

  // Do not report the order as failed if it was saved but a notification provider failed.
  return reply(201, {
    ok: true,
    orderReference: order.order_number,
    orderNumber: order.order_number,
    subtotalIqd: subtotal,
    deliveryFeeIqd: deliveryFee,
    totalIqd: total,
    items,
    notification: { email: emailStatus, whatsapp: whatsappStatus },
  });
});
