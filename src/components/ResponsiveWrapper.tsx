"use client";
import { useState, useEffect } from "react";
import { getDeviceType, getScreenSize, isMobile } from "@/lib/mobile-utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  fallbackToMobile?: boolean;
}

export default function ResponsiveWrapper({
  children,
  mobileComponent: MobileComponent,
  fallbackToMobile = true,
}: ResponsiveWrapperProps) {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [screenSize, setScreenSize] = useState<
    "xs" | "sm" | "md" | "lg" | "xl"
  >("lg");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDeviceType(getDeviceType());
    setScreenSize(getScreenSize());

    const handleResize = () => {
      setDeviceType(getDeviceType());
      setScreenSize(getScreenSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Don't render anything on server side to avoid hydration mismatch
  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 animate-pulse" />;
  }

  // Use mobile component if provided and device is mobile/tablet
  if (MobileComponent && (deviceType === "mobile" || deviceType === "tablet")) {
    return <MobileComponent />;
  }

  // Fallback to mobile view for small screens if no mobile component provided
  if (
    fallbackToMobile &&
    (screenSize === "xs" || screenSize === "sm") &&
    !MobileComponent
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
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
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Open Mobile Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render desktop component
  return <>{children}</>;
}

