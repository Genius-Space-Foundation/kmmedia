import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  titleClassName,
  descriptionClassName,
  className,
  align = "center",
}: SectionHeaderProps) {
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={cn("flex flex-col", alignClasses[align], className)}>
      {badge && (
        <div
          className={cn(
            "inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full text-sm font-semibold text-blue-700 mb-4 shadow-sm",
            align === "center" && "mx-auto"
          )}
        >
          {BadgeIcon && <BadgeIcon className="w-4 h-4 mr-2" />}
          {badge}
        </div>
      )}

      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight",
          titleClassName
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "text-base sm:text-lg text-gray-600 max-w-3xl leading-relaxed",
            align === "center" && "mx-auto",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
