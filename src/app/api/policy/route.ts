import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Policy = {
  policyId: string;
  type: string;
  status: string;
  provider: string;
  providerLogo: string;
  coverage: string;
  premium: string;
  claimAmount: string;
  members: Array<{ name: string; avatar: string }>;
  daysLeft: number;
  renewalDate: string; // YYYY-MM-DD
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

function rowToPolicy(row: Record<string, unknown>): Policy {
  return {
    policyId: String(row.policy_id ?? ""),
    type: String(row.type ?? ""),
    status: String(row.status ?? ""),
    provider: String(row.provider ?? ""),
    providerLogo: String(row.provider_logo ?? ""),
    coverage: String(row.coverage ?? "-"),
    premium: String(row.premium ?? "-"),
    claimAmount: String(row.claim_amount ?? "None"),
    members: Array.isArray(row.members)
      ? (row.members as Array<{ name: string; avatar: string }>)
      : [],
    daysLeft: Number(row.days_left ?? 0),
    renewalDate: String(row.renewal_date ?? ""),
  };
}

async function getPoliciesFromSupabase(
  userId: string,
): Promise<Policy[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return null;
  return (data ?? []).map((row) => rowToPolicy(row as Record<string, unknown>));
}

async function addPolicyToSupabase(
  userId: string,
  policy: Policy,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("policies").insert({
    user_id: userId,
    policy_id: policy.policyId,
    type: policy.type,
    status: policy.status,
    provider: policy.provider,
    provider_logo: policy.providerLogo,
    coverage: policy.coverage,
    premium: policy.premium,
    claim_amount: policy.claimAmount,
    members: policy.members,
    days_left: policy.daysLeft,
    renewal_date: policy.renewalDate,
  });
  return !error;
}

async function updatePolicyInSupabase(
  userId: string,
  policy: Policy,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("policies")
    .update({
      type: policy.type,
      status: policy.status,
      provider: policy.provider,
      provider_logo: policy.providerLogo,
      coverage: policy.coverage,
      premium: policy.premium,
      claim_amount: policy.claimAmount,
      members: policy.members,
      days_left: policy.daysLeft,
      renewal_date: policy.renewalDate,
    })
    .eq("user_id", userId)
    .eq("policy_id", policy.policyId);

  return !error;
}

// In-memory fallback when Supabase is not configured (e.g. local dev without env)
const policiesStore: Record<string, Policy[]> = {};

async function getPoliciesForUser(userId: string): Promise<Policy[]> {
  if (!userId) return [];
  const fromDb = await getPoliciesFromSupabase(userId);
  if (fromDb !== null) return fromDb;
  if (!policiesStore[userId]) policiesStore[userId] = [];
  return policiesStore[userId];
}

export async function GET(req: Request) {
  const headersList = await headers();
  const userId =
    headersList.get("X-User-Id") ?? req.headers.get("X-User-Id") ?? "";
  const userPolicies = await getPoliciesForUser(userId);
  const apiDocumentation = {
    apiVersion: "1.0.0",
    baseUrl: "https://api.plans.com/v1",
    endpoints: {
      user: {
        getUserProfile: {
          method: "GET",
          path: "/users/{userId}",
          response: {
            userId: "u_8473829",
            name: "Herman Mayoe",
            age: 32,
            gender: "Male",
            email: "herman.mayoe@email.com",
            phone: "+1-555-0123",
            riskScore: 72,
            riskLevel: "Medium",
          },
        },
        updateUserProfile: {
          method: "PUT",
          path: "/users/{userId}",
          body: {
            name: "string",
            age: "number",
            email: "string",
            phone: "string",
          },
        },
      },
      policies: {
        getAllPolicies: {
          method: "GET",
          path: "/users/{userId}/policies",
          response: userPolicies,
        },
        getPolicyById: {
          method: "GET",
          path: "/policies/{policyId}",
          response: {
            policyId: "#0239886484",
            type: "Health",
            status: "Active",
            provider: "Care Health Supreme",
            details: "Full policy details...",
          },
        },
        downloadPolicy: {
          method: "GET",
          path: "/policies/{policyId}/download",
          response: {
            downloadUrl: "https://cdn.plans.com/policies/policy_0239886484.pdf",
            expiresIn: 3600,
          },
        },
      },
      riskAssessment: {
        getRiskScore: {
          method: "GET",
          path: "/users/{userId}/risk-score",
          response: {
            userId: "u_8473829",
            overallScore: 72,
            riskLevel: "Medium",
            personalFactors: {
              health: {
                name: "Health",
                score: 65,
                level: "Mitigate Your Risks",
                providerLogo:
                  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
                factors: [
                  { name: "Hospitalization", status: "covered", risk: "low" },
                  { name: "Daycare", status: "covered", risk: "low" },
                  { name: "Critical illness", status: "covered", risk: "low" },
                  { name: "Cosmetic", status: "not_covered", risk: "medium" },
                  {
                    name: "Routine checkups",
                    status: "not_covered",
                    risk: "medium",
                  },
                  { name: "Overseas", status: "not_covered", risk: "medium" },
                ],
                coveredBy: "Care Health Supreme",
              },
              life: {
                name: "Life",
                score: 80,
                level: "Good",
                providerLogo:
                  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
                factors: [
                  { name: "Death benefit", status: "covered", risk: "low" },
                  { name: "Accidental death", status: "covered", risk: "low" },
                  { name: "Terminal illness", status: "covered", risk: "low" },
                  { name: "Suicide", status: "not_covered", risk: "medium" },
                  {
                    name: "Drug/Alcohol",
                    status: "not_covered",
                    risk: "medium",
                  },
                  {
                    name: "Policy lapsed",
                    status: "not_covered",
                    risk: "medium",
                  },
                ],
                coveredBy: "Purelife Smart Protect",
              },
            },
            assetFactors: {
              home: {
                name: "Home",
                score: 70,
                level: "Mitigate Your Risks",
                providerLogo:
                  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
                factors: [
                  { name: "Fire damage", status: "covered", risk: "low" },
                  { name: "Flood/Earthquake", status: "covered", risk: "low" },
                  { name: "Theft Protection", status: "covered", risk: "low" },
                  { name: "War damage", status: "not_covered", risk: "high" },
                  {
                    name: "Illegal extension",
                    status: "not_covered",
                    risk: "medium",
                  },
                ],
                coveredBy: "Smart Home Shield",
              },
              auto: {
                name: "Auto",
                score: 85,
                level: "Excellent",
                providerLogo:
                  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
                factors: [
                  { name: "Theft protection", status: "covered", risk: "low" },
                  { name: "Personal accident", status: "covered", risk: "low" },
                  { name: "Fire/Flood damage", status: "covered", risk: "low" },
                  {
                    name: "Drunk driving",
                    status: "not_covered",
                    risk: "high",
                  },
                  {
                    name: "Wear & Tear",
                    status: "not_covered",
                    risk: "medium",
                  },
                ],
                coveredBy: "Motor Premium Plus",
              },
            },
          },
        },
      },
      premiumOverview: {
        getPremiumSummary: {
          method: "GET",
          path: "/users/{userId}/premium-overview",
          response: {
            totalYearlyPremium: 10000,
            totalPolicies: 7,
            breakdown: [
              {
                category: "Health",
                yearlyPremium: 3000,
                policyCount: 2,
              },
              {
                category: "Auto",
                yearlyPremium: 1000,
                policyCount: 1,
              },
              {
                category: "Life",
                yearlyPremium: 5000,
                policyCount: 3,
              },
              {
                category: "Home",
                yearlyPremium: 1000,
                policyCount: 1,
              },
            ],
          },
        },
      },
      claims: {
        getAllClaims: {
          method: "GET",
          path: "/users/{userId}/claims",
          response: [
            {
              claimId: "CLM-1020",
              type: "Health",
              policyId: "#0239886484",
              title: "Hospitalization Expenses",
              amount: 250,
              status: "Pending",
              provider: "Apollo Healthcare",
              submittedDate: "2025-10-25",
              estimatedResolutionDays: 5,
            },
            {
              claimId: "CLM-1021",
              type: "Auto",
              policyId: "#0239886485",
              title: "Accidental Damage Repair",
              amount: 120,
              status: "Pending",
              provider: "Maruti Suzuki",
              submittedDate: "2025-10-25",
              estimatedResolutionDays: 7,
            },
          ],
        },
        submitClaim: {
          method: "POST",
          path: "/claims",
          body: {
            userId: "string",
            policyId: "string",
            type: "string",
            description: "string",
            amount: "number",
            documents: ["array of file uploads"],
          },
          response: {
            claimId: "CLM-1022",
            status: "Submitted",
            message: "Your claim has been successfully submitted",
          },
        },
      },
      quickActions: {
        downloadPolicy: {
          method: "POST",
          path: "/quick-actions/download-policy",
          body: {
            policyId: "string",
          },
        },
        getNetworkHospitals: {
          method: "GET",
          path: "/quick-actions/network-hospitals",
          query: {
            location: "string",
            radius: "number",
          },
          response: [
            {
              hospitalName: "Apollo Healthcare",
              address: "123 Main St, Chennai",
              distance: "2.5 km",
              rating: 4.5,
              phone: "+91-44-1234567",
            },
          ],
        },
        getBlacklistedHospitals: {
          method: "GET",
          path: "/quick-actions/blacklisted-hospitals",
          response: [
            {
              hospitalName: "Blacklisted Hospital Name",
              reason: "Fraudulent claims",
              blacklistedDate: "2024-05-15",
            },
          ],
        },
        startPolicyChat: {
          method: "POST",
          path: "/quick-actions/policy-chat",
          body: {
            userId: "string",
            policyId: "string",
            message: "string",
          },
        },
      },
      offers: {
        getExclusiveOffers: {
          method: "GET",
          path: "/users/{userId}/offers",
          response: [
            {
              offerId: "off_auto_001",
              type: "Auto Insurance",
              provider: "Nationwide",
              discount: "20%",
              discountType: "Yearly",
              price: 120,
              priceType: "MONTHLY",
              offerEnds: "2025-11-10",
              description:
                "Get customized auto insurance with 20% yearly savings",
              image:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
            },

            {
              offerId: "off_health_001",
              type: "Health Insurance",
              provider: "Care Health Supreme",
              discount: "20%",
              discountType: "Yearly",
              price: 80,
              priceType: "MONTHLY",
              offerEnds: "2025-11-10",
              description:
                "Comprehensive health coverage with significant savings",
              image:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
            },
          ],
        },
        getQuote: {
          method: "POST",
          path: "/offers/{offerId}/quote",
          body: {
            userId: "string",
            duration: "string",
          },
        },
      },
      notifications: {
        getNotifications: {
          method: "GET",
          path: "/users/{userId}/notifications",
          response: [
            {
              notificationId: "notif_001",
              type: "policy_renewal",
              title: "Policy Renewal Due",
              provider: "Care Health Supreme",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Home",
              message: "Your Care Health Supreme policy expires in 2 days",
              priority: "high",
              read: false,
              timestamp: "2026-02-09T10:30:00Z",
            },
            {
              notificationId: "notif_002",
              type: "claim_update",
              title: "Claim Status Updated",
              provider: "Care Health Supreme",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Health",
              message:
                "Your hospitalization claim CLM-1020 is now pending review",
              priority: "medium",
              read: false,
              timestamp: "2026-02-08T14:15:00Z",
            },
            {
              notificationId: "notif_003",
              type: "payment",
              title: "Premium Payment Received",
              provider: "Motor Premium Plus",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Auto",
              message: "We received your Motor Premium Plus payment of ₹3,600",
              priority: "low",
              read: true,
              timestamp: "2026-02-07T09:00:00Z",
            },
            {
              notificationId: "notif_004",
              type: "policy_renewal",
              title: "Auto Policy Renewal Reminder",
              provider: "Motor Premium Plus",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Auto",
              message: "Motor Premium Plus renews on Mar 1, 2026",
              priority: "medium",
              read: true,
              timestamp: "2026-02-05T16:45:00Z",
            },
            {
              notificationId: "notif_005",
              type: "claim_update",
              title: "Claim Approved",
              provider: "Care Health Supreme",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Health",
              message: "Claim CLM-1018 has been approved for payout",
              priority: "low",
              read: true,
              timestamp: "2026-02-04T11:00:00Z",
            },
            {
              notificationId: "notif_006",
              type: "payment",
              title: "Payment Due Soon",
              provider: "Care Health Supreme",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Health",
              message: "Annual premium of ₹12,000 due on Feb 15, 2026",
              priority: "high",
              read: false,
              timestamp: "2026-02-03T09:30:00Z",
            },
            {
              notificationId: "notif_007",
              type: "policy_renewal",
              title: "Travel Policy Expiring",
              provider: "Global Travel Guard",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Travel",
              message: "Your travel policy expires in 14 days",
              priority: "medium",
              read: false,
              timestamp: "2026-02-02T15:20:00Z",
            },
            {
              notificationId: "notif_008",
              type: "claim_update",
              title: "Documents Required",
              provider: "Motor Premium Plus",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Auto",
              message: "Upload repair invoice for claim CLM-1022",
              priority: "high",
              read: false,
              timestamp: "2026-02-01T08:45:00Z",
            },
            {
              notificationId: "notif_009",
              type: "payment",
              title: "Auto Debit Scheduled",
              provider: "Motor Premium Plus",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Auto",
              message: "₹3,600 will be debited on Feb 10, 2026",
              priority: "low",
              read: true,
              timestamp: "2026-01-31T12:00:00Z",
            },
            {
              notificationId: "notif_010",
              type: "policy_renewal",
              title: "Life Policy Review",
              provider: "SecureLife Plus",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Life",
              message: "Annual policy review scheduled for Mar 2026",
              priority: "medium",
              read: true,
              timestamp: "2026-01-30T10:15:00Z",
            },
            {
              notificationId: "notif_011",
              type: "claim_update",
              title: "Claim Rejected",
              provider: "Global Travel Guard",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Travel",
              message: "Claim CLM-1005 rejected — missing boarding pass",
              priority: "high",
              read: true,
              timestamp: "2026-01-29T17:30:00Z",
            },
            {
              notificationId: "notif_012",
              type: "payment",
              title: "Refund Processed",
              provider: "Care Health Supreme",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Health",
              message: "₹2,400 refund credited to your account",
              priority: "low",
              read: true,
              timestamp: "2026-01-28T14:00:00Z",
            },
            {
              notificationId: "notif_013",
              type: "policy_renewal",
              title: "Home Insurance Renewal",
              provider: "Home Shield Pro",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Home",
              message: "Renew before Feb 28 to avoid lapse",
              priority: "medium",
              read: false,
              timestamp: "2026-01-27T11:45:00Z",
            },
            {
              notificationId: "notif_014",
              type: "claim_update",
              title: "Survey Scheduled",
              provider: "Home Shield Pro",
              providerLogo:
                "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
              category: "Home",
              message: "Surveyor visit scheduled for Feb 6, 2026",
              priority: "medium",
              read: true,
              timestamp: "2026-01-26T09:00:00Z",
            },
          ],
        },
      },
      expiry: {
        getExpiry: {
          method: "GET",
          path: "/users/{userId}/expiry",
          response: [
            {
              policyId: "#0239886484",
              type: "Auto",
              dueDate: "2026-02-11",
              daysLeft: 2,
            },
            {
              policyId: "#0239886485",
              type: "Health",
              dueDate: "2026-02-11",
              daysLeft: 8,
            },
            {
              policyId: "#0239886486",
              type: "Life",
              dueDate: "2026-02-11",
              daysLeft: 7,
            },
            {
              policyId: "#0239886487",
              type: "Travel",
              dueDate: "2026-02-11",
              daysLeft: 6,
            },
            {
              policyId: "#0239886488",
              type: "Home",
              dueDate: "2026-02-11",
              daysLeft: 5,
            },
          ],
        },
      },
    },
    authentication: {
      login: {
        method: "POST",
        path: "/auth/login",
        body: {
          email: "string",
          password: "string",
        },
        response: {
          token: "jwt_token_here",
          userId: "u_8473829",
          expiresIn: 86400,
        },
      },
      logout: {
        method: "POST",
        path: "/auth/logout",
        headers: {
          Authorization: "Bearer {token}",
        },
      },
    },
    errorCodes: {
      "400": "Bad Request - Invalid input data",
      "401": "Unauthorized - Invalid or missing authentication token",
      "403": "Forbidden - Insufficient permissions",
      "404": "Not Found - Resource does not exist",
      "500": "Internal Server Error - Something went wrong on our end",
    },
  };
  return NextResponse.json(apiDocumentation);
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

    const body = (await req.json()) as Partial<Policy & { userId?: string }>;
    const policyId = body.policyId?.toString().trim();
    const type = body.type?.toString().trim();
    const status = body.status?.toString().trim();
    const provider = body.provider?.toString().trim();

    if (!policyId || !type || !status || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: policyId, type, status, provider" },
        { status: 400 },
      );
    }

    const userPolicies = await getPoliciesForUser(userId);
    if (userPolicies.some((p) => p.policyId === policyId)) {
      return NextResponse.json(
        { error: "Policy with this ID already exists" },
        { status: 409 },
      );
    }

    const newPolicy: Policy = {
      policyId,
      type,
      status,
      provider,
      providerLogo:
        body.providerLogo?.toString().trim() ||
        "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
      coverage: body.coverage?.toString().trim() || "-",
      premium: body.premium?.toString().trim() || "-",
      claimAmount: body.claimAmount?.toString().trim() || "None",
      members: Array.isArray(body.members) ? body.members : [],
      daysLeft:
        typeof body.daysLeft === "number"
          ? body.daysLeft
          : Number(body.daysLeft ?? 0) || 0,
      renewalDate: body.renewalDate?.toString().trim() || "2026-02-11",
    };

    if (supabaseConfigured) {
      const inserted = await addPolicyToSupabase(userId, newPolicy);
      if (!inserted) {
        return NextResponse.json(
          { error: "Failed to save policy" },
          { status: 500 },
        );
      }
    } else {
      policiesStore[userId] = [newPolicy, ...userPolicies];
    }

    const updatedList = await getPoliciesForUser(userId);
    return NextResponse.json({
      ok: true,
      policy: newPolicy,
      policies: updatedList,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
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

    const body = (await req.json()) as Partial<Policy>;
    const policyId = body.policyId?.toString().trim();
    const type = body.type?.toString().trim();
    const status = body.status?.toString().trim();
    const provider = body.provider?.toString().trim();

    if (!policyId || !type || !status || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: policyId, type, status, provider" },
        { status: 400 },
      );
    }

    const userPolicies = await getPoliciesForUser(userId);
    const existing = userPolicies.find((p) => p.policyId === policyId);

    if (!existing) {
      return NextResponse.json(
        { error: "Policy not found for update" },
        { status: 404 },
      );
    }

    const updatedPolicy: Policy = {
      ...existing,
      policyId,
      type,
      status,
      provider,
      providerLogo:
        body.providerLogo?.toString().trim() || existing.providerLogo,
      coverage: body.coverage?.toString().trim() || "-",
      premium: body.premium?.toString().trim() || "-",
      claimAmount: body.claimAmount?.toString().trim() || "None",
      members: Array.isArray(body.members) ? body.members : existing.members,
      daysLeft:
        typeof body.daysLeft === "number"
          ? body.daysLeft
          : Number(body.daysLeft ?? existing.daysLeft) || 0,
      renewalDate: body.renewalDate?.toString().trim() || existing.renewalDate,
    };

    if (supabaseConfigured) {
      const updated = await updatePolicyInSupabase(userId, updatedPolicy);
      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update policy" },
          { status: 500 },
        );
      }
    } else {
      policiesStore[userId] = userPolicies.map((p) =>
        p.policyId === policyId ? updatedPolicy : p,
      );
    }

    const updatedList = await getPoliciesForUser(userId);
    return NextResponse.json({
      ok: true,
      policy: updatedPolicy,
      policies: updatedList,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
