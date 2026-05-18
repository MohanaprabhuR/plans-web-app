import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
).trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "placeholder-key"
).trim();

const globalForSupabase = globalThis as typeof globalThis & {
  supabase?: SupabaseClient;
};

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = globalForSupabase.supabase ?? createSupabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
