import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export type ScreenLoadingVariant =
  | "full"
  | "page"
  | "list"
  | "summary"
  | "cards-row"
  | "detail";

export interface ScreenLoadingProps extends React.ComponentProps<"div"> {
  variant?: ScreenLoadingVariant;
  /** Content rows for list/summary/page (default 4) */
  rows?: number;
  /** Stat cards for summary/page (default 4) */
  statCount?: number;
  /** Show title + action placeholders (default true) */
  showHeader?: boolean;
  /** Show stat card row (summary/page only; default follows variant) */
  showStats?: boolean;
  /** Screen reader label */
  label?: string;
}

function LoadingLabel({ label }: { label: string }) {
  return (
    <span className="sr-only">{label}</span>
  );
}

function HeaderSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-9 w-52 max-w-full rounded-lg sm:h-10" delay={delay} />
      <Skeleton
        className="h-10 w-32 rounded-lg max-sm:max-w-[140px]"
        delay={delay + 40}
      />
    </div>
  );
}

function StatsSkeleton({
  count = 4,
  baseDelay = 80,
}: {
  count?: number;
  baseDelay?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={`stat-${i}`}
          className="h-[88px] w-full rounded-xl sm:h-[92px]"
          delay={baseDelay + i * 50}
        />
      ))}
    </div>
  );
}

function ListRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = 120 + index * 70;
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-transparent bg-card/40 p-1">
      <Skeleton className="size-12 shrink-0 rounded-2xl" delay={delay} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-3">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" delay={delay + 20} />
          <Skeleton className="h-3 w-20" delay={delay + 30} />
        </div>
        <Skeleton className="h-5 w-3/5 max-w-xs" delay={delay + 40} />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" delay={delay + 50} />
          <Skeleton className="h-3 w-32" delay={delay + 60} />
        </div>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
        <Skeleton className="h-6 w-20 rounded-full" delay={delay + 30} />
        <Skeleton className="h-7 w-16" delay={delay + 40} />
      </div>
    </div>
  );
}

function ClaimRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = 120 + index * 70;
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-stretch">
        <Skeleton className="w-1.5 shrink-0 rounded-none" delay={delay} />
        <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Skeleton className="size-12 shrink-0 rounded-2xl" delay={delay + 20} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-40" delay={delay + 30} />
            <Skeleton className="h-5 w-2/3" delay={delay + 40} />
            <Skeleton className="h-4 w-56" delay={delay + 50} />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3 sm:flex-col sm:items-end sm:border-none sm:pt-0">
            <Skeleton className="h-6 w-20 rounded-full" delay={delay + 35} />
            <Skeleton className="h-8 w-14" delay={delay + 45} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={`card-${i}`}
          className="h-[280px] min-w-[300px] shrink-0 rounded-xl sm:min-w-[354px]"
          delay={100 + i * 80}
        />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-28 w-full rounded-xl" delay={60} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" delay={120} />
        <Skeleton className="h-64 w-full rounded-xl" delay={160} />
      </div>
      <Skeleton className="h-12 w-full max-w-xl rounded-lg" delay={200} />
      <Skeleton className="h-44 w-full rounded-xl" delay={240} />
    </div>
  );
}

function RenewalCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = 140 + index * 70;
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-dashed p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Skeleton className="size-14 shrink-0 rounded-xl" delay={delay} />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" delay={delay + 20} />
            <Skeleton className="h-3 w-32" delay={delay + 30} />
            <Skeleton className="h-6 w-24 rounded-full" delay={delay + 40} />
          </div>
        </div>
        <Skeleton className="h-4 w-24" delay={delay + 25} />
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-10 w-24" delay={delay + 50} />
          <Skeleton className="h-10 w-24" delay={delay + 60} />
        </div>
        <Skeleton className="h-11 w-32 rounded-lg" delay={delay + 70} />
      </div>
    </div>
  );
}

function ListSkeleton({
  rows,
  rowType = "default",
}: {
  rows: number;
  rowType?: "default" | "claim" | "renewal";
}) {
  const Row =
    rowType === "claim"
      ? ClaimRowSkeleton
      : rowType === "renewal"
        ? RenewalCardSkeleton
        : ListRowSkeleton;

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} index={i} />
      ))}
    </div>
  );
}

function ScreenLoading({
  variant = "page",
  rows = 4,
  statCount = 4,
  showHeader = true,
  showStats,
  label = "Loading",
  className,
  ...props
}: ScreenLoadingProps) {
  const contentRows = Math.min(6, Math.max(2, rows));
  const includeStats =
    showStats ?? (variant === "page" || variant === "summary");

  if (variant === "full") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn(
          "flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FFF7ED] px-4 animate-in fade-in duration-300",
          className,
        )}
        {...props}
      >
        <LoadingLabel label={label} />
        <div className="flex flex-col items-center gap-3">
          <Spinner size="xl" variant="amber" className="size-14" />
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" delay={80} />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "flex w-full flex-col gap-8 animate-in fade-in duration-300",
        className,
      )}
      {...props}
    >
      <LoadingLabel label={label} />

      {showHeader && <HeaderSkeleton />}

      {variant === "cards-row" && (
        <>
          <CardsRowSkeleton count={Math.min(4, contentRows)} />
          <ListSkeleton rows={2} />
        </>
      )}

      {variant === "detail" && <DetailSkeleton />}

      {variant === "summary" && (
        <>
          {includeStats && <StatsSkeleton count={statCount} />}
          <ListSkeleton rows={contentRows} rowType="renewal" />
        </>
      )}

      {variant === "list" && <ListSkeleton rows={contentRows} />}

      {variant === "page" && (
        <>
          {includeStats && <StatsSkeleton count={statCount} />}
          <ListSkeleton rows={contentRows} rowType="claim" />
        </>
      )}
    </div>
  );
}

export { ScreenLoading };
