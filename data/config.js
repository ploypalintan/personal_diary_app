/* ═══════════════════════════════════════
   config.js — public settings for sign-in and sync.

   Leave both values empty and the app stays exactly as it is now: everything lives in this
   browser only, with no sign-in. To switch sync on, create a Supabase project, run
   supabase/migrations/0001_init.sql, then paste its Project URL and "anon public" key here.
   (The anon key is meant to be public. Your data is protected by the row-level rules in the
   SQL file, not by hiding the key. NEVER paste the "service_role" key here.)
═══════════════════════════════════════ */
window.DIARY_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
