import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  ""
).trim();
const supabaseServiceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
).trim();

export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    !supabaseUrl.includes("placeholder")
  );
}

/** Server-side client. Service role bypasses RLS; user token satisfies RLS as authenticated. */
export function createSupabaseServerClient(
  accessToken?: string,
): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (supabaseServiceRoleKey) {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  const globalHeaders: Record<string, string> = {};
  if (accessToken) {
    globalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: globalHeaders },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getAccessTokenFromRequest(req: Request): string | undefined {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}
