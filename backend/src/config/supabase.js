const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const backendSecret = process.env.SUPABASE_BACKEND_SECRET;

if (!supabaseUrl || !supabaseKey || !backendSecret) {
  throw new Error(
    'Missing Supabase configuration. Ensure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_BACKEND_SECRET are set in backend/.env.'
  );
}

// Backend-only Supabase client passing verified server header for RLS enforcement
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'x-campus-server-key': backendSecret
    }
  }
});

module.exports = supabase;
