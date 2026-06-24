import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export function createSupabaseAdmin() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
