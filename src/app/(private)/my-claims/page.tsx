"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BriefcaseMedical,
  CarFront,
  Heart,
  House,
  PlaneTakeoff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Claim = {
  claimId: string;
  type: ReactNode;
  title: ReactNode;
  provider: ReactNode;
  submittedDate: ReactNode;
  amount: ReactNode;
  status: ReactNode;
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

  const claims = apiData?.endpoints?.claims?.getAllClaims?.response ?? [];

  if (loading) return <div>Loading claims…</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">My Claims</div>
      {claims.length === 0 ? (
        <div className="text-muted-foreground">No claims found.</div>
      ) : (
        <div className="gap-4">
          <div className="flex flex-col gap-y-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="w-full  h-16" />
              ))
            ) : (
              <>
                {apiData?.endpoints?.claims?.getAllClaims?.response?.map(
                  (claim) => (
                    <Card className="relative" key={claim.claimId}>
                      <CardContent className="flex flex-col gap-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-x-1.5">
                            <div className="flex items-center gap-x-1.5">
                              {claim.type === "Health" ? (
                                <BriefcaseMedical className="size-5" />
                              ) : claim.type === "Auto" ? (
                                <CarFront className="size-5" />
                              ) : claim.type === "Life" ? (
                                <Heart className="size-5" />
                              ) : claim.type === "Home" ? (
                                <House className="size-5" />
                              ) : claim.type === "Travel" ? (
                                <PlaneTakeoff className="size-5" />
                              ) : (
                                <></>
                              )}
                              <p className="text-base leading-6 font-medium text-accent-foreground">
                                {claim.type}
                              </p>
                            </div>
                            <div className="bg-accent-foreground size-1 rounded-full"></div>
                            <p className="text-base leading-6 font-medium text-accent-foreground">
                              {claim.claimId}
                            </p>
                          </div>
                          <Badge
                            theme="amber"
                            size="md"
                            className="rounded-r-none absolute top-4 right-0"
                          >
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-xl leading-6 text-accent-foreground tracking-4 max-w-[140px]">
                            {claim.title}
                          </p>
                          <p className="font-medium text-6xl leading-12 text-accent-foreground tracking-4">
                            ${claim.amount}
                          </p>
                        </div>
                        <div className="flex items-center justify-between bg-accent p-1.5 rounded-lg">
                          <p className="font-medium text-base leading-5 text-accent-foreground tracking-4 max-w-[130px]">
                            {claim.provider}
                          </p>
                          <p className="font-medium text-base leading-5 text-accent-foreground tracking-4">
                            {claim.submittedDate}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClaimsPage;
