"use client";

import { useRef, useCallback, useEffect } from "react";
import { isTouchDevice } from "@/lib/mobile-utils";

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
  className?: string;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export default function SwipeGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventScroll = false,
  className = "",
}: SwipeGestureHandlerProps) {
  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isTouchDevice()) return;

      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      touchEnd.current = null;

      if (preventScroll) {
        e.preventDefault();
      }
    },
    [preventScroll]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isTouchDevice() || !touchStart.current) return;

      const touch = e.touches[0];
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      if (preventScroll) {
        e.preventDefault();
      }
    },
    [preventScroll]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isTouchDevice() || !touchStart.current || !touchEnd.current) return;

      const deltaX = touchStart.current.x - touchEnd.current.x;
      const deltaY = touchStart.current.y - touchEnd.current.y;
      const deltaTime = touchEnd.current.time - touchStart.current.time;

      // Calculate velocity (pixels per millisecond)
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Minimum velocity threshold for swipe detection
      const minVelocity = 0.3;

      // Check if the swipe meets the threshold and velocity requirements
      const isHorizontalSwipe =
        Math.abs(deltaX) > threshold && velocityX > minVelocity;
      const isVerticalSwipe =
        Math.abs(deltaY) > threshold && velocityY > minVelocity;

      // Determine swipe direction (prioritize the axis with greater movement)
      if (isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Swiped left
          onSwipeLeft?.();
        } else {
          // Swiped right
          onSwipeRight?.();
        }
      } else if (isVerticalSwipe && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          // Swiped up
          onSwipeUp?.();
        } else {
          // Swiped down
          onSwipeDown?.();
        }
      }

      // Reset touch positions
      touchStart.current = null;
      touchEnd.current = null;

      if (preventScroll) {
        e.preventDefault();
      }
    },
    [
      threshold,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      preventScroll,
    ]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTouchDevice()) return;

    // Add passive: false to allow preventDefault
    const options = { passive: !preventScroll };

    container.addEventListener("touchstart", handleTouchStart, options);
    container.addEventListener("touchmove", handleTouchMove, options);
    container.addEventListener("touchend", handleTouchEnd, options);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return (
    <div
      ref={containerRef}
      className={`touch-pan-y ${className}`}
      style={{
        touchAction: preventScroll ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {children}
    </div>
  );
}

// Hook for using swipe gestures
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (!isTouchDevice()) return;

      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      touchEnd.current = null;
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (!isTouchDevice() || !touchStart.current) return;

      const touch = e.touches[0];
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },

    onTouchEnd: (e: React.TouchEvent) => {
      if (!isTouchDevice() || !touchStart.current || !touchEnd.current) return;

      const deltaX = touchStart.current.x - touchEnd.current.x;
      const deltaY = touchStart.current.y - touchEnd.current.y;
      const deltaTime = touchEnd.current.time - touchStart.current.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;
      const minVelocity = 0.3;

      const isHorizontalSwipe =
        Math.abs(deltaX) > threshold && velocityX > minVelocity;
      const isVerticalSwipe =
        Math.abs(deltaY) > threshold && velocityY > minVelocity;

      if (isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      } else if (isVerticalSwipe && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }

      touchStart.current = null;
      touchEnd.current = null;
    },
  };

  return handlers;
}
