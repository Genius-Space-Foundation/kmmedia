/**
 * Accessibility utilities and helpers for the KM Media Training Institute LMS
 * Provides functions and constants for WCAG 2.1 AA compliance
 */

import { useEffect, useRef, useCallback, useState } from "react";

// ARIA live region types
export type AriaLiveType = "polite" | "assertive" | "off";

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Trap focus within a container element
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.restoreFocus();
      }
    };

    container.addEventListener("keydown", handleTabKey);
    container.addEventListener("keydown", handleEscapeKey);

    // Focus the first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleTabKey);
      container.removeEventListener("keydown", handleEscapeKey);
    };
  }

  /**
   * Save current focus and set new focus
   */
  static saveFocus(newFocusElement?: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    if (newFocusElement) {
      newFocusElement.focus();
    }
  }

  /**
   * Restore previously saved focus
   */
  static restoreFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    return Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(document.body);
    return focusableElements.includes(element);
  }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  /**
   * Initialize the live region for screen reader announcements
   */
  static init() {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.setAttribute("aria-relevant", "text");
    this.liveRegion.className = "sr-only";
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: AriaLiveType = "polite") {
    if (!this.liveRegion) {
      this.init();
    }

    if (this.liveRegion) {
      this.liveRegion.setAttribute("aria-live", priority);
      this.liveRegion.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = "";
        }
      }, 1000);
    }
  }
}

// Keyboard navigation utilities
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case "ArrowUp":
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  },
};

// ARIA utilities
export const AriaUtils = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId: (prefix: string = "aria"): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute("aria-expanded", expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute("aria-selected", selected.toString());
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute("aria-pressed", pressed.toString());
  },

  /**
   * Set ARIA hidden state
   */
  setHidden: (element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");
    }
  },
};

// React hooks for accessibility
export function useAnnouncer() {
  useEffect(() => {
    ScreenReaderAnnouncer.init();
  }, []);

  return useCallback((message: string, priority: AriaLiveType = "polite") => {
    ScreenReaderAnnouncer.announce(message, priority);
  }, []);
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = FocusManager.trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  initialIndex: number = 0
) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      KeyboardNavigation.handleArrowNavigation(
        event,
        items,
        currentIndex,
        setCurrentIndex
      );
    },
    [items, currentIndex]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

// Color contrast utilities
export const ColorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (
    color1: [number, number, number],
    color2: [number, number, number]
  ): number => {
    const lum1 = ColorContrast.getLuminance(...color1);
    const lum2 = ColorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  meetsWCAGAA: (
    contrastRatio: number,
    isLargeText: boolean = false
  ): boolean => {
    return contrastRatio >= (isLargeText ? 3 : 4.5);
  },
};

// Touch and mobile accessibility
export const TouchAccessibility = {
  /**
   * Minimum touch target size (44px as per WCAG)
   */
  MIN_TOUCH_SIZE: 44,

  /**
   * Check if element meets minimum touch target size
   */
  meetsTouchTargetSize: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width >= TouchAccessibility.MIN_TOUCH_SIZE &&
      rect.height >= TouchAccessibility.MIN_TOUCH_SIZE
    );
  },

  /**
   * Add touch-friendly spacing to elements
   */
  addTouchSpacing: (element: HTMLElement) => {
    const currentPadding = parseInt(getComputedStyle(element).padding) || 0;
    const minPadding =
      (TouchAccessibility.MIN_TOUCH_SIZE - element.offsetHeight) / 2;

    if (minPadding > currentPadding) {
      element.style.padding = `${minPadding}px`;
    }
  },
};

// Form accessibility utilities
export const FormAccessibility = {
  /**
   * Associate label with form control
   */
  associateLabel: (
    labelElement: HTMLLabelElement,
    controlElement: HTMLElement
  ) => {
    const id = controlElement.id || AriaUtils.generateId("form-control");
    controlElement.id = id;
    labelElement.setAttribute("for", id);
  },

  /**
   * Add error message to form control
   */
  addErrorMessage: (controlElement: HTMLElement, errorElement: HTMLElement) => {
    const errorId = errorElement.id || AriaUtils.generateId("error");
    errorElement.id = errorId;

    const describedBy = controlElement.getAttribute("aria-describedby");
    const newDescribedBy = describedBy ? `${describedBy} ${errorId}` : errorId;

    controlElement.setAttribute("aria-describedby", newDescribedBy);
    controlElement.setAttribute("aria-invalid", "true");
  },

  /**
   * Remove error message from form control
   */
  removeErrorMessage: (controlElement: HTMLElement, errorId: string) => {
    const describedBy = controlElement.getAttribute("aria-describedby");
    if (describedBy) {
      const newDescribedBy = describedBy.replace(errorId, "").trim();
      if (newDescribedBy) {
        controlElement.setAttribute("aria-describedby", newDescribedBy);
      } else {
        controlElement.removeAttribute("aria-describedby");
      }
    }
    controlElement.setAttribute("aria-invalid", "false");
  },
};

// Initialize accessibility features
export function initializeAccessibility() {
  ScreenReaderAnnouncer.init();

  // Add skip link if not present
  if (!document.querySelector("[data-skip-link]")) {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded";
    skipLink.setAttribute("data-skip-link", "true");
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

// Export default accessibility configuration
export const accessibilityConfig = {
  announcePageChanges: true,
  trapFocusInModals: true,
  enforceMinimumTouchTargets: true,
  enableKeyboardNavigation: true,
  respectReducedMotion: true,
};
