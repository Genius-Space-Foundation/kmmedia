/**
 * Mobile Responsive Components
 * Provides mobile-optimized layouts and components with touch-friendly interactions
 */

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Hook to detect mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

// Mobile-responsive container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export function ResponsiveContainer({
  children,
  className = "",
  maxWidth = "xl",
  padding = "md",
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-7xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 sm:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-responsive grid
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: 1 | 2;
    tablet?: 1 | 2 | 3;
    desktop?: 1 | 2 | 3 | 4;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
  className = "",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  const getColumnClass = (breakpoint: string, cols: number) => {
    const prefix = breakpoint === "mobile" ? "" : `${breakpoint}:`;
    return `${prefix}grid-cols-${cols}`;
  };

  return (
    <div
      className={cn(
        "grid",
        getColumnClass("mobile", columns.mobile || 1),
        columns.tablet && getColumnClass("md", columns.tablet),
        columns.desktop && getColumnClass("lg", columns.desktop),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Touch-friendly button
interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function TouchButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: TouchButtonProps) {
  const baseClasses =
    "btn-touch-friendly inline-flex items-center justify-center font-medium transition-all duration-200 focus-mobile disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-dark active:bg-brand-primary-dark",
    secondary:
      "bg-brand-secondary text-white hover:bg-brand-secondary-dark active:bg-brand-secondary-dark",
    outline:
      "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white",
    ghost:
      "text-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/20",
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2 min-h-[40px]",
    md: "text-base px-4 py-3 min-h-[48px]",
    lg: "text-lg px-6 py-4 min-h-[56px]",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        "rounded-lg",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="loading-mobile spinner mr-2" />}
      {children}
    </button>
  );
}

// Mobile-responsive card
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function ResponsiveCard({
  children,
  className = "",
  padding = "md",
  hover = false,
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "card-mobile",
        paddingClasses[padding],
        hover && "hover-mobile cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-responsive form input
interface ResponsiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function ResponsiveInput({
  label,
  error,
  helperText,
  fullWidth = true,
  className = "",
  id,
  ...props
}: ResponsiveInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("space-y-2", !fullWidth && "inline-block")}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-brand-text-primary"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "form-control-mobile",
          fullWidth && "w-full",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-brand-text-secondary">{helperText}</p>
      )}
    </div>
  );
}

// Mobile-responsive modal
interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl mx-4",
          isMobile ? "modal-mobile" : sizeClasses[size],
          "max-h-[90vh] overflow-y-auto"
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              {title}
            </h2>
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </TouchButton>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Mobile-responsive tabs
interface ResponsiveTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
}

export function ResponsiveTabs({
  tabs,
  defaultTab,
  className = "",
}: ResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab Navigation */}
      <div className="tabs-mobile border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn("tab-item", activeTab === tab.id && "active")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

// Mobile-responsive loading state
interface ResponsiveLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function ResponsiveLoading({
  message = "Loading...",
  size = "md",
}: ResponsiveLoadingProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-8",
    lg: "p-12",
  };

  return (
    <div className={cn("loading-mobile", sizeClasses[size])}>
      <div className="spinner" />
      <p className="text-brand-text-secondary">{message}</p>
    </div>
  );
}

// Mobile-responsive alert
interface ResponsiveAlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ResponsiveAlert({
  type = "info",
  title,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
}: ResponsiveAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const typeIcons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div className={cn("alert-mobile", typeStyles[type])}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{typeIcons[type]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="p-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </TouchButton>
          </div>
        )}
      </div>
    </div>
  );
}
