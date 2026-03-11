"use client";

import React, { useMemo, useState } from "react";
import Logo from "../../../../public/images/svg/plans-logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, MoveLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ALLOWED_TYPES = ["Health", "Home", "Life", "Travel", "Auto"] as const;
type InsuranceType = (typeof ALLOWED_TYPES)[number];

type Answers = {
  relationship: string;
  age: string;
  city: string;
  pincode: string;
  fullName: string;
  hasDiabetes: boolean;
  hasBp: boolean;
  coverageAmount: string;
};

type StepId =
  | "member"
  | "age"
  | "location"
  | "personal"
  | "medical"
  | "insurance";

type Step = {
  id: StepId;
  title: string;
  subtitle: string;
};

type Plan = {
  planId: string;
  name: string;
  provider: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlights: string[];
};

const STEPS: Step[] = [
  {
    id: "member",
    title: "Member Details",
    subtitle: "Who would you like to insure?",
  },
  { id: "age", title: "Age", subtitle: "Tell us the age" },
  { id: "location", title: "Location", subtitle: "Where do you live?" },
  {
    id: "personal",
    title: "Personal Details",
    subtitle: "Basic personal info",
  },
  { id: "medical", title: "Medical History", subtitle: "Health conditions" },
  {
    id: "insurance",
    title: "Insurance Details",
    subtitle: "Coverage preferences",
  },
];

function normalizeType(raw: string | null): InsuranceType {
  const value = (raw ?? "").trim();
  const match = ALLOWED_TYPES.find(
    (t) => t.toLowerCase() === value.toLowerCase(),
  );
  return match ?? "Health";
}

function validate(step: StepId, a: Answers): string | null {
  if (step === "member" && !a.relationship) return "Select who to insure.";
  if (step === "age" && (!a.age || Number(a.age) <= 0))
    return "Enter a valid age.";
  if (step === "location" && (!a.city || !a.pincode))
    return "Enter city and pincode.";
  if (step === "personal" && !a.fullName) return "Enter full name.";
  if (step === "insurance" && !a.coverageAmount)
    return "Enter coverage amount.";
  return null;
}

export default function BuyInsurancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = useMemo(
    () => normalizeType(searchParams.get("type")),
    [searchParams],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const [answers, setAnswers] = useState<Answers>({
    relationship: "",
    age: "",
    city: "",
    pincode: "",
    fullName: "",
    hasDiabetes: false,
    hasBp: false,
    coverageAmount: "",
  });
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [mode, setMode] = useState<"questions" | "plans" | "success">(
    "questions",
  );

  const showError = (message: string) => {
    setError(message);
    toast.custom(() => (
      <Alert variant="error">
        <CircleAlert className="size-4" />
        <AlertTitle>{message}</AlertTitle>
      </Alert>
    ));
  };

  const percent = Math.min(
    100,
    Math.max(0, Math.round(((stepIndex + 1) / STEPS.length) * 100)),
  );

  const next = async () => {
    if (mode !== "questions") return;
    const msg = validate(step.id, answers);
    if (msg) {
      showError(msg);
      return;
    }
    setError(null);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    // Last step → fetch plans
    setLoading(true);
    try {
      const res = await fetch("/api/insurance/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, answers }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { plans: Plan[] };
      setPlans(data.plans ?? []);
      setSelectedPlanId(data.plans?.[0]?.planId ?? "");
      setMode("plans");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    setError(null);
    if (mode === "plans") {
      setMode("questions");
      return;
    }
    setStepIndex((s) => Math.max(0, s - 1));
  };

  const buyNow = async () => {
    if (!selectedPlanId) {
      showError("Select a plan to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insurance/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, planId: selectedPlanId, answers }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMode("success");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = [
    "Self",
    "Spouse",
    "Son",
    "Daughter",
    "Father",
    "Mother",
  ];

  return (
    <div className="flex">
      <div className="w-1/3 bg-[#FFF7ED] py-4 px-8 h-screen">
        <Image src={Logo} alt="Logo" width={78} height={32} />
        <div className="pt-13">
          <div className="flex flex-col  gap-x-2">
            <p className="text-base tracking-4 leading-6  font-medium text-accent-foreground">
              {percent}% Completed
            </p>
            <h2 className="text-3xl tracking-4 leading-8 font-semibold text-foreground ">
              Get Your {type} Insurance Quotes in Minutes!
            </h2>
          </div>
        </div>

        <div className="pt-10">
          <div className="flex flex-col gap-5">
            {STEPS.map((s, idx) => {
              const active =
                mode === "questions"
                  ? idx === stepIndex
                  : idx === STEPS.length - 1;
              const done = idx < stepIndex && mode === "questions";
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div
                    className={`size-5 rounded-full border flex items-center justify-center ${
                      done
                        ? "bg-[#FF5E00] border-[#FF5E00]"
                        : active
                          ? "border-[#FF5E00]"
                          : "border-muted-foreground/30"
                    }`}
                  >
                    {done ? (
                      <div className="size-2 rounded-full bg-white" />
                    ) : null}
                  </div>
                  <p
                    className={`text-base font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-3/4 h-screen py-25 px-32">
        <div className="flex items-center gap-4">
          {stepIndex > 0 && (
            <Button variant="ghost" iconOnly onClick={back}>
              <MoveLeft className="text-muted-foreground" />
            </Button>
          )}

          <p className="font-medium leading-6 tracking-4 text-muted-foreground text-lg">
            Step {Math.min(stepIndex + 1, STEPS.length)}/{STEPS.length}
          </p>
        </div>

        {mode === "questions" && (
          <>
            <p className="font-semibold leading-8 tracking-4 text-foreground text-3xl">
              {step.subtitle}
            </p>

            <div className="space-y-5">
              {step.id === "member" && (
                <div className="grid grid-cols-4 gap-3">
                  {relationshipOptions.map((opt) => (
                    <Checkbox
                      key={opt}
                      label={opt}
                      onCheckedChange={() =>
                        setAnswers((p) => ({ ...p, relationship: opt }))
                      }
                    />
                  ))}
                </div>
              )}

              {step.id === "age" && (
                <Input
                  type="number"
                  placeholder="Enter age"
                  size="lg"
                  value={answers.age}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, age: e.target.value }))
                  }
                />
              )}

              {step.id === "location" && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="City"
                    value={answers.city}
                    size="lg"
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Pincode"
                    value={answers.pincode}
                    size="lg"
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, pincode: e.target.value }))
                    }
                  />
                </div>
              )}

              {step.id === "personal" && (
                <Input
                  placeholder="Full name"
                  value={answers.fullName}
                  size="lg"
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, fullName: e.target.value }))
                  }
                />
              )}

              {step.id === "medical" && (
                <div className="space-y-3">
                  <label className="flex items-center justify-between gap-3 rounded-lg border p-4">
                    <span className="text-sm font-medium">Diabetes</span>
                    <input
                      type="checkbox"
                      checked={answers.hasDiabetes}
                      onChange={(e) =>
                        setAnswers((p) => ({
                          ...p,
                          hasDiabetes: e.target.checked,
                        }))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-lg border p-4">
                    <span className="text-sm font-medium">Blood pressure</span>
                    <input
                      type="checkbox"
                      checked={answers.hasBp}
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, hasBp: e.target.checked }))
                      }
                    />
                  </label>
                </div>
              )}

              {step.id === "insurance" && (
                <Input
                  placeholder="Coverage amount (e.g. 10L)"
                  value={answers.coverageAmount}
                  size="lg"
                  onChange={(e) =>
                    setAnswers((p) => ({
                      ...p,
                      coverageAmount: e.target.value,
                    }))
                  }
                />
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={next}
              disabled={loading}
            >
              {loading
                ? "Loading…"
                : stepIndex === STEPS.length - 1
                  ? "View plans"
                  : "Continue"}
            </Button>
          </>
        )}

        {mode === "plans" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Plans for {type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plans.length === 0 ? (
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
                        <p className="font-semibold text-foreground">
                          {p.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {p.provider}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{p.monthlyPrice}/mo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{p.yearlyPrice}/yr
                        </p>
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
                <Button variant="outline" onClick={back} disabled={loading}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "success" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Your {type} insurance purchase and answers were saved.
              </p>
              <Button onClick={() => router.push("/your-policy")}>
                Go to Your Policy
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
