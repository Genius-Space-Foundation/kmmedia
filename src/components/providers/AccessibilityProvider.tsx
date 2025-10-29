/**
 * Accessibility Provider Component
 * Initializes and manages global accessibility features
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  initializeAccessibility,
  accessibilityConfig,
} from "@/lib/accessibility";
import { SkipLink } from "@/components/ui/accessible-form";

interface AccessibilityContextType {
  announcePageChange: (title: string) => void;
  setFocusToMain: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility();

    // Check for user preferences
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    setIsHighContrast(highContrastQuery.matches);
    setIsReducedMotion(reducedMotionQuery.matches);

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    highContrastQuery.addEventListener("change", handleHighContrastChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
    };
  }, []);

  const announcePageChange = (title: string) => {
    // Announce page changes to screen readers
    const announcement = `Page changed to ${title}`;

    // Create or update the live region
    let liveRegion = document.getElementById("page-change-announcer");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "page-change-announcer";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = announcement;

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = "";
      }
    }, 1000);
  };

  const setFocusToMain = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
    }
  };

  const contextValue: AccessibilityContextType = {
    announcePageChange,
    setFocusToMain,
    isHighContrast,
    isReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      {children}

      {/* Global accessibility styles */}
      <style jsx global>{`
        /* Screen reader only utility class */
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }

        /* Focus visible styles */
        .focus-visible:focus {
          outline: 2px solid var(--brand-primary) !important;
          outline-offset: 2px !important;
        }

        /* High contrast mode adjustments */
        @media (prefers-contrast: high) {
          * {
            border-color: ButtonText !important;
          }

          button,
          input,
          select,
          textarea {
            border: 2px solid ButtonText !important;
          }
        }

        /* Reduced motion adjustments */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Focus management for modals */
        body.modal-open {
          overflow: hidden;
        }

        /* Ensure minimum touch target sizes */
        button,
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        a {
          min-height: 44px;
          min-width: 44px;
        }

        /* Improve focus indicators */
        :focus-visible {
          outline: 2px solid var(--brand-primary);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Ensure sufficient color contrast for links */
        a {
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        a:hover {
          text-decoration: none;
        }

        /* Improve form field spacing */
        form > * + * {
          margin-top: 1rem;
        }

        /* Error message styling */
        [role="alert"] {
          border-left: 4px solid #ef4444;
          padding-left: 1rem;
        }

        /* Loading state accessibility */
        [aria-busy="true"] {
          cursor: wait;
        }

        /* Disabled state styling */
        [aria-disabled="true"],
        :disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
}
