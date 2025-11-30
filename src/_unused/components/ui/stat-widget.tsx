"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color: "blue" | "green" | "orange" | "purple" | "red";
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
    hover: "hover:bg-blue-100",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50",
    text: "text-green-600",
    hover: "hover:bg-green-100",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-600",
    hover: "hover:bg-orange-100",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
    hover: "hover:bg-purple-100",
  },
  red: {
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50",
    text: "text-red-600",
    hover: "hover:bg-red-100",
  },
};

export function StatWidget({
  label,
  value,
  icon,
  trend,
  color,
  onClick,
  className,
}: StatWidgetProps) {
  const colors = colorClasses[color];
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm transition-all duration-300 overflow-hidden",
        isClickable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
        !isClickable && "hover:shadow-md",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Background Gradient Glow */}
      <div
        className={cn(
          "absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          colors.gradient
        )}
      />

      <div className="relative z-10">
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br shadow-md group-hover:scale-105 transition-transform duration-300",
              colors.gradient
            )}
          >
            <div className="text-white [&>svg]:w-6 [&>svg]:h-6">{icon}</div>
          </div>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                trend.direction === "up"
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>

        {/* Value */}
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
