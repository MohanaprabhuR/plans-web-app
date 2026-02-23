import { createClient } from "@supabase/supabase-js";

// "Invalid API key"? In project root create .env.local (note the leading dot) with exactly:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (anon public key from Dashboard → Settings → API)
// Then: rm -rf .next && npm run dev
const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
).trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "placeholder-key"
).trim();

const client = createClient(supabaseUrl, supabaseAnonKey);

export default client;
