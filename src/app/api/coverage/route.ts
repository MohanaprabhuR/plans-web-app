import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CoverageProfileItem = {
  key: "personal" | "lifestyle" | "medical" | "financial";
  label: string;
  score: number; // 0-100
  status: "Excellent" | "Good" | "Fair" | "Poor";
  subtitle: string;
};

type CoveragePolicyItem = {
  category:
    | "Health Insurance"
    | "Home Insurance"
    | "Auto Insurance"
    | "Life Insurance"
    | "Pet Insurance"
    | "Renters Insurance";
  provider: string;
  coverage: string;
  score: number; // 0-100
  status: "covered" | "missing" | "none";
  message: string;
};

type CoverageRecommendation = {
  title: string;
  description: string;
  scoreImpact: number; // e.g. 15 means "+15 Score"
  pricePerYear: number;
  ctaLabel: string;
};

export type CoverageResponse = {
  userId: string;
  overallScore: number;
  risksFound: number;
  profileBreakdown: CoverageProfileItem[];
  coverageBreakdown: CoveragePolicyItem[];
  recommendations: CoverageRecommendation[];
  updatedAt: string;
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

function computeStatus(score: number): CoverageProfileItem["status"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function defaultCoverage(userId: string): CoverageResponse {
  const profileScores = {
    personal: 90,
    lifestyle: 55,
    medical: 80,
    financial: 40,
  };

  const profileBreakdown: CoverageProfileItem[] = [
    {
      key: "personal",
      label: "Personal Information",
      score: profileScores.personal,
      status: computeStatus(profileScores.personal),
      subtitle: "You are on track",
    },
    {
      key: "lifestyle",
      label: "Lifestyle",
      score: profileScores.lifestyle,
      status: computeStatus(profileScores.lifestyle),
      subtitle: "Needs a few improvement",
    },
    {
      key: "medical",
      label: "Medical History",
      score: profileScores.medical,
      status: computeStatus(profileScores.medical),
      subtitle: "You are on track",
    },
    {
      key: "financial",
      label: "Financial",
      score: profileScores.financial,
      status: computeStatus(profileScores.financial),
      subtitle: "Requirements are missing needs improvement",
    },
  ];

  const coverageBreakdown: CoveragePolicyItem[] = [
    {
      category: "Health Insurance",
      provider: "Care Health Supreme",
      coverage: "5 Lakhs",
      score: 80,
      status: "covered",
      message: "Excellent! You're well protected",
    },
    {
      category: "Home Insurance",
      provider: "Smart Home Shield",
      coverage: "10 Lakhs",
      score: 55,
      status: "missing",
      message: "Theft protection missing. Fix your gap!",
    },
    {
      category: "Auto Insurance",
      provider: "Motor Premium Plus",
      coverage: "3 Lakhs",
      score: 90,
      status: "covered",
      message: "You're protected but need to upgrade!",
    },
    {
      category: "Life Insurance",
      provider: "Purelife Smart Protect",
      coverage: "10 Lakhs",
      score: 65,
      status: "missing",
      message: "Death benefit missing. Fix your gap!",
    },
    {
      category: "Pet Insurance",
      provider: "-",
      coverage: "-",
      score: 0,
      status: "none",
      message:
        "Your pet doesn't have protection for accidents or illnesses. Adding pet insurance will help cover unexpected vet costs.",
    },
    {
      category: "Renters Insurance",
      provider: "-",
      coverage: "-",
      score: 0,
      status: "none",
      message:
        "Your belongings and liability are currently unprotected. Adding renters insurance will improve your coverage score.",
    },
  ];

  const recommendations: CoverageRecommendation[] = [
    {
      title: "Theft Protection",
      description:
        "Your belongings may not be covered against theft or burglary.",
      scoreImpact: 15,
      pricePerYear: 100,
      ctaLabel: "Get Quotes",
    },
    {
      title: "Death Benefit",
      description: "A guaranteed payout for your family in case of your death.",
      scoreImpact: 5,
      pricePerYear: 80,
      ctaLabel: "Get Quotes",
    },
    {
      title: "Pet Insurance",
      description:
        "Unexpected vet bills can be high; add pet insurance to stay protected.",
      scoreImpact: 5,
      pricePerYear: 150,
      ctaLabel: "Get Quotes",
    },
  ];

  const overallScore = Math.round(
    (profileScores.personal +
      profileScores.lifestyle +
      profileScores.medical +
      profileScores.financial) /
      4,
  );

  return {
    userId,
    overallScore,
    risksFound: 8,
    profileBreakdown,
    coverageBreakdown,
    recommendations,
    updatedAt: new Date().toISOString(),
  };
}

async function getCoverageFromSupabase(
  userId: string,
): Promise<CoverageResponse | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("coverage")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;

  return {
    userId,
    overallScore: Number(data.overall_score ?? 0),
    risksFound: Number(data.risks_found ?? 0),
    profileBreakdown: Array.isArray(data.profile_breakdown)
      ? (data.profile_breakdown as CoverageProfileItem[])
      : [],
    coverageBreakdown: Array.isArray(data.coverage_breakdown)
      ? (data.coverage_breakdown as CoveragePolicyItem[])
      : [],
    recommendations: Array.isArray(data.recommendations)
      ? (data.recommendations as CoverageRecommendation[])
      : [],
    updatedAt: String(data.updated_at ?? new Date().toISOString()),
  };
}

async function upsertCoverageToSupabase(
  userId: string,
  coverage: CoverageResponse,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("coverage").upsert(
    {
      user_id: userId,
      overall_score: coverage.overallScore,
      risks_found: coverage.risksFound,
      profile_breakdown: coverage.profileBreakdown,
      coverage_breakdown: coverage.coverageBreakdown,
      recommendations: coverage.recommendations,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  return !error;
}

// In-memory fallback when Supabase is not configured (local dev)
const coverageStore: Record<string, CoverageResponse> = {};

export async function GET(req: Request) {
  const headersList = await headers();
  const userId =
    headersList.get("X-User-Id") ?? req.headers.get("X-User-Id") ?? "";
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: X-User-Id header required" },
      { status: 401 },
    );
  }

  const fromDb = await getCoverageFromSupabase(userId);
  if (fromDb) return NextResponse.json(fromDb);

  if (!coverageStore[userId]) coverageStore[userId] = defaultCoverage(userId);
  return NextResponse.json(coverageStore[userId]);
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

    const body = (await req.json()) as Partial<CoverageResponse>;
    const next: CoverageResponse = {
      ...defaultCoverage(userId),
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (supabaseConfigured) {
      const ok = await upsertCoverageToSupabase(userId, next);
      if (!ok) {
        return NextResponse.json(
          { error: "Failed to save coverage" },
          { status: 500 },
        );
      }
    } else {
      coverageStore[userId] = next;
    }

    return NextResponse.json({ ok: true, coverage: next });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

