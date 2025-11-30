"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const defaultColors = {
  bg: "bg-gray-200",
  fill: "bg-brand-primary",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  color,
  size = "md",
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const roundedPercentage = Math.round(percentage);

  // Determine color based on percentage if no custom color provided
  const getProgressColor = () => {
    if (color) return color;

    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const progressColor = getProgressColor();

  return (
    <div className={cn("w-full", className)}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          defaultColors.bg,
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            progressColor,
            animated && "animate-in slide-in-from-left"
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}
