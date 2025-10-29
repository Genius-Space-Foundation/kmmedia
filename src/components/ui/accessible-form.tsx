/**
 * Accessible form components with WCAG 2.1 AA compliance
 * Provides enhanced form controls with proper ARIA attributes and error handling
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { AriaUtils, FormAccessibility } from "@/lib/accessibility";

// Enhanced Label component
export interface AccessibleLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const AccessibleLabel = React.forwardRef<
  HTMLLabelElement,
  AccessibleLabelProps
>(({ className, required, children, ...props }, ref) => {
  return (
    <label
      className={cn(
        "text-sm font-medium text-brand-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
});
AccessibleLabel.displayName = "AccessibleLabel";

// Enhanced Input with error handling
export interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  description?: string;
}

export const AccessibleInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(({ className, type, error, label, description, id, ...props }, ref) => {
  const inputId = id || AriaUtils.generateId("input");
  const errorId = error ? AriaUtils.generateId("error") : undefined;
  const descriptionId = description
    ? AriaUtils.generateId("description")
    : undefined;

  const describedBy = [errorId, descriptionId].filter(Boolean).join(" ");

  return (
    <div className="space-y-2">
      {label && (
        <AccessibleLabel htmlFor={inputId} required={props.required}>
          {label}
        </AccessibleLabel>
      )}
      {description && (
        <p id={descriptionId} className="text-sm text-brand-text-secondary">
          {description}
        </p>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-10 w-full font-inter radius-button border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-background disabled:text-brand-text-disabled transition-colors duration-200 shadow-1 min-h-[44px]",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error && (
        <div
          id={errorId}
          className="flex items-center space-x-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});
AccessibleInput.displayName = "AccessibleInput";

// Enhanced Button with loading state
export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(({ className, loading, loadingText, children, disabled, ...props }, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-inter text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] bg-brand-primary text-white hover:bg-brand-primary-dark shadow-1 hover:shadow-2 radius-button h-10 px-4 py-2",
        className
      )}
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className={loading ? "sr-only" : ""}>
        {loading ? loadingText || "Loading..." : children}
      </span>
      {loading && (
        <span aria-live="polite" aria-atomic="true">
          {loadingText || "Loading..."}
        </span>
      )}
    </button>
  );
});
AccessibleButton.displayName = "AccessibleButton";

// Form field wrapper with proper spacing and structure
export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
}) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};

// Error summary component for forms
export interface ErrorSummaryProps {
  errors: Array<{ field: string; message: string }>;
  title?: string;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title = "Please correct the following errors:",
}) => {
  if (errors.length === 0) return null;

  return (
    <div
      className="p-4 border border-red-200 bg-red-50 rounded-lg"
      role="alert"
      aria-labelledby="error-summary-title"
    >
      <h2
        id="error-summary-title"
        className="text-sm font-semibold text-red-800 mb-2"
      >
        {title}
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            <a
              href={`#${error.field}`}
              className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Skip link component
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
    >
      {children}
    </a>
  );
};

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <span className="sr-only">{children}</span>;
};

// Visually hidden but accessible heading for screen readers
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  visuallyHidden?: boolean;
}> = ({ level, children, className, visuallyHidden = false }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={cn(visuallyHidden && "sr-only", className)}>{children}</Tag>
  );
};
