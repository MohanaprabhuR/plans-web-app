"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, MoveLeft } from "lucide-react";

type Plan = {
  planId: string;
  name: string;
  provider: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlights: string[];
};

type Answers = Record<string, unknown>;

function normalizeType(raw: string | null): string {
  return (raw ?? "").trim() || "Health";
}

export default function BuyInsurancePlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const type = useMemo(
    () => normalizeType(searchParams.get("type")),
    [searchParams],
  );

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [answers, setAnswers] = useState<Answers | null>(null);

  const showError = (message: string) => {
    toast.custom(() => (
      <Alert variant="error">
        <CircleAlert className="size-4" />
        <AlertTitle>{message}</AlertTitle>
      </Alert>
    ));
  };

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const progressRes = await fetch("/api/insurance/progress", {
          headers: { "X-User-Id": user.id },
        });
        const progressJson = progressRes.ok
          ? ((await progressRes.json()) as {
              progress: { answers?: Answers } | null;
            })
          : null;

        const progressAnswers = progressJson?.progress?.answers ?? null;
        if (!cancelled) setAnswers(progressAnswers);

        const res = await fetch("/api/insurance/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, answers: progressAnswers }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { plans: Plan[] };

        if (!cancelled) {
          setPlans(data.plans ?? []);
          setSelectedPlanId(data.plans?.[0]?.planId ?? "");
        }
      } catch (e) {
        showError(e instanceof Error ? e.message : "Failed to load plans.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, type]);

  const buyNow = async () => {
    if (!selectedPlanId) {
      showError("Select a plan to continue.");
      return;
    }
    if (!user?.id) {
      showError("Please login to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/insurance/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify({ type, planId: selectedPlanId, answers }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/your-policy");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-h-screen py-10 px-6 md:px-16">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          iconOnly
          onClick={() => router.push(`/buy-insurance?type=${encodeURIComponent(type)}`)}
        >
          <MoveLeft className="text-muted-foreground" />
        </Button>
        <p className="font-semibold text-foreground text-xl">Plans for {type}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Choose a plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && plans.length === 0 ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : plans.length === 0 ? (
            <p className="text-muted-foreground">No plans found.</p>
          ) : (
            plans.map((p) => (
              <button
                key={p.planId}
                type="button"
                onClick={() => setSelectedPlanId(p.planId)}
                className={`w-full text-left rounded-lg border p-4 transition ${
                  selectedPlanId === p.planId
                    ? "border-[#FF5E00] bg-orange-50"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₹{p.monthlyPrice}/mo
                    </p>
                    <p className="text-sm text-muted-foreground">₹{p.yearlyPrice}/yr</p>
                  </div>
                </div>
                {p.highlights?.length ? (
                  <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                    {p.highlights.slice(0, 3).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </button>
            ))
          )}

          <div className="flex gap-3 pt-2">
            <Button className="w-full" onClick={buyNow} disabled={loading}>
              {loading ? "Buying…" : "Buy now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

