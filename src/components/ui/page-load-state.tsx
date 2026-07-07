"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ScreenLoading,
  type ScreenLoadingProps,
} from "@/components/ui/screen-loading";
import { cn } from "@/lib/utils";

export type PageLoadStateProps = {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  empty?: boolean;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
} & Pick<
  ScreenLoadingProps,
  "variant" | "label" | "showHeader" | "rows" | "statCount" | "showStats"
>;

export function PageLoadError({
  error,
  onRetry,
  retryLabel = "Retry",
  className,
}: {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className,
      )}
    >
      <Alert variant="error" className="max-w-lg text-left">
        <CircleAlert className="size-4" />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function PageLoadState({
  loading,
  error,
  onRetry,
  retryLabel,
  empty = false,
  emptyState,
  errorState,
  className,
  children,
  variant = "page",
  label = "Loading",
  showHeader = false,
  rows,
  statCount,
  showStats,
}: PageLoadStateProps) {
  if (loading) {
    return (
      <ScreenLoading
        variant={variant}
        label={label}
        showHeader={showHeader}
        rows={rows}
        statCount={statCount}
        showStats={showStats}
        className={cn("py-2", className)}
      />
    );
  }

  if (error) {
    return (
      errorState ?? (
        <PageLoadError
          error={error}
          onRetry={onRetry}
          retryLabel={retryLabel}
          className={className}
        />
      )
    );
  }

  if (empty && emptyState) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}
