import { useState, useCallback } from "react";
import { safeJsonParse } from "@/lib/api-utils";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for making API calls with proper error handling
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const makeRequest = useCallback(
    async (
      url: string,
      requestOptions: RequestInit = {},
      fallbackData: T | null = null
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...requestOptions.headers,
          },
          ...requestOptions,
        });

        const data = await safeJsonParse(response, fallbackData);

        setState({
          data,
          loading: false,
          error: null,
        });

        if (options.onSuccess) {
          options.onSuccess(data);
        }

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";

        setState({
          data: fallbackData,
          loading: false,
          error: errorMessage,
        });

        if (options.onError) {
          options.onError(errorMessage);
        }

        throw error;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    makeRequest,
    reset,
  };
}

/**
 * Hook for making authenticated API calls
 */
export function useAuthenticatedApi<T = any>(options: UseApiOptions = {}) {
  const api = useApi<T>(options);

  const makeAuthenticatedRequest = useCallback(
    async (
      url: string,
      requestOptions: RequestInit = {},
      fallbackData: T | null = null
    ) => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      return api.makeRequest(
        url,
        {
          ...requestOptions,
          headers: {
            Authorization: `Bearer ${token}`,
            ...requestOptions.headers,
          },
        },
        fallbackData
      );
    },
    [api]
  );

  return {
    ...api,
    makeAuthenticatedRequest,
  };
}
