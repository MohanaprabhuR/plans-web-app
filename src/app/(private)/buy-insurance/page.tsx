"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Logo from "../../../../public/images/svg/plans-logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Check, CheckCircle, CircleAlert, MoveLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
const ALLOWED_TYPES = ["Health", "Home", "Life", "Travel", "Auto"] as const;
type InsuranceType = (typeof ALLOWED_TYPES)[number];

type Answers = {
  spouseAge: string | undefined;
  relationship: string[];
  age: string;
  city: string;
  fullName: string;
  lastName: string;
  mobileNumber: string;
  hasDiabetes: boolean;
  hasBp: boolean;
  hasHeartDisease: boolean;
  hasThyroid: boolean;
  hasAsthma: boolean;
  hasOthers: boolean;
  hasNone: boolean;
  hasExistingInsurance: "" | "yes" | "no";
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

const STEPS: Step[] = [
  {
    id: "member",
    title: "Member Details",
    subtitle: "Who would you like to insure?",
  },
  {
    id: "age",
    title: "Age",
    subtitle: "What’s the age of the Covered Members?",
  },
  { id: "location", title: "Location", subtitle: "What’s Your Current City?" },
  {
    id: "personal",
    title: "Personal Details",
    subtitle: "Tell Us Few More Details",
  },
  {
    id: "medical",
    title: "Medical History",
    subtitle: "Any Pre-Existing Conditions?",
  },
  {
    id: "insurance",
    title: "Insurance Details",
    subtitle: "Do You Have Any Health Insurance?",
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
  if (step === "member" && a.relationship.length === 0)
    return "Select who to insure.";
  if (step === "age") {
    if (!a.age || Number(a.age) <= 0) return "Select your age.";
    if (a.relationship.includes("Spouse") && !a.spouseAge)
      return "Select your spouse's age.";
  }
  if (step === "location" && !a.city) return "Select your city.";
  if (step === "personal") {
    if (!a.fullName) return "Enter first name.";
    if (!a.lastName) return "Enter last name.";
    if (!a.mobileNumber) return "Enter mobile number.";
    if (!/^\d{10}$/.test(a.mobileNumber.replace(/\D/g, "")))
      return "Enter a valid 10-digit mobile number.";
  }
  if (step === "medical") {
    const anySelected =
      a.hasDiabetes ||
      a.hasBp ||
      a.hasHeartDisease ||
      a.hasThyroid ||
      a.hasAsthma ||
      a.hasOthers ||
      a.hasNone;
    if (!anySelected) return "Select at least one option.";
  }
  if (step === "insurance") {
    if (!a.hasExistingInsurance) return "Select Yes or No.";
  }
  return null;
}

export default function BuyInsurancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = useMemo(
    () => normalizeType(searchParams.get("type")),
    [searchParams],
  );

  const [spouseAgeOpen, setSpouseAgeOpen] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const [answers, setAnswers] = useState<Answers>({
    relationship: [],
    age: "",
    spouseAge: "",
    city: "",
    mobileNumber: "",
    fullName: "",
    lastName: "",
    hasDiabetes: false,
    hasBp: false,
    hasHeartDisease: false,
    hasThyroid: false,
    hasAsthma: false,
    hasOthers: false,
    hasNone: false,
    hasExistingInsurance: "",
  });
  const [, setError] = useState<string | null>(null);
  const [loading] = useState(false);
  const [mode, setMode] = useState<"questions" | "plans" | "success">(
    "questions",
  );

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || hydratedRef.current) return;
    hydratedRef.current = true;

    (async () => {
      const res = await fetch("/api/insurance/progress", {
        headers: { "X-User-Id": user.id },
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok: boolean;
        progress: {
          step_index?: number;
          mode?: "questions" | "plans" | "success";
          answers?: Partial<Answers>;
        } | null;
      };
      if (!data.progress) return;

      if (typeof data.progress.step_index === "number") {
        setStepIndex(
          Math.max(0, Math.min(STEPS.length - 1, data.progress.step_index)),
        );
      }
      if (
        data.progress.mode === "questions" ||
        data.progress.mode === "plans" ||
        data.progress.mode === "success"
      ) {
        setMode(data.progress.mode);
      }
      if (data.progress.answers && typeof data.progress.answers === "object") {
        setAnswers((p) => ({
          ...p,
          ...(data.progress!.answers as Partial<Answers>),
        }));
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    // debounce writes to avoid hammering the API
    const t = setTimeout(() => {
      fetch("/api/insurance/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
        body: JSON.stringify({
          step_index: stepIndex,
          mode,
          answers,
        }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [user?.id, stepIndex, mode, answers]);

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

    setError(null);
    const message = validate(step.id, answers);
    if (message) {
      showError(message);
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    toast.custom(() => (
      <Alert variant="success">
        <CheckCircle className="size-4" />
        <AlertTitle>Your details have been submitted.</AlertTitle>
      </Alert>
    ));
    router.push("/plans");
  };

  const back = () => {
    setError(null);
    setStepIndex((s) => Math.max(0, s - 1));
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
        <Link href="/">
          <Image src={Logo} alt="Logo" width={78} height={32} />
        </Link>
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
          <div className="flex flex-col gap-8">
            {STEPS.map((s, idx) => {
              const active =
                mode === "questions"
                  ? idx === stepIndex
                  : idx === STEPS.length - 1;
              const done = idx < stepIndex && mode === "questions";
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 relative before:content-[] before:w-0.5 before:h-8.5 before:absolute before:top-[23px] last:before:hidden before:left-[11px] ${
                    done ? "before:bg-[#FF5E00]" : "before:bg-primary/30"
                  }`}
                >
                  <div
                    className={`size-6 z-1 relative rounded-full border flex items-center justify-center ${
                      done
                        ? "bg-[#FF5E00] border-[#FF5E00]"
                        : active
                          ? "border-[#FF5E00] "
                          : "border-primary/30 bg-transparent"
                    }`}
                  >
                    {done ? <Check className="text-white size-4" /> : null}
                  </div>
                  <p
                    className={`text-base font-medium ${done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}`}
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
                <div className="grid grid-cols-3 gap-3">
                  {relationshipOptions.map((opt) => (
                    <Checkbox
                      key={opt}
                      label={opt}
                      checked={answers.relationship.includes(opt)}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);

                        if (opt === "Spouse") {
                          if (isChecked && !answers.spouseAge) {
                            setSpouseAgeOpen(true);
                          }
                          if (!isChecked) {
                            setSpouseAgeOpen(false);
                          }
                        }

                        setAnswers((p) => ({
                          ...p,
                          relationship: isChecked
                            ? Array.from(new Set([...p.relationship, opt]))
                            : p.relationship.filter((r) => r !== opt),
                          spouseAge:
                            opt === "Spouse"
                              ? isChecked
                                ? p.spouseAge
                                : undefined
                              : p.spouseAge,
                        }));
                      }}
                    />
                  ))}
                </div>
              )}

              {step.id === "age" && (
                <>
                  <Select
                    value={answers.age}
                    onValueChange={(value) =>
                      setAnswers((p) => ({ ...p, age: value }))
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      <SelectValue placeholder="Select Your Age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46-55">46-55</SelectItem>
                      <SelectItem value="56-65">56-65</SelectItem>
                      <SelectItem value="66-75">66-75</SelectItem>
                      <SelectItem value="76-85">76-85</SelectItem>
                      <SelectItem value="86+">86+</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={answers.spouseAge}
                    open={spouseAgeOpen}
                    onOpenChange={setSpouseAgeOpen}
                    onValueChange={(value) =>
                      setAnswers((p) => ({ ...p, spouseAge: value }))
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      <SelectValue placeholder="Select Spouse Age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46-55">46-55</SelectItem>
                      <SelectItem value="56-65">56-65</SelectItem>
                      <SelectItem value="66-75">66-75</SelectItem>
                      <SelectItem value="76-85">76-85</SelectItem>
                      <SelectItem value="86+">86+</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {step.id === "location" && (
                <Select
                  value={answers.city}
                  onValueChange={(value) =>
                    setAnswers((p) => ({ ...p, city: value }))
                  }
                >
                  <SelectTrigger className="w-full" size="lg" variant="outline">
                    <SelectValue placeholder="Select Your City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="iceland">Iceland</SelectItem>
                    <SelectItem value="italy">Italy</SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                    <SelectItem value="korea">Korea</SelectItem>
                    <SelectItem value="spain">Spain</SelectItem>
                    <SelectItem value="sweden">Sweden</SelectItem>
                    <SelectItem value="switzerland">Switzerland</SelectItem>
                    <SelectItem value="united states">United States</SelectItem>
                    <SelectItem value="united kingdom">
                      United Kingdom
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {step.id === "personal" && (
                <>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter first name"
                      value={answers.fullName}
                      variant="outline"
                      size="lg"
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, fullName: e.target.value }))
                      }
                    />
                    <Input
                      placeholder="Enter last name"
                      value={answers.lastName}
                      variant="outline"
                      size="lg"
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, lastName: e.target.value }))
                      }
                    />
                  </div>
                  <Input
                    placeholder="Enter mobile number"
                    value={answers.mobileNumber}
                    size="lg"
                    variant="outline"
                    onChange={(e) =>
                      setAnswers((p) => ({
                        ...p,
                        mobileNumber: e.target.value,
                      }))
                    }
                  />
                </>
              )}

              {step.id === "medical" && (
                <div className="grid grid-cols-2  gap-4">
                  <Checkbox
                    label="Diabetes"
                    checked={answers.hasDiabetes}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasDiabetes: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />
                  <Checkbox
                    label="Blood pressure"
                    checked={answers.hasBp}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasBp: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />
                  <Checkbox
                    label="Heart Disease"
                    checked={answers.hasHeartDisease}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasHeartDisease: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />
                  <Checkbox
                    label="Thyroid"
                    checked={answers.hasThyroid}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasThyroid: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />
                  <Checkbox
                    label="Asthma"
                    checked={answers.hasAsthma}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasAsthma: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />

                  <Checkbox
                    label="Others"
                    checked={answers.hasOthers}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasOthers: Boolean(checked),
                        hasNone: checked ? false : p.hasNone,
                      }))
                    }
                  />
                  <Checkbox
                    label="None of these"
                    checked={answers.hasNone}
                    onCheckedChange={(checked) =>
                      setAnswers((p) => ({
                        ...p,
                        hasNone: Boolean(checked),
                        ...(checked
                          ? {
                              hasDiabetes: false,
                              hasBp: false,
                              hasHeartDisease: false,
                              hasThyroid: false,
                              hasAsthma: false,
                              hasOthers: false,
                            }
                          : null),
                      }))
                    }
                  />
                </div>
              )}

              {step.id === "insurance" && (
                <div className="space-y-4">
                  <RadioGroup
                    className="flex gap-4"
                    value={answers.hasExistingInsurance}
                    onValueChange={(value) =>
                      setAnswers((p) => ({
                        ...p,
                        hasExistingInsurance: value as "yes" | "no" | "",
                      }))
                    }
                  >
                    <RadioGroupItem value="yes" id="yes" label="Yes" />
                    <RadioGroupItem value="no" id="no" label="No" />
                  </RadioGroup>
                </div>
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
      </div>
    </div>
  );
}
