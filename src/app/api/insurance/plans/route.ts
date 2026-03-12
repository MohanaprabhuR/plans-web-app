import { NextResponse } from "next/server";

type Plan = {
  planId: string;
  name: string;
  provider: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlights: string[];
};

type Body = {
  type?: string;
  answers?: unknown;
};

function makePlans(type: string): Plan[] {
  const base =
    type.trim().length > 0 ? type.trim() : "Health";

  const providers = ["Care Health", "Apollo", "HDFC Ergo", "ICICI Lombard"];
  const tiers = [
    { suffix: "Basic", m: 399, y: 399 * 12 - 500 },
    { suffix: "Plus", m: 699, y: 699 * 12 - 900 },
    { suffix: "Premium", m: 999, y: 999 * 12 - 1400 },
  ];

  return tiers.map((t, idx) => ({
    planId: `${base.toLowerCase()}_${t.suffix.toLowerCase()}_${idx + 1}`,
    name: `${base} ${t.suffix}`,
    provider: providers[idx % providers.length],
    monthlyPrice: t.m,
    yearlyPrice: t.y,
    highlights: [
      "Cashless hospitalization",
      "Fast claim settlement",
      "24/7 support",
      "No hidden charges",
    ],
  }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const type = (body.type ?? "Health").toString();
    const plans = makePlans(type);
    return NextResponse.json({ plans });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

