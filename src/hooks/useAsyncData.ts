"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";
import { getErrorMessage } from "@/lib/fetch-with-user";

export type UseAsyncDataOptions<T> = {
  enabled?: boolean;
  initialData?: T | null;
  errorFallback?: string;
  onError?: (message: string) => void;
  onSuccess?: (data: T) => void;
};

export type UseAsyncDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  options: UseAsyncDataOptions<T> = {},
): UseAsyncDataResult<T> {
  const {
    enabled = true,
    initialData = null,
    errorFallback = "Failed to load data.",
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  fetcherRef.current = fetcher;
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current(controller.signal);
      if (controller.signal.aborted) return;
      setData(result);
      onSuccessRef.current?.(result);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = getErrorMessage(err, errorFallback);
      setError(message);
      onErrorRef.current?.(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, errorFallback]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal);
        if (cancelled) return;
        setData(result);
        onSuccessRef.current?.(result);
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err, errorFallback);
        setError(message);
        onErrorRef.current?.(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via deps
  }, [enabled, errorFallback, ...deps]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    setError,
  };
}
