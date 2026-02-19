import { createClient } from "@supabase/supabase-js";

// Use placeholder values during build if env vars are missing (allows build to succeed).
// At runtime, if env vars are missing, auth calls will fail with a network error;
// Login/Signup components show a user-friendly message for that.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

const client = createClient(supabaseUrl, supabaseAnonKey);

export default client;