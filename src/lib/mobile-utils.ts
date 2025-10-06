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

