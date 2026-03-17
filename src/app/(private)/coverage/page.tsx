"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

type CoverageProfileItem = {
  key: "personal" | "lifestyle" | "medical" | "financial";
  label: string;
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Poor";
  subtitle: string;
};

type CoveragePolicyItem = {
  category: string;
  provider: string;
  coverage: string;
  score: number;
  status: "covered" | "missing" | "none";
  message: string;
};

type CoverageRecommendation = {
  title: string;
  description: string;
  scoreImpact: number;
  pricePerYear: number;
  ctaLabel: string;
};

type CoverageResponse = {
  userId: string;
  overallScore: number;
  risksFound: number;
  profileBreakdown: CoverageProfileItem[];
  coverageBreakdown: CoveragePolicyItem[];
  recommendations: CoverageRecommendation[];
  updatedAt: string;
};

export default function CoveragePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CoverageResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/coverage", {
          headers: { "X-User-Id": user.id },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as CoverageResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load coverage.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="w-full px-6 md:px-10 py-8 space-y-6">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner size="xl" track />
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <>
          <Card className="flex items-center flex-row justify-between">
            <div className="w-1/2">{data?.overallScore}</div>
            <div className="w-1/2 flex flex-col">
              <p> {user?.user_metadata?.full_name}</p>
              <Image
                src={
                  user?.user_metadata?.avatar_url ??
                  "https://mockmind-api.uifaces.co/content/human/80.jpg"
                }
                alt="avatar"
                width={100}
                height={100}
              />
              <p>
                We&apos;ve found {data?.risksFound}Risks based on your details.
              </p>
              <h2>Profile Breakdown</h2>
              <p>See how your coverage is distributed across all categories.</p>
              {data.profileBreakdown.map((profile, index) => (
                <div key={profile.key ?? index}>
                  <p>{profile.label}</p>
                  <p>{profile.score}</p>
                  <p>{profile.status}</p>
                  <p>{profile.subtitle}</p>
                </div>
              ))}
            </div>
          </Card>
          <p>Coverage Breakdown</p>
          <Card>
            {data.coverageBreakdown.map((coverage, index) => (
              <div key={coverage.category ?? index}>
                <p>{coverage.category}</p>
                <p>{coverage.provider}</p>
                <p>{coverage.coverage}</p>
                <p>{coverage.score}</p>
                <p>{coverage.status}</p>
              </div>
            ))}
          </Card>
          <p>Recommendations</p>
          <Card>
            {data.recommendations.map((recommendation, index) => (
              <div key={recommendation.title ?? index}>
                <p>{recommendation.title}</p>
                <p>{recommendation.scoreImpact}</p>
                <p>{recommendation.pricePerYear}</p>
                <p>{recommendation.ctaLabel}</p>
              </div>
            ))}
          </Card>
        </>
      ) : null}
    </div>
  );
}
