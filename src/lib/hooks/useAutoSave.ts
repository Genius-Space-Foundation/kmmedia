"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

export interface AutoSaveOptions {
  courseId: string;
  currentStep: number;
  formData: Record<string, any>;
  enabled?: boolean;
  debounceMs?: number;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
}

export interface AutoSaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
  error?: string;
}

export function useAutoSave({
  courseId,
  currentStep,
  formData,
  enabled = true,
  debounceMs = 2000,
  onSaveSuccess,
  onSaveError,
}: AutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>({
    status: "idle",
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Use refs for callbacks to avoid dependency changes
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
    onSaveErrorRef.current = onSaveError;
  }, [onSaveSuccess, onSaveError]);

  // Debounce the form data to avoid excessive API calls
  const debouncedFormData = useDebounce(formData, debounceMs);
  const debouncedStep = useDebounce(currentStep, debounceMs);

  // Save draft function
  const saveDraft = useCallback(
    async (data: Record<string, any>, step: number) => {
      if (!enabled || !courseId) return;

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Check if data has actually changed
      const currentDataString = JSON.stringify({ data, step });
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      setSaveStatus({ status: "saving" });

      try {
        const response = await makeAuthenticatedRequest("/api/applications/drafts", {
          method: "POST",
          body: JSON.stringify({
            courseId,
            currentStep: step,
            formData: data,
          }),
          signal: abortControllerRef.current.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to save draft");
        }

        // Update last saved data reference
        lastSavedDataRef.current = currentDataString;

        setSaveStatus({
          status: "saved",
          lastSaved: new Date(),
        });

        if (onSaveSuccessRef.current) {
          onSaveSuccessRef.current(result.data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, don't update status
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Failed to save draft";
        setSaveStatus({
          status: "error",
          error: errorMessage,
        });

        if (onSaveErrorRef.current) {
          onSaveErrorRef.current(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    },
    [courseId, enabled]
  );

  // Load existing draft on mount
  const loadDraft = useCallback(async () => {
    if (!courseId) return null;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/applications/drafts?courseId=${courseId}`
      );
      const result = await response.json();

      if (response.ok && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, [courseId]);

  // Delete draft function
  const deleteDraft = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/applications/drafts?courseId=${courseId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      setSaveStatus({ status: "idle" });
      lastSavedDataRef.current = "";
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  }, [courseId]);

  // Auto-save effect
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    if (enabled && Object.keys(debouncedFormData).length > 0) {
      saveDraft(debouncedFormData, debouncedStep);
    }
  }, [debouncedFormData, debouncedStep, enabled, isInitialized, saveDraft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Manual save function
  const saveNow = useCallback(() => {
    if (enabled && Object.keys(formData).length > 0) {
      saveDraft(formData, currentStep);
    }
  }, [formData, currentStep, enabled, saveDraft]);

  return {
    saveStatus,
    loadDraft,
    deleteDraft,
    saveNow,
  };
}
