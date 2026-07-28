import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client with service-role privileges (bypasses RLS).
// Used for storage cleanup and other privileged operations.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
