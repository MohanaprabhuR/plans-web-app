"use client";

import React, { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BriefcaseMedical,
  CarFront,
  CircleAlert,
  ClipboardList,
  Heart,
  House,
  PlaneTakeoff,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";

type Claim = {
  claimId: string;
  type: string;
  policyId: string;
  title: string;
  amount: number;
  status: string;
  provider: string;
  submittedDate: string;
  estimatedResolutionDays: number;
};

interface ApiResponse {
  endpoints: {
    claims?: {
      getAllClaims?: {
        response?: Claim[];
      };
    };
  };
}

function getTypeIcon(type: string) {
  if (type === "Health")
    return <BriefcaseMedical className="size-5 stroke-[#8E51FF]" />;
  if (type === "Auto") return <CarFront className="size-5 stroke-[#E12AFB]" />;
  if (type === "Life") return <Heart className="size-5 stroke-[#FF5255]" />;
  if (type === "Home") return <House className="size-5 stroke-[#FE9A00]" />;
  if (type === "Travel")
    return <PlaneTakeoff className="size-5 stroke-[#00D3F2]" />;
  return <ClipboardList className="size-5 stroke-muted-foreground" />;
}

function getTypeBg(type: string) {
  if (type === "Health") return "bg-[#F8F5FF]";
  if (type === "Auto") return "bg-[#FDF0FF]";
  if (type === "Life") return "bg-[#FFF5F5]";
  if (type === "Home") return "bg-[#FEF6EA]";
  if (type === "Travel") return "bg-[#E0FAFF]";
  return "bg-accent";
}

function getStatusTheme(
  status: string,
): "amber" | "green" | "red" | "blue" {
  const s = status.toLowerCase();
  if (s === "approved") return "green";
  if (s === "rejected" || s === "denied") return "red";
  if (s === "processing" || s === "in review") return "blue";
  return "amber";
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-5">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-accent-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

const MyClaimsPage = () => {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/policy", {
          cache: "no-store",
          headers: { "X-User-Id": user.id },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setApiData(json);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load claims.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const claims = useMemo(
    () => apiData?.endpoints?.claims?.getAllClaims?.response ?? [],
    [apiData],
  );

  const stats = useMemo(() => {
    const pending = claims.filter(
      (c) => c.status.toLowerCase() === "pending",
    ).length;
    const approved = claims.filter(
      (c) => c.status.toLowerCase() === "approved",
    ).length;
    const totalAmount = claims.reduce((sum, c) => sum + (c.amount ?? 0), 0);
    return { total: claims.length, pending, approved, totalAmount };
  }, [claims]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h3 className="font-semibold text-3xl leading-8 tracking-4 text-accent-foreground">
        My Claims
      </h3>

      {/* Stats row */}
      {!loading && !error && claims.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Claims" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Approved" value={stats.approved} />
          <StatCard label="Total Amount" value={`₹${stats.totalAmount}`} />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && claims.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ClipboardList className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No claims found.</p>
        </div>
      )}

      {/* Claims list */}
      {!loading && !error && claims.length > 0 && (
        <div className="flex flex-col gap-4">
          {claims.map((claim) => (
            <Card key={claim.claimId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Left color accent bar */}
                  <div
                    className={`w-1.5 shrink-0 ${
                      claim.status.toLowerCase() === "approved"
                        ? "bg-green-500"
                        : claim.status.toLowerCase() === "rejected"
                          ? "bg-red-500"
                          : "bg-amber-400"
                    }`}
                  />

                  <div className="flex flex-1 items-center gap-5 px-5 py-5">
                    {/* Icon */}
                    <div
                      className={`size-12 min-w-12 rounded-2xl flex items-center justify-center ${getTypeBg(claim.type)}`}
                    >
                      {getTypeIcon(claim.type)}
                    </div>

                    {/* Main info */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {claim.type}
                        </span>
                        <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {claim.claimId}
                        </span>
                        {claim.policyId && (
                          <>
                            <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                            <span className="text-xs text-muted-foreground">
                              Policy {claim.policyId}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-accent-foreground leading-6 tracking-4 truncate">
                        {claim.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <Badge variant="outline">{claim.provider}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Submitted {claim.submittedDate}
                        </span>
                        {claim.estimatedResolutionDays > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="size-3" />
                            Est. {claim.estimatedResolutionDays} days
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: amount + status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge theme={getStatusTheme(claim.status)}>
                        {claim.status}
                      </Badge>
                      <p className="text-2xl font-bold text-accent-foreground">
                        ₹{claim.amount}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaimsPage;
