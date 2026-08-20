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

const STEP_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const STEP_MOTION =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-400 motion-reduce:animate-none";

export function OnboardingStepForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(
    () => getStoredOnboardingData() ?? {},
  );
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const categoryProgress = step ? getCategoryProgress(step.id) : null;

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

      // The RLS policy on onboarding_responses only allows a write when
      // user_id === auth.uid(), so without a session the insert is rejected
      // ("new row violates row-level security policy"). This happens on the
      // dev-only /onboarding-preview route, which has no auth. Skip the write
      // in dev so the flow can still be previewed end-to-end; in production
      // (where the auth guard guarantees a session) surface a clear message.
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
      if (!currentStep) return;

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
  }, [step, saveOnboarding, router]);

  const goBack = useCallback(() => {
    setDirection("back");
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

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

  const enterClass = cn(
    STEP_MOTION,
    STEP_EASE,
    direction === "next"
      ? "motion-safe:slide-in-from-right-4"
      : "motion-safe:slide-in-from-left-4",
  );

  return (
    <div className="relative mx-auto flex h-[calc(100dvh-62px)] w-full max-w-lg flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-orange-50 to-transparent dark:from-orange-950/25"
      />

      <header className="relative z-10 shrink-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex min-h-14 items-center gap-3">
          {!isIntroStep ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                className="-ml-1.5 rounded-full"
                onClick={goBack}
                aria-label="Go back"
              >
                <ChevronLeft />
              </Button>
              <ProgressBar
                activeCategory={step.category}
                progress={categoryProgress}
              />
            </>
          ) : (
            <div className="h-8 w-full" />
          )}
        </div>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
            isIntroStep
              ? "mb-0 grid-rows-[0fr] opacity-0"
              : "mb-1 grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-baseline justify-between pb-1">
              <span
                key={step.categoryLabel}
                className={cn(
                  "text-sm font-medium text-muted-foreground",
                  STEP_MOTION,
                )}
              >
                {step.categoryLabel}
              </span>
              {categoryProgress && (
                <span
                  key={`${step.category}-${categoryProgress.current}`}
                  className={cn(
                    "text-xs tabular-nums text-muted-foreground",
                    STEP_MOTION,
                  )}
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
          {/* Intro steps animate as a block; question steps cascade their
              own children in, so the container stays still for them. */}
          <div key={step.id} className={isIntroStep ? enterClass : undefined}>
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
              />
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex min-h-14 items-stretch">
          {showBottomCta && (
            <Button
              size="lg"
              className={cn(
                "h-12 w-full rounded-xl",
                STEP_MOTION,
                "motion-safe:slide-in-from-bottom-2",
              )}
              onClick={goNext}
              disabled={isSubmitting}
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
              className="h-full origin-left rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
            className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both motion-reduce:animate-none"
            style={{ animationDelay: `${80 + i * 80}ms` }}
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

const AUTO_NEXT_DELAY_SINGLE = 420;
const AUTO_NEXT_DELAY_MULTIPLE = 800;

function optionCardClass(selected: boolean) {
  return cn(
    "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left",
    "transition-[border-color,background-color,box-shadow,transform] duration-200",
    "cursor-pointer select-none active:scale-[0.985]",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    selected
      ? "border-primary bg-primary/5 shadow-xs"
      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
  );
}

/** Per-item entrance for a freshly-arrived question. */
const ARRIVE_STEP_MS = 70;

function QuestionStep({
  step,
  direction,
  formData,
  updateField,
  onAutoNext,
  categoryIcon,
  isCategoryEnd,
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

  // Each part of the question "arrives" in sequence: icon, heading, then the
  // options cascade in. Direction-aware, and disabled under reduced motion.
  const arrive = cn(
    "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:duration-400 motion-reduce:animate-none",
    STEP_EASE,
    direction === "next"
      ? "motion-safe:slide-in-from-right-4"
      : "motion-safe:slide-in-from-left-4",
  );
  const arriveDelay = (i: number): React.CSSProperties => ({
    animationDelay: `${i * ARRIVE_STEP_MS}ms`,
  });

  return (
    <div className="flex flex-col">
      {categoryIcon && (
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10",
            arrive,
          )}
          style={arriveDelay(0)}
        >
          {categoryIcon}
        </div>
      )}
      <h2
        className={cn(
          "mb-6 text-balance text-xl font-semibold tracking-tight text-accent-foreground",
          arrive,
        )}
        style={arriveDelay(1)}
      >
        {step.question}
      </h2>

      {step.type === "single" && step.options && (
        <RadioGroup
          value={currentSingle}
          onValueChange={handleSingleChange}
          className="flex flex-col gap-2.5"
        >
          {step.options.map((opt, i) => {
            const selected = currentSingle === opt.value;
            const id = `${step.id}-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                onClick={() => {
                  if (selected) onAutoNext();
                }}
                className={cn(optionCardClass(selected), arrive)}
                style={arriveDelay(i + 2)}
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
                className={cn(optionCardClass(checked), arrive)}
                style={arriveDelay(i + 2)}
              >
                <span className="flex-1 font-medium text-accent-foreground">
                  {opt.label}
                </span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={toggle}
                  size="md"
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
      <div className="mb-6 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:fade-in motion-safe:duration-500 motion-reduce:animate-none">
          <Check className="size-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h1 className="mb-2 text-balance text-2xl font-semibold tracking-tight text-accent-foreground">
        Your Personalized Risk Profile is Ready!
      </h1>
      <ul className="mt-8 space-y-2.5 text-left">
        {features.map(({ icon: Icon, label, desc }, i) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both motion-reduce:animate-none"
            style={{ animationDelay: `${100 + i * 70}ms` }}
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
