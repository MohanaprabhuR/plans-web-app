import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ProgressRow = {
  user_id: string;
  step_index: number;
  mode: "questions" | "plans" | "success";
  answers: unknown;
  updated_at?: string;
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

// In-memory fallback when Supabase is not configured (e.g. local dev without env)
const progressStore: Record<string, Omit<ProgressRow, "user_id">> = {};

function getUserId(req: Request, headersList: Headers) {
  return headersList.get("X-User-Id") ?? req.headers.get("X-User-Id") ?? "";
}

export async function GET(req: Request) {
  const headersList = await headers();
  const userId = getUserId(req, headersList);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: X-User-Id header required" },
      { status: 401 },
    );
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("buy_insurance_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) return NextResponse.json({ ok: true, progress: data });
  }

  const progress = progressStore[userId] ?? null;
  return NextResponse.json({ ok: true, progress });
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const userId = getUserId(req, headersList);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: X-User-Id header required" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Partial<ProgressRow>;
    const step_index =
      typeof body.step_index === "number"
        ? body.step_index
        : Number(body.step_index ?? NaN);
    const mode = body.mode;

    if (!Number.isFinite(step_index) || step_index < 0) {
      return NextResponse.json(
        { error: "Invalid step_index" },
        { status: 400 },
      );
    }
    if (mode !== "questions" && mode !== "plans" && mode !== "success") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const row: ProgressRow = {
      user_id: userId,
      step_index,
      mode,
      answers: body.answers ?? null,
    };

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("buy_insurance_progress")
        .upsert(row, { onConflict: "user_id" })
        .select("*")
        .single();

      if (!error) return NextResponse.json({ ok: true, progress: data });
    }

    progressStore[userId] = {
      step_index: row.step_index,
      mode: row.mode,
      answers: row.answers,
    };
    return NextResponse.json({ ok: true, progress: progressStore[userId] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

