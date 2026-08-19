"use client";

import { usePathname } from "next/navigation";
import { RouteLoading } from "@/components/ui/route-loading";
import type { PageLoadingPreset } from "@/lib/page-loading-presets";

/**
 * Route prefix → skeleton preset. Ordered most-specific first, so nested
 * routes (e.g. /your-policy/<id>) win over their parent.
 */
const ROUTE_PRESETS: ReadonlyArray<[prefix: string, preset: PageLoadingPreset]> =
  [
    ["/your-policy/", "policy-detail"],
    ["/your-policy", "your-policy"],
    ["/dashboard", "dashboard"],
    ["/coverage", "coverage"],
    ["/my-claims", "my-claims"],
    ["/my-profile", "my-profile"],
    ["/renewal", "renewal"],
    ["/notifications", "notifications"],
    ["/plans", "plans"],
    ["/network-hospital", "hospitals"],
    ["/block-list-hospital", "hospitals"],
    ["/buy-insurance", "buy-insurance"],
    ["/search", "assistant"],
    ["/policy-ai", "assistant"],
    ["/onboarding", "onboarding"],
  ];

export function getPresetForPath(pathname: string | null): PageLoadingPreset {
  if (!pathname) return "default";
  const match = ROUTE_PRESETS.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : "default";
}

/**
 * The single loading UI for the app. Picks the right skeleton from the current
 * route, so routes don't each need their own loading.tsx boilerplate.
 *
 * Pass `preset` to override when a route needs something specific.
 */
export function PageLoader({ preset }: { preset?: PageLoadingPreset }) {
  const pathname = usePathname();
  return <RouteLoading preset={preset ?? getPresetForPath(pathname)} />;
}

export default PageLoader;
