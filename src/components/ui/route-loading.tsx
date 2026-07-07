import {
  ScreenLoading,
  type ScreenLoadingProps,
} from "@/components/ui/screen-loading";
import {
  getPageLoadingPreset,
  type PageLoadingPreset,
} from "@/lib/page-loading-presets";
import { cn } from "@/lib/utils";

export type RouteLoadingProps = {
  preset?: PageLoadingPreset;
} & Omit<ScreenLoadingProps, "variant"> &
  Partial<Pick<ScreenLoadingProps, "variant">>;

export function RouteLoading({
  preset = "default",
  className,
  ...overrides
}: RouteLoadingProps) {
  const config = getPageLoadingPreset(preset);

  return (
    <ScreenLoading
      {...config}
      {...overrides}
      className={cn(config.className, className)}
    />
  );
}
