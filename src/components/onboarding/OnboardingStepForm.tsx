"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Wallet,
  Shield,
  Activity,
  Heart,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type OnboardingFormData,
  type StepConfig,
  ONBOARDING_STEPS,
  getStoredOnboardingData,
  setStoredOnboardingData,
  clearStoredOnboardingData,
  getCategoryProgress,
  buildOnboardingPayload,
} from "@/lib/onboarding";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  welcome: null,
  personal: <Activity className="size-5 text-primary" />,
  lifestyle: <Heart className="size-5 text-primary" />,
  medical: <Shield className="size-5 text-primary" />,
  financial: <Wallet className="size-5 text-primary" />,
  confirmation: null,
};

export function OnboardingStepForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(
    () => getStoredOnboardingData() ?? {},
  );
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const categoryProgress = step ? getCategoryProgress(step.id) : null;

  // Persist to localStorage whenever formData changes (except initial load)
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      setStoredOnboardingData(formData);
    }
  }, [formData]);

  const updateField = useCallback(
    (field: keyof OnboardingFormData, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const saveOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const payload = buildOnboardingPayload(formData);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      const upsertPayload = {
        ...payload,
        user_id: userId,
      };

      const { error } = await supabase
        .from("onboarding_responses")
        .upsert(upsertPayload, { onConflict: "user_id" })
        .select();

      if (error) {
        toast.error(error.message || "Failed to save. Please try again.");
        throw error;
      }

      clearStoredOnboardingData();
      await supabase.auth.updateUser({
        data: { onboarding_complete: true },
      });
      toast.success("Your risk profile has been saved.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const goNext = useCallback(() => {
    void (async () => {
      const currentStep = step;
      if (!currentStep) return;

      // Last question: save data, then move to confirmation screen
      if (currentStep.id === "insuranceTypesOwned") {
        try {
          await saveOnboarding();
        } catch {
          return; // stay on this step if save fails
        }
      }

      // Confirmation: just go to dashboard (data already saved)
      if (currentStep.id === "confirmation") {
        router.push("/dashboard");
        return;
      }

      setDirection("next");
      setIsAnimating(true);
      requestAnimationFrame(() => {
        setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
        setTimeout(() => setIsAnimating(false), 320);
      });
    })();
  }, [step, saveOnboarding, router]);

  const goBack = useCallback(() => {
    setDirection("back");
    setIsAnimating(true);
    requestAnimationFrame(() => {
      setStepIndex((i) => Math.max(i - 1, 0));
      setTimeout(() => setIsAnimating(false), 320);
    });
  }, []);

  const isCategoryEndWithAnswer = (
    s: typeof step,
    data: OnboardingFormData,
  ): boolean => {
    if (!s || s.id === "welcome" || s.id === "confirmation") return false;
    if (!s.nextButtonLabel) return false; // only section-end steps have this
    const key = s.id as keyof OnboardingFormData;
    const val = data[key];
    if (s.type === "multiple") return Array.isArray(val) && val.length > 0;
    return val != null && String(val).trim() !== "";
  };

  if (!step) return null;

  const animationClass =
    direction === "next"
      ? "animate-in fade-in slide-in-from-right duration-300"
      : "animate-in fade-in slide-in-from-left duration-300";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header: back + category title + progress */}
      {step.id !== "welcome" && step.id !== "confirmation" && (
        <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2"
            onClick={goBack}
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="font-medium text-accent-foreground truncate">
            {step.categoryLabel}
          </span>
          {categoryProgress && (
            <span className="text-muted-foreground text-sm tabular-nums shrink-0">
              {categoryProgress.current}/{categoryProgress.total}
            </span>
          )}
        </header>
      )}

      <div className="flex-1 flex flex-col px-4 py-6 overflow-hidden">
        <div
          key={step.id}
          className={cn(
            "flex flex-col flex-1 min-h-0",
            isAnimating && animationClass,
          )}
        >
          {step.id === "welcome" && <WelcomeStep />}

          {step.id === "confirmation" && <ConfirmationStep />}

          {step.id !== "welcome" && step.id !== "confirmation" && (
            <QuestionStep
              step={step}
              formData={formData}
              updateField={updateField}
              onAutoNext={goNext}
              categoryIcon={CATEGORY_ICONS[step.category]}
              isCategoryEnd={Boolean(step.nextButtonLabel)}
            />
          )}
        </div>

        {/* Bottom CTA: welcome, confirmation, or end-of-section (e.g. "Continue to Lifestyle") */}
        {(step.id === "welcome" ||
          step.id === "confirmation" ||
          isCategoryEndWithAnswer(step, formData)) && (
          <div className="pt-4 shrink-0">
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={goNext}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving…"
                : (step.nextButtonLabel ?? "Let's Get Started")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <>
      <div className="flex-1 flex flex-col justify-center text-center">
        <h1 className="text-2xl font-semibold text-accent-foreground mb-2">
          Crafting Your Personalized Risk Portfolio
        </h1>
        <p className="text-muted-foreground mb-8">Setup takes only 2-3 mins</p>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { label: "Personal Information", icon: Activity },
            { label: "Lifestyle", icon: Heart },
            { label: "Medical History", icon: Shield },
            { label: "Financial", icon: Wallet },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
            >
              <Icon className="size-6 text-primary shrink-0" />
              <span className="font-medium text-accent-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const AUTO_NEXT_DELAY_SINGLE = 400;
const AUTO_NEXT_DELAY_MULTIPLE = 800;

function QuestionStep({
  step,
  formData,
  updateField,
  onAutoNext,
  categoryIcon,
  isCategoryEnd,
}: {
  step: StepConfig;
  formData: OnboardingFormData;
  updateField: (
    field: keyof OnboardingFormData,
    value: string | string[],
  ) => void;
  onAutoNext: () => void;
  categoryIcon: React.ReactNode;
  isCategoryEnd: boolean;
}) {
  const key = step.id as keyof OnboardingFormData;
  const value = formData[key];
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoNext = useCallback(
    (delay: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        onAutoNext();
      }, delay);
    },
    [onAutoNext],
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleSingleChange = useCallback(
    (v: string) => {
      updateField(key, v);
      if (!isCategoryEnd) scheduleAutoNext(AUTO_NEXT_DELAY_SINGLE);
    },
    [key, updateField, scheduleAutoNext, isCategoryEnd],
  );

  const handleMultipleChange = useCallback(
    (next: string[]) => {
      updateField(key, next);
      if (next.length > 0 && !isCategoryEnd)
        scheduleAutoNext(AUTO_NEXT_DELAY_MULTIPLE);
    },
    [key, updateField, scheduleAutoNext, isCategoryEnd],
  );

  const currentSingle = (value as string | undefined) ?? "";

  return (
    <>
      <div className="flex-1 flex flex-col">
        {categoryIcon && (
          <div className="mb-4 flex items-center justify-center size-12 rounded-full bg-primary/10">
            {categoryIcon}
          </div>
        )}
        <h2 className="text-xl font-semibold text-accent-foreground mb-6">
          {step.question}
        </h2>

        {step.type === "single" && step.options && (
          <RadioGroup
            value={currentSingle}
            onValueChange={handleSingleChange}
            className="flex flex-col gap-3"
          >
            {step.options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  if (currentSingle === opt.value) onAutoNext();
                }}
                className="cursor-pointer"
              >
                <RadioGroupItem
                  id={`${step.id}-${opt.value}`}
                  value={opt.value}
                  label={opt.label}
                  size="md"
                  labelPadding="md"
                />
              </div>
            ))}
          </RadioGroup>
        )}

        {step.type === "multiple" && step.options && (
          <div className="flex flex-col gap-3">
            {step.options.map((opt) => {
              const arr = (value as string[] | undefined) ?? [];
              const checked = arr.includes(opt.value);
              const toggle = () => {
                if (opt.value === "None") {
                  handleMultipleChange(["None"]);
                  return;
                }
                const next = checked
                  ? arr.filter((x) => x !== opt.value)
                  : [...arr.filter((x) => x !== "None"), opt.value];
                handleMultipleChange(next.length ? next : []);
              };
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={toggle}
                    size="md"
                  />
                  <span className="font-medium">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function ConfirmationStep() {
  const features = [
    { icon: Wallet, label: "Wallet", desc: "Manage all policies in one place" },
    {
      icon: Shield,
      label: "Premium",
      desc: "Manage all policies in one place",
    },
    {
      icon: Activity,
      label: "Risk Profile",
      desc: "Manage all policies in one place",
    },
    { icon: Heart, label: "Claims", desc: "Manage all policies in one place" },
    {
      icon: Check,
      label: "Quick Actions",
      desc: "Manage all policies in one place",
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <div className="flex justify-center mb-6">
        <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="size-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-accent-foreground mb-2">
        Your Personalized Risk Profile is Ready!
      </h1>
      <ul className="text-left space-y-3 mt-8">
        {features.map(({ icon: Icon, label, desc }) => (
          <li key={label} className="flex items-center gap-3">
            <Icon className="size-5 text-primary shrink-0" />
            <div>
              <span className="font-medium text-accent-foreground">
                {label}
              </span>
              <span className="text-muted-foreground text-sm ml-2">{desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
