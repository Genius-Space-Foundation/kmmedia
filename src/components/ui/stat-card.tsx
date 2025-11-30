"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconColor = "blue",
  subtitle,
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
        className
      )}
    >
      {/* Background Gradient Glow */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          colorClasses[iconColor as keyof typeof colorClasses] ||
            colorClasses.blue
        )}
      />

      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
              colorClasses[iconColor as keyof typeof colorClasses] ||
                colorClasses.blue
            )}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {change && (
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold",
                trendColors[trend]
              )}
            >
              {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
