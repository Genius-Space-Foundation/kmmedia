"use client";

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false;

  return /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
};

export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (typeof window === "undefined") return "desktop";

  if (isMobile()) return "mobile";
  if (isTablet()) return "tablet";
  return "desktop";
};

export const getScreenSize = (): "xs" | "sm" | "md" | "lg" | "xl" => {
  if (typeof window === "undefined") return "lg";

  const width = window.innerWidth;

  if (width < 640) return "xs";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  return "xl";
};

export const isOnline = (): boolean => {
  if (typeof window === "undefined") return true;

  return navigator.onLine;
};

export const supportsPWA = (): boolean => {
  if (typeof window === "undefined") return false;

  return "serviceWorker" in navigator && "PushManager" in window;
};

export const canInstallPWA = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    supportsPWA() &&
    !window.matchMedia("(display-mode: standalone)").matches &&
    !window.navigator.standalone
  );
};

// Enhanced responsive design utilities
export const getViewportWidth = (): number => {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
};

export const getViewportHeight = (): number => {
  if (typeof window === "undefined") return 768;
  return window.innerHeight;
};

export const isLandscape = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.innerWidth > window.innerHeight;
};

export const isPortrait = (): boolean => {
  return !isLandscape();
};

export const getDevicePixelRatio = (): number => {
  if (typeof window === "undefined") return 1;
  return window.devicePixelRatio || 1;
};

export const isHighDPI = (): boolean => {
  return getDevicePixelRatio() > 1;
};

// Touch-friendly sizing utilities
export const TOUCH_TARGET_SIZE = {
  MIN: 44, // Minimum touch target size in pixels (WCAG AA)
  RECOMMENDED: 48, // Recommended touch target size
  COMFORTABLE: 56, // Comfortable touch target size
} as const;

export const getTouchTargetSize = (
  size: "min" | "recommended" | "comfortable" = "recommended"
): number => {
  return TOUCH_TARGET_SIZE[
    size.toUpperCase() as keyof typeof TOUCH_TARGET_SIZE
  ];
};

export const isTouchTargetSizeValid = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = getTouchTargetSize("min");
  return rect.width >= minSize && rect.height >= minSize;
};

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS => {
  const width = getViewportWidth();

  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

export const isBreakpointUp = (
  breakpoint: keyof typeof BREAKPOINTS
): boolean => {
  return getViewportWidth() >= BREAKPOINTS[breakpoint];
};

export const isBreakpointDown = (
  breakpoint: keyof typeof BREAKPOINTS
): boolean => {
  return getViewportWidth() < BREAKPOINTS[breakpoint];
};

export const isBreakpointBetween = (
  min: keyof typeof BREAKPOINTS,
  max: keyof typeof BREAKPOINTS
): boolean => {
  const width = getViewportWidth();
  return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max];
};

// Mobile-specific interaction utilities
export const addTouchRipple = (
  element: HTMLElement,
  color: string = "rgba(255, 255, 255, 0.3)"
): void => {
  if (!isTouchDevice()) return;

  element.style.position = "relative";
  element.style.overflow = "hidden";

  const handleTouch = (e: TouchEvent) => {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    const x = e.touches[0].clientX - rect.left - size / 2;
    const y = e.touches[0].clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${color};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  element.addEventListener("touchstart", handleTouch);
};

// Safe area utilities for devices with notches
export const getSafeAreaInsets = () => {
  if (typeof window === "undefined")
    return { top: 0, right: 0, bottom: 0, left: 0 };

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("--sat") || "0", 10),
    right: parseInt(style.getPropertyValue("--sar") || "0", 10),
    bottom: parseInt(style.getPropertyValue("--sab") || "0", 10),
    left: parseInt(style.getPropertyValue("--sal") || "0", 10),
  };
};

export const hasSafeAreaInsets = (): boolean => {
  const insets = getSafeAreaInsets();
  return (
    insets.top > 0 || insets.right > 0 || insets.bottom > 0 || insets.left > 0
  );
};

// Responsive font size utilities
export const getResponsiveFontSize = (baseSize: number): number => {
  const breakpoint = getCurrentBreakpoint();
  const scaleFactor = {
    xs: 0.875, // 14px if base is 16px
    sm: 0.9375, // 15px if base is 16px
    md: 1, // 16px (base)
    lg: 1.0625, // 17px if base is 16px
    xl: 1.125, // 18px if base is 16px
    "2xl": 1.25, // 20px if base is 16px
  }[breakpoint];

  return Math.round(baseSize * scaleFactor);
};

// Responsive spacing utilities
export const getResponsiveSpacing = (baseSpacing: number): number => {
  const breakpoint = getCurrentBreakpoint();
  const scaleFactor = {
    xs: 0.75, // Smaller spacing on mobile
    sm: 0.875, // Slightly smaller on small tablets
    md: 1, // Base spacing
    lg: 1.125, // Slightly larger on desktop
    xl: 1.25, // Larger on large screens
    "2xl": 1.5, // Much larger on very large screens
  }[breakpoint];

  return Math.round(baseSpacing * scaleFactor);
};

// Mobile-specific dashboard utilities
export const getMobileDashboardLayout = () => {
  const breakpoint = getCurrentBreakpoint();
  const isCompact =
    breakpoint === "xs" || (breakpoint === "sm" && window.innerHeight < 700);

  return {
    isCompact,
    cardPadding: isCompact ? "p-3" : "p-4",
    headerSize: isCompact ? "text-lg" : "text-xl",
    iconSize: isCompact ? "w-4 h-4" : "w-5 h-5",
    gridCols: isCompact ? 2 : 4,
    showLabels: !isCompact,
    maxItems: isCompact ? 4 : 8,
  };
};

// Swipe gesture utilities
export const SWIPE_THRESHOLDS = {
  MIN_DISTANCE: 50, // Minimum swipe distance in pixels
  MAX_TIME: 300, // Maximum time for a swipe in milliseconds
  MIN_VELOCITY: 0.3, // Minimum velocity for swipe detection
} as const;

export const detectSwipeDirection = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startTime: number,
  endTime: number
): "left" | "right" | "up" | "down" | null => {
  const deltaX = startX - endX;
  const deltaY = startY - endY;
  const deltaTime = endTime - startTime;

  // Check if swipe meets minimum requirements
  if (deltaTime > SWIPE_THRESHOLDS.MAX_TIME) return null;

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  if (distance < SWIPE_THRESHOLDS.MIN_DISTANCE) return null;

  const velocity = distance / deltaTime;
  if (velocity < SWIPE_THRESHOLDS.MIN_VELOCITY) return null;

  // Determine primary direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "left" : "right";
  } else {
    return deltaY > 0 ? "up" : "down";
  }
};

// Mobile notification utilities
export const getMobileNotificationSettings = () => {
  const breakpoint = getCurrentBreakpoint();
  const isMobileDevice = isMobile();

  return {
    showCompactView: breakpoint === "xs",
    enableSwipeToDelete: isMobileDevice,
    maxVisibleNotifications: breakpoint === "xs" ? 5 : 10,
    showFullContent: breakpoint !== "xs",
    enableHapticFeedback: isMobileDevice && "vibrate" in navigator,
  };
};

// Haptic feedback utility
export const triggerHapticFeedback = (
  type: "light" | "medium" | "heavy" = "light"
) => {
  if (!isTouchDevice() || !("vibrate" in navigator)) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
  };

  navigator.vibrate(patterns[type]);
};

// Mobile dashboard widget utilities
export const getOptimalWidgetSize = () => {
  const breakpoint = getCurrentBreakpoint();
  const viewportWidth = getViewportWidth();

  // Calculate optimal widget size based on screen width
  const padding = 32; // Total horizontal padding
  const gap = 16; // Gap between widgets
  const cols = breakpoint === "xs" ? 2 : breakpoint === "sm" ? 3 : 4;

  const availableWidth = viewportWidth - padding - gap * (cols - 1);
  const widgetWidth = Math.floor(availableWidth / cols);

  return {
    width: widgetWidth,
    height: Math.min(widgetWidth * 0.8, 120), // Maintain aspect ratio with max height
    cols,
    showLabels: widgetWidth > 100,
  };
};

// Mobile-optimized animation utilities
export const getMobileAnimationConfig = () => {
  const isLowPowerMode =
    "connection" in navigator && (navigator as any).connection?.saveData;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return {
    enableAnimations: !isLowPowerMode && !prefersReducedMotion,
    duration: isLowPowerMode ? 150 : 300,
    easing: "ease-out",
    enableParallax: !isLowPowerMode && !prefersReducedMotion,
  };
};

// Mobile keyboard utilities
export const handleMobileKeyboard = () => {
  const initialViewportHeight = window.innerHeight;

  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;

    // Keyboard is likely open if height decreased significantly
    const isKeyboardOpen = heightDifference > 150;

    document.documentElement.style.setProperty(
      "--keyboard-height",
      isKeyboardOpen ? `${heightDifference}px` : "0px"
    );

    document.documentElement.classList.toggle("keyboard-open", isKeyboardOpen);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
};

// Mobile performance utilities
export const optimizeForMobile = () => {
  // Disable hover effects on touch devices
  if (isTouchDevice()) {
    document.documentElement.classList.add("touch-device");
  }

  // Add mobile-specific CSS classes
  document.documentElement.classList.add(
    `breakpoint-${getCurrentBreakpoint()}`
  );

  // Handle orientation changes
  const handleOrientationChange = () => {
    document.documentElement.classList.toggle("landscape", isLandscape());
    document.documentElement.classList.toggle("portrait", isPortrait());
  };

  window.addEventListener("orientationchange", handleOrientationChange);
  window.addEventListener("resize", handleOrientationChange);

  // Initial setup
  handleOrientationChange();

  return () => {
    window.removeEventListener("orientationchange", handleOrientationChange);
    window.removeEventListener("resize", handleOrientationChange);
  };
};
