import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Renewal = {
  renewalId: string;
  policyId: string;
  type: string;
  provider: string;
  providerLogo: string;
  currentPremium: number;
  newPremium: number;
  dueDate: string; // YYYY-MM-DD
  status: "pending" | "renewed" | "expired";
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

function rowToRenewal(row: Record<string, unknown>): Renewal {
  return {
    renewalId: String(row.renewal_id ?? ""),
    policyId: String(row.policy_id ?? ""),
    type: String(row.type ?? ""),
    provider: String(row.provider ?? ""),
    providerLogo: String(row.provider_logo ?? ""),
    currentPremium: Number(row.current_premium ?? 0),
    newPremium: Number(row.new_premium ?? 0),
    dueDate: String(row.due_date ?? ""),
    status: (row.status as Renewal["status"]) ?? "pending",
  };
}

async function getRenewalsFromSupabase(
  userId: string,
): Promise<Renewal[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("renewals")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  if (error) return null;
  return (data ?? []).map((row) => rowToRenewal(row as Record<string, unknown>));
}

async function upsertRenewalInSupabase(
  userId: string,
  renewal: Renewal,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("renewals").upsert(
    {
      user_id: userId,
      renewal_id: renewal.renewalId,
      policy_id: renewal.policyId,
      type: renewal.type,
      provider: renewal.provider,
      provider_logo: renewal.providerLogo,
      current_premium: renewal.currentPremium,
      new_premium: renewal.newPremium,
      due_date: renewal.dueDate,
      status: renewal.status,
    },
    { onConflict: "renewal_id" },
  );
  return !error;
}

// In-memory fallback when Supabase is not configured (e.g. local dev)
const renewalsStore: Record<string, Renewal[]> = {};

async function getRenewalsForUser(userId: string): Promise<Renewal[]> {
  if (!userId) return [];
  const fromDb = await getRenewalsFromSupabase(userId);
  if (fromDb !== null) return fromDb;
  if (!renewalsStore[userId]) {
    // Seed with a couple of example renewals for local dev
    renewalsStore[userId] = [
      {
        renewalId: "ren_health_001",
        policyId: "#0239886484",
        type: "Health",
        provider: "Care Health Supreme",
        providerLogo:
          "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
        currentPremium: 8000,
        newPremium: 8200,
        dueDate: "2026-02-11",
        status: "pending",
      },
      {
        renewalId: "ren_auto_001",
        policyId: "#0239886485",
        type: "Auto",
        provider: "Motor Premium Plus",
        providerLogo:
          "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
        currentPremium: 3500,
        newPremium: 3600,
        dueDate: "2026-03-01",
        status: "pending",
      },
    ];
  }
  return renewalsStore[userId];
}

export async function GET(req: Request) {
  const headersList = await headers();
  const userId =
    headersList.get("X-User-Id") ?? req.headers.get("X-User-Id") ?? "";

  const renewals = await getRenewalsForUser(userId);
  return NextResponse.json({ renewals });
}

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

    const body = (await req.json()) as Partial<Renewal>;
    const renewalId = body.renewalId?.toString().trim();
    const policyId = body.policyId?.toString().trim();
    const type = body.type?.toString().trim();
    const provider = body.provider?.toString().trim();

    if (!renewalId || !policyId || !type || !provider) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: renewalId, policyId, type, provider",
        },
        { status: 400 },
      );
    }

    const currentRenewals = await getRenewalsForUser(userId);
    const existing = currentRenewals.find((r) => r.renewalId === renewalId);

    const renewal: Renewal = {
      renewalId,
      policyId,
      type,
      provider,
      providerLogo:
        body.providerLogo?.toString().trim() ||
        "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
      currentPremium:
        typeof body.currentPremium === "number"
          ? body.currentPremium
          : Number(body.currentPremium ?? 0) || 0,
      newPremium:
        typeof body.newPremium === "number"
          ? body.newPremium
          : Number(body.newPremium ?? 0) || 0,
      dueDate: body.dueDate?.toString().trim() || "2026-02-11",
      status: body.status === "renewed" ? "renewed" : (body.status as any) || "pending",
    };

    if (supabaseConfigured) {
      const ok = await upsertRenewalInSupabase(userId, renewal);
      if (!ok) {
        return NextResponse.json(
          { error: "Failed to save renewal" },
          { status: 500 },
        );
      }
    } else {
      if (existing) {
        renewalsStore[userId] = currentRenewals.map((r) =>
          r.renewalId === renewal.renewalId ? renewal : r,
        );
      } else {
        renewalsStore[userId] = [renewal, ...currentRenewals];
      }
    }

    const updated = await getRenewalsForUser(userId);
    return NextResponse.json({ ok: true, renewal, renewals: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

