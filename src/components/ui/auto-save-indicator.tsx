"use client";

import { useEffect, useState } from "react";
import { AutoSaveStatus } from "@/lib/hooks/useAutoSave";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  className = "",
}: AutoSaveIndicatorProps) {
  const [showStatus, setShowStatus] = useState(false);

  // Show status for a few seconds after saving or error
  useEffect(() => {
    if (status.status === "saved" || status.status === "error") {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (status.status === "saving") {
      setShowStatus(true);
    } else {
      setShowStatus(false);
    }
  }, [status.status]);

  if (!showStatus && status.status === "idle") {
    return null;
  }

  const getStatusConfig = () => {
    switch (status.status) {
      case "saving":
        return {
          icon: (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ),
          text: "Saving...",
          className: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "saved":
        return {
          icon: (
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          text: status.lastSaved
            ? `Saved ${formatTime(status.lastSaved)}`
            : "Saved",
          className: "text-green-600 bg-green-50 border-green-200",
        };
      case "error":
        return {
          icon: (
            <svg
              className="w-4 h-4 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          text: status.error || "Save failed",
          className: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`
        inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium
        transition-all duration-200 ${config.className} ${className}
      `}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}
