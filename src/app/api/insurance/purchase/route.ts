import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  type?: string;
  planId?: string;
  answers?: unknown;
};

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  ""
).trim();
const supabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes("placeholder");

function getSupabase() {
  if (!supabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// In-memory fallback when Supabase is not configured
const purchasesStore: Record<string, Array<Record<string, unknown>>> = {};

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const userId =
      headersList.get("X-User-Id") ?? req.headers.get("X-User-Id") ?? "";

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: X-User-Id header required" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Body;
    const type = body.type?.toString().trim() || "Health";
    const planId = body.planId?.toString().trim();
    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const purchase = {
      user_id: userId,
      plan_id: planId,
      type,
      answers: body.answers ?? null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      // Optional table: insurance_purchases
      const { error } = await supabase.from("insurance_purchases").insert(purchase);
      if (!error) return NextResponse.json({ ok: true, purchase });
      // If the table doesn't exist / RLS blocks, fall back to in-memory below.
    }

    purchasesStore[userId] = purchasesStore[userId] ?? [];
    purchasesStore[userId].unshift(purchase);
    return NextResponse.json({ ok: true, purchase });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

