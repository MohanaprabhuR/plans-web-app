/**
 * Onboarding step form: types, config, localStorage persistence, and DB submit.
 * Questions are shown one by one; values are stored in localStorage until final submit.
 */

export const ONBOARDING_STORAGE_KEY = "plans_onboarding_form";

// --- Form data shape (matches all steps) ---
export interface OnboardingFormData {
  // Personal Information
  gender?: "Male" | "Female";
  ageGroup?: "18-30" | "31-50" | "51-60" | "60+";
  employmentType?: "Full Time" | "Part Time" | "Self Employed" | "Retired";
  dependents?: "Yes" | "No";
  // Lifestyle
  smoking?: "Yes" | "No";
  alcohol?: "Never" | "Regularly" | "Occasionally";
  exerciseFrequency?: "Never" | "1-2 Times" | "3-4 Times" | "Daily";
  fitnessLevel?: "Low" | "Moderate" | "High";
  // Medical History
  preExistingConditions?: "Yes" | "No";
  knownConditions?: string[]; // Diabetes, Hypertension, Heart Issues, None
  hospitalizedPast5Years?: "Yes" | "No";
  regularMedications?: "Yes" | "No";
  // Financial
  monthlyIncome?: "Less than 10K" | "10K-20K" | "20K-40K" | "40K+";
  existingInsurancePolicies?: "Yes" | "No";
  insuranceBeneficiary?: "Myself" | "Self & Family" | "Parents";
  insuranceTypesOwned?: string[]; // Health, Auto, Life, Home, Travel
}

// --- Step definition (one question per step for "one by one" UX) ---
export type StepId =
  | "welcome"
  | "gender"
  | "ageGroup"
  | "employmentType"
  | "dependents"
  | "smoking"
  | "alcohol"
  | "exerciseFrequency"
  | "fitnessLevel"
  | "preExistingConditions"
  | "knownConditions"
  | "hospitalizedPast5Years"
  | "regularMedications"
  | "monthlyIncome"
  | "existingInsurancePolicies"
  | "insuranceBeneficiary"
  | "insuranceTypesOwned"
  | "confirmation";

export type StepCategory =
  | "welcome"
  | "personal"
  | "lifestyle"
  | "medical"
  | "financial"
  | "confirmation";

export interface StepOption {
  value: string;
  label: string;
}

export interface StepConfig {
  id: StepId;
  category: StepCategory;
  categoryLabel: string;
  title: string;
  question: string;
  type: "single" | "multiple";
  options?: StepOption[];
  nextButtonLabel?: string;
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "welcome",
    category: "welcome",
    categoryLabel: "",
    title: "Crafting Your Personalized Risk Portfolio",
    question: "Setup takes only 2-3 mins",
    type: "single",
    nextButtonLabel: "Let's Get Started",
  },
  // Personal Information
  {
    id: "gender",
    category: "personal",
    categoryLabel: "Personal Information",
    title: "Personal Information",
    question: "What is your gender?",
    type: "single",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
  },
  {
    id: "ageGroup",
    category: "personal",
    categoryLabel: "Personal Information",
    title: "Personal Information",
    question: "What is your age group?",
    type: "single",
    options: [
      { value: "18-30", label: "18-30" },
      { value: "31-50", label: "31-50" },
      { value: "51-60", label: "51-60" },
      { value: "60+", label: "60+" },
    ],
  },
  {
    id: "employmentType",
    category: "personal",
    categoryLabel: "Personal Information",
    title: "Personal Information",
    question: "What is your employment type?",
    type: "single",
    options: [
      { value: "Full Time", label: "Full Time" },
      { value: "Part Time", label: "Part Time" },
      { value: "Self Employed", label: "Self Employed" },
      { value: "Retired", label: "Retired" },
    ],
  },
  {
    id: "dependents",
    category: "personal",
    categoryLabel: "Personal Information",
    title: "Personal Information",
    question: "Do you have any dependents?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
    nextButtonLabel: "Continue to Lifestyle",
  },
  // Lifestyle
  {
    id: "smoking",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    title: "Lifestyle",
    question: "Do you smoke?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
  {
    id: "alcohol",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    title: "Lifestyle",
    question: "Do you consume alcohol?",
    type: "single",
    options: [
      { value: "Never", label: "Never" },
      { value: "Regularly", label: "Regularly" },
      { value: "Occasionally", label: "Occasionally" },
    ],
  },
  {
    id: "exerciseFrequency",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    title: "Lifestyle",
    question: "How often do you exercise intentionally?",
    type: "single",
    options: [
      { value: "Never", label: "Never" },
      { value: "1-2 Times", label: "1-2 Times" },
      { value: "3-4 Times", label: "3-4 Times" },
      { value: "Daily", label: "Daily" },
    ],
  },
  {
    id: "fitnessLevel",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    title: "Lifestyle",
    question: "How would you describe your fitness level?",
    type: "single",
    options: [
      { value: "Low", label: "Low" },
      { value: "Moderate", label: "Moderate" },
      { value: "High", label: "High" },
    ],
    nextButtonLabel: "Continue to Medical History",
  },
  // Medical History
  {
    id: "preExistingConditions",
    category: "medical",
    categoryLabel: "Medical History",
    title: "Medical History",
    question: "Do you have any pre-existing medical conditions?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
  {
    id: "knownConditions",
    category: "medical",
    categoryLabel: "Medical History",
    title: "Medical History",
    question: "Any known medical conditions?",
    type: "single",
    options: [
      { value: "Diabetes", label: "Diabetes" },
      { value: "Hypertension", label: "Hypertension" },
      { value: "Heart Issues", label: "Heart Issues" },
      { value: "None", label: "None" },
    ],
  },
  {
    id: "hospitalizedPast5Years",
    category: "medical",
    categoryLabel: "Medical History",
    title: "Medical History",
    question: "Have you been hospitalized in the past 5 years?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
  {
    id: "regularMedications",
    category: "medical",
    categoryLabel: "Medical History",
    title: "Medical History",
    question: "Do you take any regular medications?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
    nextButtonLabel: "Continue to Financial",
  },
  // Financial
  {
    id: "monthlyIncome",
    category: "financial",
    categoryLabel: "Financial",
    title: "Financial",
    question: "What is your monthly income?",
    type: "single",
    options: [
      { value: "Less than 10K", label: "Less than 10K" },
      { value: "10K-20K", label: "10K-20K" },
      { value: "20K-40K", label: "20K-40K" },
      { value: "40K+", label: "40K+" },
    ],
  },
  {
    id: "existingInsurancePolicies",
    category: "financial",
    categoryLabel: "Financial",
    title: "Financial",
    question: "Do you currently have any insurance policies?",
    type: "single",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
  {
    id: "insuranceBeneficiary",
    category: "financial",
    categoryLabel: "Financial",
    title: "Financial",
    question: "Are you buying insurance for yourself or family?",
    type: "single",
    options: [
      { value: "Myself", label: "Myself" },
      { value: "Self & Family", label: "Self & Family" },
      { value: "Parents", label: "Parents" },
    ],
  },
  {
    id: "insuranceTypesOwned",
    category: "financial",
    categoryLabel: "Financial",
    title: "Financial",
    question: "What types of insurance do you own?",
    type: "multiple",
    options: [
      { value: "Health", label: "Health" },
      { value: "Auto", label: "Auto" },
      { value: "Life", label: "Life" },
      { value: "Home", label: "Home" },
      { value: "Travel", label: "Travel" },
    ],
    nextButtonLabel: "Continue to Risk Profile",
  },
  {
    id: "confirmation",
    category: "confirmation",
    categoryLabel: "",
    title: "Your Personalized Risk Profile is Ready!",
    question: "",
    type: "single",
    nextButtonLabel: "View Dashboard",
  },
];

// --- Local storage helpers ---
export function getStoredOnboardingData(): OnboardingFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingFormData;
  } catch {
    return null;
  }
}

export function setStoredOnboardingData(data: OnboardingFormData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearStoredOnboardingData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// --- Get step index by id ---
export function getStepIndex(stepId: StepId): number {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
  return idx >= 0 ? idx : 0;
}

export function getStepByIndex(index: number): StepConfig | undefined {
  return ONBOARDING_STEPS[index];
}

// --- Category progress (e.g. "1/4" for first of four categories) ---
const CATEGORY_ORDER: StepCategory[] = [
  "welcome",
  "personal",
  "lifestyle",
  "medical",
  "financial",
  "confirmation",
];

export function getCategoryProgress(
  stepId: StepId,
): { current: number; total: number } | null {
  const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
  if (!step || step.category === "welcome" || step.category === "confirmation")
    return null;
  const categoryIndex = CATEGORY_ORDER.indexOf(step.category);
  if (categoryIndex <= 0) return null;
  const stepsInCategory = ONBOARDING_STEPS.filter(
    (s) => s.category === step.category,
  );
  const currentInCategory =
    stepsInCategory.findIndex((s) => s.id === stepId) + 1;
  return { current: currentInCategory, total: stepsInCategory.length };
}

// --- Database submit (Supabase). Table: onboarding_responses ---
export interface SubmitOnboardingResult {
  success: boolean;
  error?: string;
}

function toTextArray(
  value: string[] | string | null | undefined,
): string[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length ? value : null;
  return [String(value)];
}

/** Store as single text value (comma-separated if multiple). */
function toSingleText(
  value: string[] | string | null | undefined,
): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  return String(value);
}

export function buildOnboardingPayload(
  data: OnboardingFormData,
): Record<string, unknown> {
  return {
    gender: data.gender ?? null,
    age_group: data.ageGroup ?? null,
    employment_type: data.employmentType ?? null,
    dependents: data.dependents ?? null,
    smoking: data.smoking ?? null,
    alcohol: data.alcohol ?? null,
    exercise_frequency: data.exerciseFrequency ?? null,
    fitness_level: data.fitnessLevel ?? null,
    pre_existing_conditions: data.preExistingConditions ?? null,
    known_conditions: toSingleText(data.knownConditions),
    hospitalized_past_5_years: data.hospitalizedPast5Years ?? null,
    regular_medications: data.regularMedications ?? null,
    monthly_income: data.monthlyIncome ?? null,
    existing_insurance_policies: data.existingInsurancePolicies ?? null,
    insurance_beneficiary: data.insuranceBeneficiary ?? null,
    insurance_types_owned: toTextArray(data.insuranceTypesOwned),
    submitted_at: new Date().toISOString(),
  };
}
