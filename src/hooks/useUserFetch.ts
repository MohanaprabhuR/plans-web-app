"use client";

import { useCallback, type DependencyList } from "react";
import useAuth from "@/hooks/useAuth";
import {
  useAsyncData,
  type UseAsyncDataOptions,
  type UseAsyncDataResult,
} from "@/hooks/useAsyncData";
import { fetchJsonWithUser } from "@/lib/fetch-with-user";

export function useUserFetch<T>(
  url: string,
  deps: DependencyList = [],
  options: UseAsyncDataOptions<T> = {},
): UseAsyncDataResult<T> & { userId: string } {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";
  const enabled = (options.enabled ?? true) && !authLoading && Boolean(userId);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchJsonWithUser<T>(url, userId, { signal }),
    [url, userId],
  );

  const result = useAsyncData(fetcher, [userId, url, ...deps], {
    ...options,
    enabled,
  });

  return {
    ...result,
    userId,
    loading: authLoading || result.loading,
  };
}
