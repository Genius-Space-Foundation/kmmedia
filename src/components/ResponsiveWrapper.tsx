"use client";
import { useState, useEffect } from "react";
import {
  getDeviceType,
  getScreenSize,
  isMobile,
  getCurrentBreakpoint,
  isTouchDevice,
  isLandscape,
  hasSafeAreaInsets,
  getViewportWidth,
  getViewportHeight,
} from "@/lib/mobile-utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  fallbackToMobile?: boolean;
  enableTouchOptimizations?: boolean;
  enableSafeArea?: boolean;
  className?: string;
}

export default function ResponsiveWrapper({
  children,
  mobileComponent: MobileComponent,
  fallbackToMobile = true,
  enableTouchOptimizations = true,
  enableSafeArea = true,
  className = "",
}: ResponsiveWrapperProps) {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [screenSize, setScreenSize] = useState<
    "xs" | "sm" | "md" | "lg" | "xl"
  >("lg");
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const [isTouch, setIsTouch] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape"
  );
  const [hasSafeArea, setHasSafeArea] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: 1024,
    height: 768,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateDeviceInfo = () => {
      setDeviceType(getDeviceType());
      setScreenSize(getScreenSize());
      setBreakpoint(getCurrentBreakpoint());
      setIsTouch(isTouchDevice());
      setOrientation(isLandscape() ? "landscape" : "portrait");
      setHasSafeArea(hasSafeAreaInsets());
      setViewportSize({
        width: getViewportWidth(),
        height: getViewportHeight(),
      });
    };

    updateDeviceInfo();

    const handleResize = () => {
      updateDeviceInfo();
    };

    const handleOrientationChange = () => {
      // Delay to ensure viewport dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Don't render anything on server side to avoid hydration mismatch
  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 animate-pulse" />;
  }

  // Generate CSS custom properties for responsive values
  const cssVariables = {
    "--device-type": deviceType,
    "--screen-size": screenSize,
    "--breakpoint": breakpoint,
    "--viewport-width": `${viewportSize.width}px`,
    "--viewport-height": `${viewportSize.height}px`,
    "--is-touch": isTouch ? "1" : "0",
    "--is-mobile": deviceType === "mobile" ? "1" : "0",
    "--is-tablet": deviceType === "tablet" ? "1" : "0",
    "--is-desktop": deviceType === "desktop" ? "1" : "0",
    "--orientation": orientation,
  } as React.CSSProperties;

  // Dynamic classes based on device characteristics
  const dynamicClasses = [
    `device-${deviceType}`,
    `screen-${screenSize}`,
    `breakpoint-${breakpoint}`,
    `orientation-${orientation}`,
    isTouch && "touch-device",
    !isTouch && "no-touch",
    hasSafeArea && enableSafeArea && "has-safe-area",
    enableTouchOptimizations && isTouch && "touch-optimized",
    viewportSize.width < 768 && "compact-width",
    viewportSize.height < 600 && "compact-height",
  ]
    .filter(Boolean)
    .join(" ");

  // Use mobile component if provided and device is mobile/tablet
  if (MobileComponent && (deviceType === "mobile" || deviceType === "tablet")) {
    return (
      <div
        className={`responsive-wrapper ${dynamicClasses} ${className}`}
        style={cssVariables}
        data-device={deviceType}
        data-screen={screenSize}
        data-breakpoint={breakpoint}
        data-touch={isTouch}
        data-orientation={orientation}
      >
        <MobileComponent />
      </div>
    );
  }

  // Fallback to mobile view for small screens if no mobile component provided
  if (
    fallbackToMobile &&
    (screenSize === "xs" || screenSize === "sm") &&
    !MobileComponent
  ) {
    return (
      <div
        className={`responsive-wrapper ${dynamicClasses} ${className} min-h-screen bg-gray-50 p-4`}
        style={cssVariables}
        data-device={deviceType}
        data-screen={screenSize}
        data-breakpoint={breakpoint}
        data-touch={isTouch}
        data-orientation={orientation}
      >
        <div className="max-w-md mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Mobile View
            </h1>
            <p className="text-gray-600 mb-4">
              For the best experience on mobile devices, please use our
              mobile-optimized interface.
            </p>
            <a
              href="/dashboards/instructor/mobile"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Open Mobile Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render desktop component with responsive wrapper
  return (
    <div
      className={`responsive-wrapper ${dynamicClasses} ${className}`}
      style={cssVariables}
      data-device={deviceType}
      data-screen={screenSize}
      data-breakpoint={breakpoint}
      data-touch={isTouch}
      data-orientation={orientation}
    >
      {children}

      {/* Enhanced responsive styles */}
      <style jsx>{`
        .responsive-wrapper {
          /* Touch optimizations */
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        .responsive-wrapper.touch-optimized {
          /* Larger touch targets on touch devices */
          --min-touch-size: 44px;
          --recommended-touch-size: 48px;
          --comfortable-touch-size: 56px;
        }

        .responsive-wrapper.touch-optimized button,
        .responsive-wrapper.touch-optimized a,
        .responsive-wrapper.touch-optimized input,
        .responsive-wrapper.touch-optimized select {
          min-height: var(--min-touch-size);
          min-width: var(--min-touch-size);
        }

        /* Safe area support */
        .responsive-wrapper.has-safe-area {
          padding-top: env(safe-area-inset-top);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
        }

        /* Mobile-specific optimizations */
        .responsive-wrapper.device-mobile {
          /* Prevent zoom on input focus */
          font-size: 16px;
        }

        .responsive-wrapper.device-mobile input,
        .responsive-wrapper.device-mobile select,
        .responsive-wrapper.device-mobile textarea {
          font-size: 16px; /* Prevents zoom on iOS */
        }

        /* Compact layouts */
        .responsive-wrapper.compact-width {
          --container-padding: 1rem;
          --grid-gap: 0.75rem;
        }

        .responsive-wrapper.compact-height {
          --vertical-spacing: 0.75rem;
        }

        /* Orientation-specific styles */
        .responsive-wrapper.orientation-landscape.device-mobile {
          /* Optimize for landscape mobile */
          --header-height: 3rem;
          --content-padding: 0.5rem;
        }

        .responsive-wrapper.orientation-portrait.device-mobile {
          /* Optimize for portrait mobile */
          --header-height: 4rem;
          --content-padding: 1rem;
        }

        /* High DPI optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .responsive-wrapper {
            /* Sharper borders on high DPI displays */
            --border-width: 0.5px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .responsive-wrapper * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          .responsive-wrapper {
            --border-contrast: 2px;
            --text-contrast: high;
          }
        }
      `}</style>
    </div>
  );
}
