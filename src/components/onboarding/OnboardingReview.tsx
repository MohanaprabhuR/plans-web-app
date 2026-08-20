"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type OnboardingFormData,
  type StepConfig,
  buildOnboardingPayload,
  getEditableStepsByCategory,
  getStoredOnboardingData,
  mapRowToFormData,
} from "@/lib/onboarding";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Alert, AlertTitle } from "../ui/alert";

const GROUPS = getEditableStepsByCategory();

/** Return-to route after saving or cancelling an edit. */
const RETURN_TO = "/my-profile";

/**
 * Review/edit screen for a completed risk profile. Loads the saved
 * onboarding_responses row, renders every answer inline (grouped by category)
 * as editable chips, and upserts changes back.
 */
export function OnboardingReview() {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // No session (dev/preview): fall back to any locally-stored answers.
      if (!userId) {
        if (!cancelled) setFormData(getStoredOnboardingData() ?? {});
        return;
      }

      const { data, error } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        toast.error(error.message || "Couldn't load your answers.");
        setFormData({});
        return;
      }
      setFormData(mapRowToFormData(data));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setField = useCallback(
    (key: keyof OnboardingFormData, value: string | string[]) => {
      setFormData((prev) => ({ ...(prev ?? {}), [key]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      if (!userId) {
        // Mirrors OnboardingStepForm: RLS blocks anon writes, so in dev just
        // return to the profile; in production surface a clear message.
        if (process.env.NODE_ENV !== "production") {
          router.push(RETURN_TO);
          return;
        }
        toast.error("Please sign in to save your responses.");
        return;
      }

      const payload = buildOnboardingPayload(formData);
      const { error } = await supabase
        .from("onboarding_responses")
        .upsert({ ...payload, user_id: userId }, { onConflict: "user_id" })
        .select();

      if (error) {
        toast.error(error.message || "Failed to save. Please try again.");
        return;
      }

      toast.custom(() => (
        <Alert variant="success">
          <Check className="size-4" />
          <AlertTitle>Your risk profile has been updated.</AlertTitle>
        </Alert>
      ));
      router.push(RETURN_TO);
    } finally {
      setSaving(false);
    }
  }, [formData, router]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-62px)] w-full max-w-lg flex-col bg-background">
      <header className="shrink-0 border-b border-border px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className="-ml-1.5 rounded-full"
            onClick={() => router.push(RETURN_TO)}
            aria-label="Go back"
          >
            <ChevronLeft />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-accent-foreground">
              Edit risk profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Update any answer, then save your changes.
            </p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {formData === null ? (
          <ReviewSkeleton />
        ) : (
          <div className="flex flex-col gap-8">
            {GROUPS.map((group) => (
              <section key={group.category}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h2>
                <div className="flex flex-col gap-5">
                  {group.steps.map((step) => (
                    <QuestionRow
                      key={step.id}
                      step={step}
                      formData={formData}
                      setField={setField}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-border px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-xl"
            onClick={() => router.push(RETURN_TO)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-xl"
            onClick={save}
            disabled={saving || formData === null}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function chipClass(selected: boolean) {
  return cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
    "cursor-pointer select-none",
    selected
      ? "border-primary bg-primary/5 text-accent-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-accent-foreground",
  );
}

function QuestionRow({
  step,
  formData,
  setField,
}: {
  step: StepConfig;
  formData: OnboardingFormData;
  setField: (key: keyof OnboardingFormData, value: string | string[]) => void;
}) {
  const key = step.id as keyof OnboardingFormData;
  const value = formData[key];

  const isMultiple = step.type === "multiple";
  const selectedArr = (value as string[] | undefined) ?? [];
  const selectedSingle = (value as string | undefined) ?? "";

  const toggleMultiple = (optValue: string) => {
    if (optValue === "None") {
      setField(key, ["None"]);
      return;
    }
    const checked = selectedArr.includes(optValue);
    const next = checked
      ? selectedArr.filter((x) => x !== optValue)
      : [...selectedArr.filter((x) => x !== "None"), optValue];
    setField(key, next);
  };

  return (
    <div>
      <p className="mb-2 font-medium text-accent-foreground">{step.question}</p>
      <div className="flex flex-wrap gap-2">
        {step.options?.map((opt) => {
          const selected = isMultiple
            ? selectedArr.includes(opt.value)
            : selectedSingle === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                isMultiple ? toggleMultiple(opt.value) : setField(key, opt.value)
              }
              className={chipClass(selected)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[0, 1, 2].map((s) => (
        <div key={s}>
          <div className="mb-3 h-3 w-32 rounded bg-secondary" />
          <div className="flex flex-col gap-5">
            {[0, 1].map((r) => (
              <div key={r}>
                <div className="mb-2 h-4 w-56 max-w-full rounded bg-secondary" />
                <div className="flex gap-2">
                  <div className="h-9 w-20 rounded-full bg-secondary" />
                  <div className="h-9 w-20 rounded-full bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
