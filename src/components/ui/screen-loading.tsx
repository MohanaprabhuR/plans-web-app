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
  | "detail"
  | "form"
  | "chat"
  | "profile";

export type ScreenLoadingRowType = "default" | "claim" | "renewal" | "notification";

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
  /** Row layout for list/summary variants */
  rowType?: ScreenLoadingRowType;
  /** Screen reader label */
  label?: string;
}

function LoadingLabel({ label }: { label: string }) {
  return <span className="sr-only">{label}</span>;
}

function HeaderSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-9 w-52 max-w-full rounded-lg sm:h-10" delay={delay} />
      <Skeleton
        className="h-10 w-32 rounded-lg max-sm:max-w-35"
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
          className="h-22 w-full rounded-xl sm:h-23"
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

function NotificationRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = 100 + index * 60;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
      <Skeleton className="mt-0.5 size-10 shrink-0 rounded-full" delay={delay} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3 max-w-xs" delay={delay + 20} />
        <Skeleton className="h-3 w-full max-w-md" delay={delay + 35} />
        <Skeleton className="h-3 w-24" delay={delay + 50} />
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
          className="h-70 min-w-75 shrink-0 rounded-xl sm:min-w-88.5"
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

function FormSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" delay={40} />
        <Skeleton className="h-2 flex-1 rounded-full" delay={60} />
        <Skeleton className="size-9 rounded-full" delay={80} />
      </div>
      <Skeleton className="size-12 rounded-full" delay={100} />
      <Skeleton className="h-8 w-4/5 max-w-sm rounded-lg" delay={140} />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={`opt-${i}`}
            className="h-14 w-full rounded-2xl"
            delay={180 + i * 70}
          />
        ))}
      </div>
      <Skeleton className="mt-4 h-12 w-full rounded-xl" delay={480} />
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-40 w-full rounded-2xl border border-dashed" delay={60} />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-3/4 max-w-md rounded-2xl rounded-bl-md" delay={120} />
        <Skeleton className="ml-auto h-20 w-2/3 max-w-sm rounded-2xl rounded-br-md" delay={180} />
        <Skeleton className="h-14 w-1/2 max-w-xs rounded-2xl rounded-bl-md" delay={240} />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" delay={300} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="size-24 rounded-full" delay={40} />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-7 w-48 rounded-lg" delay={80} />
          <Skeleton className="h-4 w-64 max-w-full" delay={110} />
          <Skeleton className="h-9 w-32 rounded-lg" delay={140} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`field-${i}`} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" delay={160 + i * 40} />
            <Skeleton className="h-11 w-full rounded-lg" delay={180 + i * 40} />
          </div>
        ))}
      </div>
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
  rowType?: ScreenLoadingRowType;
}) {
  const Row =
    rowType === "claim"
      ? ClaimRowSkeleton
      : rowType === "renewal"
        ? RenewalCardSkeleton
        : rowType === "notification"
          ? NotificationRowSkeleton
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
  rowType,
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
          "flex min-h-app-screen flex-col items-center justify-center gap-6 bg-orange-50 px-4 dark:bg-background motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
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
        "flex w-full flex-col gap-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
        className,
      )}
      {...props}
    >
      <LoadingLabel label={label} />

      {showHeader && variant !== "form" && variant !== "chat" && (
        <HeaderSkeleton />
      )}

      {variant === "cards-row" && (
        <>
          <CardsRowSkeleton count={Math.min(4, contentRows)} />
          <ListSkeleton rows={2} />
        </>
      )}

      {variant === "detail" && <DetailSkeleton />}

      {variant === "form" && <FormSkeleton />}

      {variant === "chat" && <ChatSkeleton />}

      {variant === "profile" && <ProfileSkeleton />}

      {variant === "summary" && (
        <>
          {includeStats && <StatsSkeleton count={statCount} />}
          <ListSkeleton
            rows={contentRows}
            rowType={rowType ?? "renewal"}
          />
        </>
      )}

      {variant === "list" && (
        <ListSkeleton rows={contentRows} rowType={rowType ?? "default"} />
      )}

      {variant === "page" && (
        <>
          {includeStats && <StatsSkeleton count={statCount} />}
          <ListSkeleton rows={contentRows} rowType={rowType ?? "claim"} />
        </>
      )}
    </div>
  );
}

export { ScreenLoading };
