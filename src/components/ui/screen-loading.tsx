import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** @deprecated Use default `page` — kept for call-site compatibility */
export type ScreenLoadingVariant =
  | "full"
  | "page"
  | "navigate"
  | "list"
  | "inline"
  | "cards-row"
  | "summary";

export interface ScreenLoadingProps extends React.ComponentProps<"div"> {
  variant?: ScreenLoadingVariant;
  /** Number of content card rows (default 4) */
  rows?: number;
  /** Screen reader label */
  label?: string;
}

function PageContentSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  const contentRows = Math.min(6, Math.max(3, rows));

  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-52 max-w-full rounded-lg sm:h-10" />
        <Skeleton className="h-10 w-32 rounded-lg max-sm:max-w-[140px]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={`stat-${i}`}
            className="h-[88px] w-full rounded-xl sm:h-[92px]"
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: contentRows }).map((_, i) => (
          <Skeleton
            key={`row-${i}`}
            className="h-[136px] w-full rounded-2xl sm:h-[148px]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Shared loading shell for route transitions and in-page fetches.
 * All private pages use the same `page` skeleton layout.
 */
function ScreenLoading({
  variant = "page",
  rows = 4,
  label = "Loading",
  className,
  ...props
}: ScreenLoadingProps) {
  if (variant === "full") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn(
          "flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FFF7ED] px-4",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-14">
            <div className="absolute inset-0 rounded-full border-2 border-primary/25" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          </div>
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      <PageContentSkeleton rows={rows} />
    </div>
  );
}

export { ScreenLoading };
