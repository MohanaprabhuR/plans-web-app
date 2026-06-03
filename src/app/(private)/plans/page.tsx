"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ScreenLoading } from "@/components/ui/screen-loading";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  CarFront,
  ChevronLeft,
  CircleAlert,
  Hospital,
  House,
  LifeBuoy,
  PlaneTakeoff,
  ShieldCheck,
} from "lucide-react";

const DEFAULT_LOGO =
  "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg";

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

function formatInr(amount: number) {
  return amount.toLocaleString("en-IN");
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Health":
      return <Hospital className="size-5 min-w-5 text-[#8E51FF]" />;
    case "Auto":
      return <CarFront className="size-5 min-w-5 text-[#E12AFB]" />;
    case "Life":
      return <LifeBuoy className="size-5 min-w-5 text-[#FE9A00]" />;
    case "Travel":
      return <PlaneTakeoff className="size-5 min-w-5 text-[#FE9A00]" />;
    case "Home":
      return <House className="size-5 min-w-5 text-[#FE9A00]" />;
    default:
      return <ShieldCheck className="size-5 min-w-5 text-muted-foreground" />;
  }
}

function PlanOptionCard({
  plan,
  category,
  selected,
  onSelect,
}: {
  plan: Plan;
  category: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const highlights = plan.highlights?.slice(0, 3) ?? [];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "bg-white w-full cursor-pointer transition-shadow hover:shadow-md",
        selected && "ring-1 ring-primary/30",
      )}
    >
      <CardContent>
        <div className="flex items-center justify-between pb-4 border-b border-dashed">
          <div className="flex items-center gap-x-4 min-w-0">
            <div className="p-0.5 bg-white rounded-lg shrink-0">
              <Image
                src={DEFAULT_LOGO}
                alt={plan.provider}
                width={44}
                height={44}
                className="object-contain rounded-md overflow-hidden"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-xl leading-6 tracking-4 text-accent-foreground truncate">
                {plan.name}
              </span>
              <div className="flex items-center gap-x-1.5 pt-1.5 flex-wrap">
                <div className="flex gap-x-1 items-center">
                  {getCategoryIcon(category)}
                  <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                    {plan.provider}
                  </span>
                </div>
                <div className="size-1 rounded-full bg-[#757575]" />
                <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">
                  {category}
                </span>
                {selected && (
                  <span className="size-2 rounded-full bg-primary ml-1 shrink-0" />
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="shrink-0 ml-4"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 pt-4 flex-wrap">
          <div className="flex text-sm flex-col min-w-[100px]">
            <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
              Premium
            </span>
            <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">
              ₹{formatInr(plan.monthlyPrice)}/mo
            </span>
          </div>
          <div className="flex text-sm flex-col min-w-[100px]">
            <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
              Yearly
            </span>
            <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">
              ₹{formatInr(plan.yearlyPrice)}/yr
            </span>
          </div>
          <div className="flex text-sm flex-col flex-1 min-w-[140px]">
            <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">
              Coverage
            </span>
            <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4 line-clamp-2">
              {highlights.length > 0
                ? highlights.join(" · ")
                : "Standard benefits"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BuyInsurancePlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const type = useMemo(
    () => normalizeType(searchParams.get("type")),
    [searchParams],
  );

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
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
    if (!user?.id) {
      setLoadingPlans(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingPlans(true);
      try {
        const progressRes = await fetch("/api/insurance/progress", {
          headers: { "X-User-Id": user.id },
        });
        const progressJson = progressRes.ok
          ? ((await progressRes.json()) as {
              progress: {
                step_index?: number;
                answers?: Answers;
              } | null;
            })
          : null;

        const progress = progressJson?.progress ?? null;
        const stepIndex = progress?.step_index ?? -1;
        const completedStepIndex = 4;

        if (stepIndex < completedStepIndex) {
          showError("Please complete all steps before viewing plans.");
          if (!cancelled) {
            router.push(`/buy-insurance?type=${encodeURIComponent(type)}`);
          }
          return;
        }

        const progressAnswers = progress?.answers ?? null;
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
        if (!cancelled) setLoadingPlans(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, type, router]);

  const buyNow = async () => {
    if (!selectedPlanId) {
      showError("Select a plan to continue.");
      return;
    }
    if (!user?.id) {
      showError("Please login to continue.");
      return;
    }

    const selectedPlan = plans.find((plan) => plan.planId === selectedPlanId);
    if (!selectedPlan) {
      showError("Selected plan not found. Please try again.");
      return;
    }

    setPurchasing(true);
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

      // Persist a policy record so "My Policy" cards update immediately.
      const now = new Date();
      const renewalDate = new Date(now);
      renewalDate.setFullYear(now.getFullYear() + 1);
      const policyId = `POL-${selectedPlan.planId}-${Date.now().toString().slice(-6)}`;

      const createPolicyRes = await fetch("/api/policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify({
          policyId,
          type,
          status: "Active",
          provider: selectedPlan.provider,
          providerLogo:
            "https://img.freepik.com/free-vector/insurance-policy-shield_603843-179.jpg",
          coverage: `₹${selectedPlan.yearlyPrice.toLocaleString("en-IN")}`,
          premium: `₹${selectedPlan.monthlyPrice.toLocaleString("en-IN")}/month`,
          claimAmount: "None",
          members: [],
          daysLeft: 365,
          renewalDate: renewalDate.toISOString().slice(0, 10),
        }),
      });
      if (!createPolicyRes.ok) {
        throw new Error(await createPolicyRes.text());
      }

      router.push("/your-policy");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="lg"
          iconOnly
          onClick={() =>
            router.push(`/buy-insurance?type=${encodeURIComponent(type)}`)
          }
          aria-label="Go back"
        >
          <ChevronLeft />
        </Button>

        <h3 className="text-2xl font-bold tracking-4 text-foreground">
          Plans for {type}
        </h3>
      </div>

      {loadingPlans && (
        <ScreenLoading
          variant="list"
          showHeader={false}
          rows={3}
          label="Loading plans"
        />
      )}

      {!loadingPlans && plans.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
              No plans found
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different insurance type or complete the questionnaire
              again.
            </p>
          </CardContent>
        </Card>
      )}

      {!loadingPlans && plans.length > 0 && (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <PlanOptionCard
              key={plan.planId}
              plan={plan}
              category={type}
              selected={selectedPlanId === plan.planId}
              onSelect={() => setSelectedPlanId(plan.planId)}
            />
          ))}

          <Button
            className="w-full"
            size="lg"
            onClick={buyNow}
            disabled={purchasing || !selectedPlanId}
          >
            {purchasing ? "Buying…" : "Buy now"}
          </Button>
        </div>
      )}
    </div>
  );
}
