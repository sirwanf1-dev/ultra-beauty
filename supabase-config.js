/* Public Supabase client configuration for Ultra Beauty.
   The publishable key is intended for browser use. Protect data with RLS.
   Never add a service-role/secret key to this file. */
window.ULTRA_BEAUTY_SUPABASE_URL = "https://rewamgakrinyhmoybefv.supabase.co";
window.ULTRA_BEAUTY_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ePUwmwmyhRtFaljIsyMFxw_GcA8DChi";
window.ULTRA_BEAUTY_SUPABASE_CLIENT = null;
(function () {
  function initialiseSupabase() {
    if (!window.supabase || !window.supabase.createClient) return;
    window.ULTRA_BEAUTY_SUPABASE_CLIENT = window.supabase.createClient(
      window.ULTRA_BEAUTY_SUPABASE_URL,
      window.ULTRA_BEAUTY_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
    window.dispatchEvent(new CustomEvent("ultra-beauty-supabase-ready"));
  }
  if (window.supabase && window.supabase.createClient) initialiseSupabase();
  else document.addEventListener("DOMContentLoaded", initialiseSupabase, { once: true });
})();
