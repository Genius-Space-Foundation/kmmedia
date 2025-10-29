import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full font-inter radius-button border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-background disabled:text-brand-text-disabled transition-colors duration-200 shadow-1 min-h-[44px]",
          className
        )}
        ref={ref}
        aria-invalid={props["aria-invalid"] || false}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
