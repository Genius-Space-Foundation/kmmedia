"use client";

import { User } from "lucide-react";
import Image from "next/image";

interface InstructorAvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBorder?: boolean;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-2xl",
};

export default function InstructorAvatar({
  src,
  name,
  size = "md",
  className = "",
  showBorder = false,
  showOnlineStatus = false,
  isOnline = false,
}: InstructorAvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return "IN";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const borderClass = showBorder ? "ring-2 ring-white shadow-lg" : "";
  const sizeClass = sizeClasses[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden ${borderClass} bg-brand-primary flex items-center justify-center`}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "Instructor"}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
          </div>
        )}
      </div>

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div
          className={`absolute bottom-0 right-0 ${
            size === "xs" || size === "sm"
              ? "w-2 h-2"
              : size === "md" || size === "lg"
              ? "w-3 h-3"
              : "w-4 h-4"
          } rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      )}
    </div>
  );
}
