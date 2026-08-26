import type { ScreenLoadingProps } from "@/components/ui/screen-loading";

export type PageLoadingPreset =
  | "default"
  | "dashboard"
  | "coverage"
  | "my-claims"
  | "renewal"
  | "notifications"
  | "plans"
  | "your-policy"
  | "policy-detail"
  | "my-profile"
  | "hospitals"
  | "buy-insurance"
  | "assistant"
  | "onboarding"
  | "session";

type PageLoadingPresetConfig = Pick<
  ScreenLoadingProps,
  | "variant"
  | "label"
  | "showHeader"
  | "rows"
  | "statCount"
  | "showStats"
  | "rowType"
  | "className"
>;

export const PAGE_LOADING_PRESETS: Record<
  PageLoadingPreset,
  PageLoadingPresetConfig
> = {
  default: {
    variant: "page",
    showHeader: true,
    rows: 4,
    label: "Loading page",
    className: "py-2",
  },
  dashboard: {
    variant: "cards-row",
    rows: 4,
    showHeader: true,
    label: "Loading dashboard",
    className: "py-2",
  },
  coverage: {
    variant: "detail",
    showHeader: false,
    label: "Loading coverage",
    className: "py-4",
  },
  "my-claims": {
    variant: "summary",
    showHeader: false,
    statCount: 4,
    rows: 3,
    rowType: "claim",
    label: "Loading claims",
  },
  renewal: {
    variant: "summary",
    showHeader: false,
    statCount: 3,
    rows: 3,
    rowType: "renewal",
    label: "Loading renewals",
  },
  notifications: {
    variant: "list",
    showHeader: false,
    rows: 5,
    rowType: "notification",
    label: "Loading notifications",
  },
  plans: {
    variant: "list",
    showHeader: false,
    rows: 3,
    label: "Loading plans",
  },
  "your-policy": {
    variant: "cards-row",
    showHeader: false,
    rows: 2,
    label: "Loading policies",
    className: "pt-2",
  },
  "policy-detail": {
    variant: "detail",
    showHeader: false,
    label: "Loading policy",
  },
  "my-profile": {
    variant: "profile",
    showHeader: false,
    label: "Loading profile",
    className: "py-4",
  },
  hospitals: {
    variant: "list",
    showHeader: true,
    rows: 6,
    label: "Loading hospitals",
    className: "py-2",
  },
  "buy-insurance": {
    variant: "form",
    showHeader: false,
    label: "Loading insurance plans",
    className: "py-2",
  },
  assistant: {
    variant: "chat",
    showHeader: false,
    label: "Loading assistant",
    className: "py-4",
  },
  onboarding: {
    variant: "form",
    showHeader: false,
    label: "Loading onboarding",
    className: "py-6",
  },
  session: {
    variant: "full",
    label: "Checking session",
  },
};

export function getPageLoadingPreset(
  preset: PageLoadingPreset,
): PageLoadingPresetConfig {
  return PAGE_LOADING_PRESETS[preset];
}
