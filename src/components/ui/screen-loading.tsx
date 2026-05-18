import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type ScreenLoadingVariant =
  | "full"
  | "navigate"
  | "page"
  | "list"
  | "inline"
  | "cards-row"
  | "summary";

export interface ScreenLoadingProps extends React.ComponentProps<"div"> {
  variant?: ScreenLoadingVariant;
  /** Number of list/card rows for `list` variant */
  rows?: number;
  /** Screen reader label */
  label?: string;
}

/**
 * Consistent loading shells for auth gate, route transitions, and in-page fetches.
 * Matches app chrome (warm background accent via skeleton tones).
 */
function ScreenLoading({
  variant = "page",
  rows = 4,
  label = "Loading",
  className,
  ...props
}: ScreenLoadingProps) {
  const listRows = Math.min(8, Math.max(2, rows));

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
          <Skeleton className="h-4 w-36 rounded-md bg-primary/10" />
          <Skeleton className="h-3 w-48 rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (variant === "navigate") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn("flex w-full flex-col gap-8 pb-12", className)}
        {...props}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-48 max-w-full rounded-lg sm:h-10" />
          <Skeleton className="h-10 w-36 rounded-lg max-sm:hidden" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 w-full rounded-xl bg-muted/80 sm:h-[104px]"
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: listRows }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-36 w-full rounded-2xl bg-muted/70 sm:h-40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn("flex w-full flex-col gap-4", className)}
        {...props}
      >
        {Array.from({ length: listRows }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-32 w-full rounded-2xl bg-muted/70 sm:h-36"
          />
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn("flex flex-col gap-3 py-2", className)}
        {...props}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "cards-row") {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn(
          "flex gap-6 overflow-x-auto py-4 scrollbar-hide",
          className,
        )}
        {...props}
      >
        {Array.from({ length: listRows }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[280px] min-w-[300px] shrink-0 rounded-xl bg-muted/70 sm:min-w-[354px]"
          />
        ))}
      </div>
    );
  }

  if (variant === "summary") {
    const detailRows = Math.min(6, Math.max(1, rows));
    return (
      <div
        role="status"
        aria-label={label}
        className={cn("flex w-full flex-col gap-6", className)}
        {...props}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 w-full rounded-xl bg-muted/80 sm:h-[104px]"
            />
          ))}
        </div>
        {Array.from({ length: detailRows }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-44 w-full rounded-xl bg-muted/70 sm:h-48"
          />
        ))}
      </div>
    );
  }

  /* page — generic detail / coverage / policy shell */
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex w-full flex-col gap-6 py-4", className)}
      {...props}
    >
      <Skeleton className="h-28 w-full max-w-3xl rounded-xl bg-muted/70" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl bg-muted/60" />
        <Skeleton className="h-64 w-full rounded-xl bg-muted/60" />
      </div>
      <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
      <Skeleton className="h-40 w-full rounded-xl bg-muted/50" />
    </div>
  );
}

export { ScreenLoading };
