import { notFound } from "next/navigation";
import { OnboardingStepForm } from "@/components/onboarding/OnboardingStepForm";

/**
 * Dev-only preview of the onboarding flow with no auth guard, so the styling
 * and animations can be viewed without a Supabase session. Returns 404 in
 * production builds.
 */
export default function OnboardingPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <OnboardingStepForm />;
}
