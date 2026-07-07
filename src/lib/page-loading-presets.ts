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
  | "session";

type PageLoadingPresetConfig = Pick<
  ScreenLoadingProps,
  "variant" | "label" | "showHeader" | "rows" | "statCount" | "showStats" | "className"
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
    label: "Loading claims",
  },
  renewal: {
    variant: "summary",
    showHeader: false,
    statCount: 3,
    rows: 3,
    label: "Loading renewals",
  },
  notifications: {
    variant: "list",
    showHeader: false,
    rows: 5,
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
    variant: "detail",
    showHeader: false,
    label: "Loading profile",
    className: "py-4",
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
