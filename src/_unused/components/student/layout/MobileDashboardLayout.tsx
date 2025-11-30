"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MobileCollapsibleNav from "../navigation/MobileCollapsibleNav";
import {
  optimizeForMobile,
  handleMobileKeyboard,
  isBreakpointDown,
  getSafeAreaInsets,
} from "@/lib/mobile-utils";

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
  notificationCount?: number;
  onLogout?: () => void;
  showNav?: boolean;
}

export default function MobileDashboardLayout({
  children,
  user,
  notificationCount = 0,
  onLogout,
  showNav = true,
}: MobileDashboardLayoutProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const pathname = usePathname();

  useEffect(() => {
    // Initialize mobile optimizations
    const cleanupOptimize = optimizeForMobile();
    const cleanupKeyboard = handleMobileKeyboard();

    // Check if mobile view
    const checkMobileView = () => {
      setIsMobileView(isBreakpointDown("md"));
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    // Get safe area insets for devices with notches
    setSafeAreaInsets(getSafeAreaInsets());

    return () => {
      cleanupOptimize();
      cleanupKeyboard();
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  // Apply safe area padding for mobile devices
  const containerStyle = isMobileView
    ? {
        paddingTop: `max(1rem, ${safeAreaInsets.top}px)`,
        paddingBottom: `max(1rem, ${safeAreaInsets.bottom}px)`,
        paddingLeft: `max(1rem, ${safeAreaInsets.left}px)`,
        paddingRight: `max(1rem, ${safeAreaInsets.right}px)`,
      }
    : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      {showNav && isMobileView && (
        <MobileCollapsibleNav
          user={user}
          notificationCount={notificationCount}
          onLogout={onLogout}
        />
      )}

      {/* Main Content */}
      <main
        className={`${isMobileView ? "pt-16" : "container mx-auto"} px-4 pb-6`}
        style={containerStyle}
      >
        {children}
      </main>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        /* Prevent pull-to-refresh on mobile */
        body {
          overscroll-behavior-y: contain;
        }

        /* Smooth scrolling for mobile */
        html {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Hide scrollbar on mobile for cleaner look */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
        }

        /* Optimize text rendering on mobile */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Prevent text size adjustment on orientation change */
        html {
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        /* Improve tap highlight */
        * {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
        }

        /* Disable callout on long press */
        * {
          -webkit-touch-callout: none;
        }

        /* Allow text selection for inputs */
        input,
        textarea,
        [contenteditable] {
          -webkit-touch-callout: default;
          -webkit-user-select: text;
          user-select: text;
        }

        /* Optimize animations for mobile */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Handle keyboard open state */
        .keyboard-open {
          height: calc(100vh - var(--keyboard-height, 0px));
        }

        /* Safe area support */
        @supports (padding: max(0px)) {
          .safe-area-inset-top {
            padding-top: max(1rem, env(safe-area-inset-top));
          }

          .safe-area-inset-bottom {
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }

          .safe-area-inset-left {
            padding-left: max(1rem, env(safe-area-inset-left));
          }

          .safe-area-inset-right {
            padding-right: max(1rem, env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
}
