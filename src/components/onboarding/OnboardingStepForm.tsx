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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type OnboardingFormData,
  type StepCategory,
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
import { Alert, AlertTitle } from "../ui/alert";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  welcome: null,
  personal: <Activity className="size-5 text-primary" />,
  lifestyle: <Heart className="size-5 text-primary" />,
  medical: <Shield className="size-5 text-primary" />,
  financial: <Wallet className="size-5 text-primary" />,
  confirmation: null,
};

/** The four answerable categories, in order — drives the progress bar. */
const PROGRESS_CATEGORIES: StepCategory[] = [
  "personal",
  "lifestyle",
  "medical",
  "financial",
];

const ARRIVE_STEP_MS = 55;
const AUTO_NEXT_DELAY_SINGLE = 380;
const AUTO_NEXT_DELAY_MULTIPLE = 750;

function arriveProps(index: number, direction: "next" | "back") {
  return {
    "data-onboarding-arrive": true,
    "data-direction": direction,
    style: {
      ["--onboarding-delay" as string]: `${index * ARRIVE_STEP_MS}ms`,
    } as React.CSSProperties,
  };
}

export function OnboardingStepForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(
    () => getStoredOnboardingData() ?? {},
  );
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [navLocked, setNavLocked] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const categoryProgress = step ? getCategoryProgress(step.id) : null;

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      setStoredOnboardingData(formData);
    }
  }, [formData]);

  // Unlock after the enter animation so rapid taps can't skip steps.
  useEffect(() => {
    setNavLocked(true);
    const id = window.setTimeout(() => setNavLocked(false), 320);
    return () => window.clearTimeout(id);
  }, [stepIndex]);

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

      // The RLS policy on onboarding_responses only allows a write when
      // user_id === auth.uid(), so without a session the insert is rejected.
      // Skip the write on the dev-only /onboarding-preview route.
      if (!userId) {
        if (process.env.NODE_ENV !== "production") {
          clearStoredOnboardingData();
          return;
        }
        const message = "Please sign in to save your responses.";
        toast.error(message);
        throw new Error(message);
      }

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

      toast.custom(() => (
        <Alert variant="success">
          <Check className="size-4" />
          <AlertTitle>Your risk profile has been saved.</AlertTitle>
        </Alert>
      ));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const goNext = useCallback(() => {
    void (async () => {
      const currentStep = step;
      if (!currentStep || navLocked || isSubmitting) return;

      if (currentStep.id === "insuranceTypesOwned") {
        try {
          await saveOnboarding();
        } catch {
          return;
        }
      }

      if (currentStep.id === "confirmation") {
        router.push("/dashboard");
        return;
      }

      setDirection("next");
      setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
    })();
  }, [step, saveOnboarding, router, navLocked, isSubmitting]);

  const goBack = useCallback(() => {
    if (navLocked) return;
    setDirection("back");
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [navLocked]);

  const isCategoryEndWithAnswer = (
    s: typeof step,
    data: OnboardingFormData,
  ): boolean => {
    if (!s || s.id === "welcome" || s.id === "confirmation") return false;
    if (!s.nextButtonLabel) return false;
    const key = s.id as keyof OnboardingFormData;
    const val = data[key];
    if (s.type === "multiple") return Array.isArray(val) && val.length > 0;
    return val != null && String(val).trim() !== "";
  };

  if (!step) return null;

  const isIntroStep = step.id === "welcome" || step.id === "confirmation";
  const showBottomCta =
    step.id === "welcome" ||
    step.id === "confirmation" ||
    isCategoryEndWithAnswer(step, formData);

  return (
    <div className="relative mx-auto flex h-app-screen w-full max-w-lg flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-orange-50 to-transparent dark:from-orange-950/25"
      />

      <header className="relative z-10 shrink-0 px-5 pt-safe-top">
        <div className="flex min-h-14 items-center gap-3">
          {!isIntroStep ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                className="-ml-1.5 rounded-full"
                onClick={goBack}
                disabled={navLocked}
                aria-label="Go back"
              >
                <ChevronLeft />
              </Button>
              <ProgressBar
                activeCategory={step.category}
                progress={categoryProgress}
              />
              <ThemeToggle />
            </>
          ) : (
            <>
              <div className="h-8 w-full" />
              <ThemeToggle />
            </>
          )}
        </div>
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            isIntroStep
              ? "mb-0 grid-rows-[0fr] opacity-0"
              : "mb-1 grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-baseline justify-between pb-1">
              <span
                key={step.categoryLabel}
                className="text-sm font-medium text-muted-foreground"
                {...arriveProps(0, direction)}
              >
                {step.categoryLabel}
              </span>
              {categoryProgress && (
                <span
                  key={`${step.category}-${categoryProgress.current}`}
                  className="text-xs tabular-nums text-muted-foreground"
                  {...arriveProps(1, direction)}
                >
                  {categoryProgress.current} of {categoryProgress.total}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5",
          isIntroStep ? "justify-center py-4" : "justify-start py-2",
        )}
      >
        <div className="overflow-x-hidden">
          <div
            key={step.id}
            data-onboarding-step
            data-direction={direction}
          >
            {step.id === "welcome" && <WelcomeStep />}

            {step.id === "confirmation" && <ConfirmationStep />}

            {!isIntroStep && (
              <QuestionStep
                step={step}
                direction={direction}
                formData={formData}
                updateField={updateField}
                onAutoNext={goNext}
                categoryIcon={CATEGORY_ICONS[step.category]}
                isCategoryEnd={Boolean(step.nextButtonLabel)}
                disabled={navLocked || isSubmitting}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 px-5 pt-2 pb-safe-bottom-lg">
        <div className="flex min-h-14 items-stretch">
          {showBottomCta && (
            <Button
              key={`cta-${step.id}`}
              size="lg"
              className="h-12 w-full rounded-xl"
              data-onboarding-arrive
              data-direction={direction}
              style={
                {
                  ["--onboarding-delay" as string]: "120ms",
                } as React.CSSProperties
              }
              onClick={goNext}
              disabled={isSubmitting || navLocked}
            >
              {isSubmitting
                ? "Saving…"
                : (step.nextButtonLabel ?? "Let's Get Started")}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function ProgressBar({
  activeCategory,
  progress,
}: {
  activeCategory: StepCategory;
  progress: { current: number; total: number } | null;
}) {
  const activeIndex = PROGRESS_CATEGORIES.indexOf(activeCategory);

  return (
    <div className="flex flex-1 items-center gap-1.5" aria-hidden>
      {PROGRESS_CATEGORIES.map((category, index) => {
        let fill = 0;
        if (index < activeIndex) fill = 100;
        else if (index === activeIndex && progress)
          fill = (progress.current / progress.total) * 100;

        return (
          <div
            key={category}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-all duration-500 ease-onboarding"
              style={{ width: `${fill}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function WelcomeStep() {
  const features = [
    { label: "Personal Information", icon: Activity },
    { label: "Lifestyle", icon: Heart },
    { label: "Medical History", icon: Shield },
    { label: "Financial", icon: Wallet },
  ];

  return (
    <div className="flex flex-col text-center">
      <h1 className="mb-2 text-balance text-2xl font-semibold tracking-tight text-accent-foreground">
        Crafting Your Personalized Risk Portfolio
      </h1>
      <p className="mb-8 text-muted-foreground">Setup takes only 2-3 mins</p>
      <div className="grid grid-cols-2 gap-3 text-left">
        {features.map(({ label, icon: Icon }, i) => (
          <div
            key={label}
            className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
            {...arriveProps(i + 1, "next")}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="size-5 text-primary" />
            </span>
            <span className="text-sm font-medium leading-snug text-accent-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function optionCardClass(selected: boolean) {
  return cn(
    "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left",
    "transition-colors duration-200",
    "cursor-pointer select-none active:scale-98",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    selected
      ? "border-primary bg-primary/5 shadow-xs"
      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
  );
}

function QuestionStep({
  step,
  direction,
  formData,
  updateField,
  onAutoNext,
  categoryIcon,
  isCategoryEnd,
  disabled,
}: {
  step: StepConfig;
  direction: "next" | "back";
  formData: OnboardingFormData;
  updateField: (
    field: keyof OnboardingFormData,
    value: string | string[],
  ) => void;
  onAutoNext: () => void;
  categoryIcon: React.ReactNode;
  isCategoryEnd: boolean;
  disabled: boolean;
}) {
  const key = step.id as keyof OnboardingFormData;
  const value = formData[key];
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [justSelected, setJustSelected] = useState<string | null>(null);

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
      if (disabled) return;
      updateField(key, v);
      setJustSelected(v);
      if (!isCategoryEnd) scheduleAutoNext(AUTO_NEXT_DELAY_SINGLE);
    },
    [key, updateField, scheduleAutoNext, isCategoryEnd, disabled],
  );

  const handleMultipleChange = useCallback(
    (next: string[]) => {
      if (disabled) return;
      updateField(key, next);
      if (next.length > 0) {
        setJustSelected(next[next.length - 1] ?? null);
      }
      if (next.length > 0 && !isCategoryEnd)
        scheduleAutoNext(AUTO_NEXT_DELAY_MULTIPLE);
    },
    [key, updateField, scheduleAutoNext, isCategoryEnd, disabled],
  );

  const currentSingle = (value as string | undefined) ?? "";

  return (
    <div className="flex flex-col">
      {categoryIcon && (
        <div
          className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10"
          {...arriveProps(0, direction)}
        >
          {categoryIcon}
        </div>
      )}
      <h2
        className="mb-6 text-balance text-xl font-semibold tracking-tight text-accent-foreground"
        {...arriveProps(1, direction)}
      >
        {step.question}
      </h2>

      {step.type === "single" && step.options && (
        <RadioGroup
          value={currentSingle}
          onValueChange={handleSingleChange}
          className="flex flex-col gap-2.5"
          disabled={disabled}
        >
          {step.options.map((opt, i) => {
            const selected = currentSingle === opt.value;
            const id = `${step.id}-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                data-onboarding-selected={
                  justSelected === opt.value ? "true" : undefined
                }
                onClick={() => {
                  if (disabled) return;
                  if (selected) onAutoNext();
                }}
                className={cn(optionCardClass(selected))}
                {...arriveProps(i + 2, direction)}
              >
                <span className="flex-1 font-medium text-accent-foreground">
                  {opt.label}
                </span>
                <RadioGroupItem id={id} value={opt.value} size="md" />
              </label>
            );
          })}
        </RadioGroup>
      )}

      {step.type === "multiple" && step.options && (
        <div className="flex flex-col gap-2.5">
          {step.options.map((opt, i) => {
            const arr = (value as string[] | undefined) ?? [];
            const checked = arr.includes(opt.value);
            const toggle = () => {
              if (disabled) return;
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
                data-onboarding-selected={
                  justSelected === opt.value ? "true" : undefined
                }
                className={cn(optionCardClass(checked))}
                {...arriveProps(i + 2, direction)}
              >
                <span className="flex-1 font-medium text-accent-foreground">
                  {opt.label}
                </span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={toggle}
                  size="md"
                  disabled={disabled}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConfirmationStep() {
  const features = [
    { icon: Wallet, label: "Wallet", desc: "All your policies in one place" },
    { icon: Shield, label: "Premium", desc: "Track what you pay and when" },
    {
      icon: Activity,
      label: "Risk Profile",
      desc: "A plan shaped around you",
    },
    { icon: Heart, label: "Claims", desc: "Help when you need it" },
    {
      icon: Check,
      label: "Quick Actions",
      desc: "Buy, renew, or update in a tap",
    },
  ];

  return (
    <div className="flex flex-col text-center">
      <div className="mb-6 flex justify-center" {...arriveProps(0, "next")}>
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15">
          <Check className="size-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h1
        className="mb-2 text-balance text-2xl font-semibold tracking-tight text-accent-foreground"
        {...arriveProps(1, "next")}
      >
        Your Personalized Risk Profile is Ready!
      </h1>
      <ul className="mt-8 space-y-2.5 text-left">
        {features.map(({ icon: Icon, label, desc }, i) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs"
            {...arriveProps(i + 2, "next")}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="size-5 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-accent-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
