/* Public Supabase client configuration for Ultra Beauty.
   The publishable key is intended for browser use. Protect data with RLS.
   Never add a service-role/secret key to this file. */
window.ULTRA_BEAUTY_SUPABASE_URL = "https://rewamgakrinyhmoybefv.supabase.co";
window.ULTRA_BEAUTY_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ePUwmwmyhRtFaljIsyMFxw_GcA8DChi";
window.ULTRA_BEAUTY_SUPABASE_CLIENT = null;
(function () {
  function initialiseSupabase() {
    if (!window.supabase || !window.supabase.createClient) return;
    const projectUrl = String(window.ULTRA_BEAUTY_SUPABASE_URL || "").trim();
    const publishableKey = String(window.ULTRA_BEAUTY_SUPABASE_PUBLISHABLE_KEY || "").trim();
    const missingKey = !publishableKey || publishableKey.length < 30 ||
      /placeholder|your[_ -]?supabase|paste|replace|example|<|>/i.test(publishableKey);
    if (!/^https:\/\/[^/]+\.supabase\.co$/i.test(projectUrl) || missingKey) return;
    window.ULTRA_BEAUTY_SUPABASE_CLIENT = window.supabase.createClient(
      projectUrl,
      publishableKey,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
    window.dispatchEvent(new CustomEvent("ultra-beauty-supabase-ready"));
  }
  if (window.supabase && window.supabase.createClient) initialiseSupabase();
  else document.addEventListener("DOMContentLoaded", initialiseSupabase, { once: true });
})();
