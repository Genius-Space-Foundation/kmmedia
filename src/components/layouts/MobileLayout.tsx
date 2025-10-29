/**
 * Mobile-Optimized Layout Component
 * Provides responsive layout with mobile-first design patterns
 */

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  getCurrentBreakpoint,
  isTouchDevice,
  isLandscape,
  hasSafeAreaInsets,
} from "@/lib/mobile-utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  collapsibleSidebar?: boolean;
}

export default function MobileLayout({
  children,
  header,
  footer,
  sidebar,
  className = "",
  enableSafeArea = true,
  stickyHeader = true,
  stickyFooter = false,
  collapsibleSidebar = true,
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [breakpoint, setBreakpoint] = useState("lg");
  const [isTouch, setIsTouch] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [hasSafeArea, setHasSafeArea] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setBreakpoint(getCurrentBreakpoint());
      setIsTouch(isTouchDevice());
      setOrientation(isLandscape() ? "landscape" : "portrait");
      setHasSafeArea(hasSafeAreaInsets());
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, []);

  const isMobile = ["xs", "sm"].includes(breakpoint);
  const isTablet = breakpoint === "md";
  const isDesktop = ["lg", "xl", "2xl"].includes(breakpoint);

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50 flex flex-col",
        enableSafeArea && hasSafeArea && "safe-area-all",
        isTouch && "touch-device",
        `breakpoint-${breakpoint}`,
        `orientation-${orientation}`,
        className
      )}
    >
      {/* Header */}
      {header && (
        <header
          className={cn(
            "bg-white border-b border-gray-200 z-40",
            stickyHeader && "sticky top-0",
            enableSafeArea && hasSafeArea && "safe-area-top"
          )}
        >
          <div className="px-responsive">{header}</div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile Sidebar Backdrop */}
            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                onClick={handleBackdropClick}
                aria-hidden="true"
              />
            )}

            {/* Sidebar */}
            <aside
              className={cn(
                "bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
                // Mobile: slide-in sidebar
                isMobile && [
                  "fixed top-0 left-0 h-full w-80 max-w-[85vw] transform",
                  sidebarOpen ? "translate-x-0" : "-translate-x-full",
                  enableSafeArea && hasSafeArea && "safe-area-all",
                ],
                // Tablet: collapsible sidebar
                isTablet && [
                  collapsibleSidebar && sidebarOpen ? "w-64" : "w-16",
                  "transition-all duration-300",
                ],
                // Desktop: always visible sidebar
                isDesktop && "w-64 flex-shrink-0"
              )}
            >
              <div className="h-full overflow-y-auto scrollbar-hide">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            // Add padding for mobile when sidebar is present
            sidebar && isMobile && "w-full",
            // Adjust for tablet sidebar
            sidebar && isTablet && collapsibleSidebar && !sidebarOpen && "ml-0"
          )}
        >
          <div className="px-responsive py-4 md:py-6 lg:py-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer
          className={cn(
            "bg-white border-t border-gray-200 mt-auto",
            stickyFooter && "sticky bottom-0",
            enableSafeArea && hasSafeArea && "safe-area-bottom"
          )}
        >
          <div className="px-responsive">{footer}</div>
        </footer>
      )}

      {/* Mobile Sidebar Toggle Button */}
      {sidebar && isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200",
            "min-h-[44px] min-w-[44px] flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
            "transition-transform duration-200 active:scale-95"
          )}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {/* Responsive Styles */}
      <style jsx>{`
        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .px-responsive {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          .px-responsive {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .px-responsive {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }

        /* Landscape mobile optimizations */
        @media screen and (orientation: landscape) and (max-height: 500px) {
          .py-4 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          .py-6 {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }

          .py-8 {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
          }
        }

        /* Touch device optimizations */
        .touch-device {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        /* Smooth scrolling for mobile */
        @media (max-width: 768px) {
          main {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          aside,
          header,
          footer {
            border-width: 2px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          aside {
            transition: none !important;
          }

          button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Mobile-specific layout variants
export const MobilePageLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  backButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}> = ({ children, title, backButton, onBack, actions, className }) => {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
          <div className="flex items-center space-x-3">
            {backButton && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 safe-area-bottom">{children}</main>
    </div>
  );
};
