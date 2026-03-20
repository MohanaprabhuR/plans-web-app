"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BriefcaseMedical,
  CarFront,
  Dog,
  Heart,
  House,
  KeyRound,
  PlaneTakeoff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GaugeComponent = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});
type CoverageProfileItem = {
  key: "personal" | "lifestyle" | "medical" | "financial";
  label: string;
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Poor";
  subtitle: string;
};

type CoveragePolicyItem = {
  riskProfile: string;
  risk: ReactNode;
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

function clampToPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function getScoreStrokeColor(status: CoverageProfileItem["status"]) {
  if (status === "Excellent") return "#0ee087";
  if (status === "Good") return "#47eda7";
  if (status === "Fair") return "#f5da29";
  return "#eb4f46";
}

function MiniSemiCircleProgress({
  className,
  value,
  strokeColor,
}: {
  className?: string;
  value: number;
  strokeColor: string;
}) {
  const normalizedValue = clampToPercent(value);
  const progress = normalizedValue / 100;

  // Semi-circle path: center (20,20), radius 16, from left to right.
  const radius = 16;
  const circumference = Math.PI * radius;
  const dashOffset = (1 - progress) * circumference;

  return (
    <svg
      viewBox="0 0 40 24"
      className={className ?? "w-11 h-11"}
      aria-label={`Score ${Math.round(normalizedValue)} out of 100`}
      role="img"
    >
      <path
        d="M4 20 A16 16 0 0 1 36 20"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M4 20 A16 16 0 0 1 36 20"
        fill="none"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
      />
      <text
        x="20"
        y="18"
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {Math.round(normalizedValue)}
      </text>
    </svg>
  );
}

function getCoverageStrokeColor(riskProfile: string | undefined) {
  const normalized = (riskProfile ?? "").toLowerCase();
  if (normalized === "excellent") return "#0ee087";
  if (normalized === "good") return "#47eda7";
  if (normalized === "fair") return "#f5da29";
  if (normalized === "poor") return "#eb4f46";
  return "#c7c7c7";
}

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

  console.log(data);

  return (
    <>
      <h3 className="font-semibold text-3xl leading-8 tracking-4 text-accent-foreground">
        Coverage
      </h3>
      <div className="w-full pt-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading Coverage...</p>
          </div>
        )}

        {data ? (
          <>
            <Card className="flex items-center flex-row justify-between">
              <div className="w-1/2 flex items-center justify-center h-full">
                <div className="w-full max-w-[380px] max-h-[380px] min-h-[380px] min-w-[380px] flex items-center justify-center">
                  <GaugeComponent
                    value={data?.overallScore}
                    type="semicircle"
                    minValue={10}
                    maxValue={100}
                    arc={{
                      width: 0.2,
                      padding: 0.03,
                      cornerRadius: 0,
                      subArcs: [],
                      colorArray: [
                        "#eb4f46",
                        "#e9833d",
                        "#edd748",
                        "#67f06d",
                        "#0ee087",
                      ],
                      nbSubArcs: 5,
                      subArcsStrokeWidth: 0,
                    }}
                    pointer={{
                      type: "arrow",
                      color: "#383838",
                      length: 0.7,
                      width: 22,
                      maxFps: 30,
                      baseColor: "#ffffff",
                      strokeWidth: 2,
                      arrowOffset: 0.9,
                    }}
                    labels={{
                      valueLabel: {
                        formatTextValue: (e) => "".concat(e, ""),
                        style: {
                          fontSize: "20px",
                          fill: "#383838",
                          fontWeight: "bold",
                          textShadow: "none",
                        },
                      },
                      tickLabels: {
                        type: "outer",
                        defaultTickValueConfig: {
                          formatTextValue: (e) => "".concat(e, "\xb0"),
                          style: { fontSize: "9px", fill: "#aaa" },
                          hide: true,
                        },
                        defaultTickLineConfig: {
                          color: "#666",
                          length: 4,
                          width: 1,
                          hide: true,
                        },
                        ticks: [],
                        hideMinMax: true,
                        autoSpaceTickLabels: false,
                      },
                    }}
                    startAngle={-135}
                    endAngle={135}
                  />
                </div>
              </div>
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-3xl font-bold text-accent-foreground leading-8 tracking-4">
                      {user?.user_metadata?.full_name}
                    </p>
                    <p className="text-muted-foreground text-base leading-6 tracking-4 font-normal">
                      We&apos;ve found {data?.risksFound}Risks based on your
                      details.
                    </p>
                  </div>
                  <Image
                    src={
                      user?.user_metadata?.avatar_url ??
                      "https://mockmind-api.uifaces.co/content/human/80.jpg"
                    }
                    alt="avatar"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                </div>
                <div className="pt-8 pb-6">
                  <h2 className="text-base font-semibold text-accent-foreground leading-6 tracking-4">
                    Profile Breakdown
                  </h2>
                  <p className="text-muted-foreground text-md leading-6 tracking-4 font-normal">
                    See how your coverage is distributed across all categories.
                  </p>
                </div>
                <ul>
                  {data.profileBreakdown.map((profile, index) => (
                    <li
                      key={profile.key ?? index}
                      className="flex items-center gap-4 justify-between py-4 first:pt-0 last:pb-0 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <MiniSemiCircleProgress
                          value={profile.score}
                          strokeColor={getScoreStrokeColor(profile.status)}
                          className="max-w-11 min-w-11 w-full"
                        />

                        <div>
                          <p className="text-foreground font-semibold text-base leading-6 tracking-4">
                            {profile.label}
                          </p>
                          <p className="text-muted-foreground text-xs leading-4 tracking-4 font-normal">
                            {profile.subtitle}
                          </p>
                        </div>
                      </div>
                      <Badge
                        theme={
                          profile.status === "Excellent"
                            ? "green"
                            : profile.status === "Good"
                              ? "blue"
                              : profile.status === "Fair"
                                ? "amber"
                                : "red"
                        }
                      >
                        {profile.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <div className=" flex flex-col pt-10 gap-y-4">
              <p className="text-2xl font-semibold text-accent-foreground leading-8 tracking-4">
                Coverage Breakdown
              </p>
              <div className="flex gap-x-6 ">
                <Card>
                  <ul>
                    {data.coverageBreakdown.map((coverage, index) => (
                      <li
                        key={coverage.category ?? index}
                        className="flex items-start justify-between py-4 gap-4 first:pt-0 last:pb-0 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-13 min-w-12 min-h-13  rounded-2xl flex items-center justify-center ${coverage?.category === "Health Insurance" ? "bg-[#F8F5FF]" : coverage?.category === "Auto Insurance" ? "bg-[#FDF0FF]" : coverage?.category === "Life Insurance" ? "bg-[#FFF5F5]" : coverage?.category === "Home Insurance" ? "bg-[#FEF6EA]" : coverage?.category === "Travel Insurance" ? "bg-[#FFF4E5]" : coverage?.category === "Pet Insurance" ? "bg-[#ECFEFF]" : coverage?.category === "Renters Insurance" ? "bg-[#F0FDFA]" : ""}`}
                          >
                            {coverage?.category === "Health Insurance" ? (
                              <BriefcaseMedical className="stroke-[#8E51FF]" />
                            ) : coverage?.category === "Auto Insurance" ? (
                              <CarFront className="stroke-[#E12AFB]" />
                            ) : coverage?.category === "Life Insurance" ? (
                              <Heart className="stroke-[#FF5255]" />
                            ) : coverage?.category === "Home Insurance" ? (
                              <House className="stroke-[#FE9A00]" />
                            ) : coverage?.category === "Travel Insurance" ? (
                              <PlaneTakeoff className="stroke-[#00D3F2]" />
                            ) : coverage?.category === "Pet Insurance" ? (
                              <Dog className="stroke-[#00D3F2]" />
                            ) : coverage?.category === "Renters Insurance" ? (
                              <KeyRound className="stroke-[#00BBA7]" />
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="flex flex-col">
                            {coverage?.category ? (
                              <p className="text-foreground font-semibold text-lg leading-6 tracking-4">
                                {coverage?.category}
                              </p>
                            ) : null}
                            {coverage?.provider && coverage?.coverage ? (
                              <p className="text-muted-foreground text-base leading-6 tracking-4 font-normal flex items-center gap-2 pb-2">
                                {coverage?.provider}{" "}
                                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                {coverage.coverage}
                              </p>
                            ) : null}
                            {coverage?.message ? (
                              <p className="text-muted-foreground text-base leading-6 tracking-4 font-normal flex items-center gap-2 pb-2">
                                {coverage?.message} {coverage?.score}
                              </p>
                            ) : null}
                            {coverage?.risk ? (
                              <Badge
                                theme={
                                  coverage?.riskProfile === "Excellent"
                                    ? "green"
                                    : coverage?.riskProfile === "Good"
                                      ? "blue"
                                      : coverage?.riskProfile === "poor"
                                        ? "amber"
                                        : "red"
                                }
                              >
                                {coverage?.risk}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <MiniSemiCircleProgress
                          className="max-w-20 min-h-20 w-full "
                          value={coverage?.score ?? 0}
                          strokeColor={getCoverageStrokeColor(
                            coverage?.riskProfile,
                          )}
                        />
                      </li>
                    ))}
                  </ul>
                </Card>
                <div className="w-full max-w-[354px] flex flex-col gap-y-6">
                  <Card className="h-fit ">
                    <CardHeader className="gap-0">
                      <CardTitle className="flex items-center gap-x-2 font-semibold">
                        <Award className="size-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4 flex flex-col">
                      <ul>
                        {data.recommendations.map((recommendation, index) => (
                          <li
                            key={recommendation.title ?? index}
                            className="flex flex-col gap-y-4 items-center justify-between py-4 first:pt-0 last:pb-0 border-b border-border last:border-b-0"
                          >
                            <div className="flex items-start gap-4 w-full justify-between">
                              <div>
                                <p className="text-lg font-semibold leading-6 tracking-4 text-accent-foreground">
                                  {recommendation.title}
                                </p>
                                <p className="text-base text-muted-foreground font-normal leading-5 tracking-4">
                                  {recommendation.description}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                +{recommendation.scoreImpact} Score
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 w-full justify-between">
                              <Button variant="outline">
                                {recommendation.ctaLabel}
                              </Button>
                              <p className="text-lg text-accent-foreground font-semibold leading-6 tracking-4">
                                ${recommendation.pricePerYear}/Year
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
