/**
 * Custom hooks for keyboard navigation and accessibility
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { FocusManager, ScreenReaderAnnouncer } from "../accessibility";

// Hook for managing focus trap in modals/dialogs
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = FocusManager.trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

// Hook for keyboard navigation in lists/menus
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  initialIndex: number = -1,
  options: {
    loop?: boolean;
    orientation?: "horizontal" | "vertical" | "both";
    onActivate?: (index: number, item: T) => void;
  } = {}
) {
  const { loop = true, orientation = "vertical", onActivate } = options;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (items.length === 0) return;

      let newIndex = currentIndex;
      let handled = false;

      switch (event.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            event.preventDefault();
            newIndex =
              currentIndex < items.length - 1
                ? currentIndex + 1
                : loop
                ? 0
                : currentIndex;
            handled = true;
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            event.preventDefault();
            newIndex =
              currentIndex > 0
                ? currentIndex - 1
                : loop
                ? items.length - 1
                : currentIndex;
            handled = true;
          }
          break;
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            event.preventDefault();
            newIndex =
              currentIndex < items.length - 1
                ? currentIndex + 1
                : loop
                ? 0
                : currentIndex;
            handled = true;
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            event.preventDefault();
            newIndex =
              currentIndex > 0
                ? currentIndex - 1
                : loop
                ? items.length - 1
                : currentIndex;
            handled = true;
          }
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          handled = true;
          break;
        case "End":
          event.preventDefault();
          newIndex = items.length - 1;
          handled = true;
          break;
        case "Enter":
        case " ":
          if (currentIndex >= 0 && currentIndex < items.length && onActivate) {
            event.preventDefault();
            onActivate(currentIndex, items[currentIndex]);
            handled = true;
          }
          break;
      }

      if (handled && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        if (newIndex >= 0 && newIndex < items.length) {
          items[newIndex]?.focus();
        }
      }
    },
    [items, currentIndex, loop, orientation, onActivate]
  );

  const focusItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setCurrentIndex(index);
        items[index]?.focus();
      }
    },
    [items]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
    focusItem,
  };
}

// Hook for managing announcements to screen readers
export function useAnnouncer() {
  useEffect(() => {
    ScreenReaderAnnouncer.init();
  }, []);

  return useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      ScreenReaderAnnouncer.announce(message, priority);
    },
    []
  );
}

// Hook for managing ARIA live regions
export function useAriaLive() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = useCallback(
    (newMessage: string, newPriority: "polite" | "assertive" = "polite") => {
      setMessage(newMessage);
      setPriority(newPriority);

      // Clear message after announcement
      setTimeout(() => setMessage(""), 1000);
    },
    []
  );

  return {
    message,
    priority,
    announce,
  };
}

// Hook for managing focus restoration
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

// Hook for managing escape key handling
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [callback, isActive]);
}

// Hook for managing click outside
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  isActive: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [callback, isActive]);

  return ref;
}

// Hook for managing reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for managing high contrast preference
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersHighContrast;
}
