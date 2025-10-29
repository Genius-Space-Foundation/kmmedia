/**
 * Mobile-Optimized Button Component
 * Provides touch-friendly buttons with proper sizing and feedback
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { isTouchDevice, getTouchTargetSize } from "@/lib/mobile-utils";

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-inter font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm hover:shadow-md active:shadow-sm",
        accent:
          "bg-brand-accent text-brand-neutral-900 hover:bg-brand-accent-dark shadow-sm hover:shadow-md active:shadow-sm",
        outline:
          "border-2 border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white active:bg-brand-primary-dark",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md active:shadow-sm",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
        ghost:
          "text-brand-text-primary hover:bg-brand-background active:bg-gray-200",
        link: "text-brand-primary underline-offset-4 hover:underline active:no-underline",
      },
      size: {
        sm: "text-sm px-3 py-2 min-h-[40px] min-w-[40px] rounded-lg",
        default: "text-sm px-4 py-2 min-h-[44px] min-w-[44px] rounded-xl",
        lg: "text-base px-6 py-3 min-h-[48px] min-w-[48px] rounded-xl",
        xl: "text-lg px-8 py-4 min-h-[56px] min-w-[56px] rounded-2xl",
        icon: "p-2 min-h-[44px] min-w-[44px] rounded-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
);

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: boolean;
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      hapticFeedback = true,
      asChild = false,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    // Handle click with haptic feedback
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      // Provide haptic feedback on supported devices
      if (hapticFeedback && "vibrate" in navigator && isTouchDevice()) {
        navigator.vibrate(10); // Short vibration
      }

      // Add visual feedback
      const target = event.currentTarget;
      target.style.transform = "scale(0.95)";
      setTimeout(() => {
        target.style.transform = "";
      }, 100);

      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Comp
        className={cn(
          mobileButtonVariants({ variant, size, fullWidth, loading, className })
        )}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span className={loading ? "opacity-0" : ""}>
          {loading ? loadingText || "Loading..." : children}
        </span>

        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen reader loading state */}
        {loading && (
          <span className="sr-only" aria-live="polite">
            {loadingText || "Loading..."}
          </span>
        )}
      </Comp>
    );
  }
);

MobileButton.displayName = "MobileButton";

export { MobileButton, mobileButtonVariants };

// Floating Action Button variant
export interface FABProps extends Omit<MobileButtonProps, "size" | "variant"> {
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  elevated?: boolean;
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FABProps
>(
  (
    {
      className,
      position = "bottom-right",
      elevated = true,
      children,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "bottom-center": "fixed bottom-6 left-1/2 transform -translate-x-1/2",
    };

    return (
      <MobileButton
        ref={ref}
        className={cn(
          positionClasses[position],
          "rounded-full p-4 min-h-[56px] min-w-[56px] z-50",
          elevated && "shadow-lg hover:shadow-xl",
          className
        )}
        size="icon"
        {...props}
      >
        {children}
      </MobileButton>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

// Button Group for mobile
export interface MobileButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

export const MobileButtonGroup: React.FC<MobileButtonGroupProps> = ({
  children,
  orientation = "horizontal",
  spacing = "normal",
  className,
}) => {
  const spacingClasses = {
    tight: orientation === "horizontal" ? "space-x-1" : "space-y-1",
    normal: orientation === "horizontal" ? "space-x-2" : "space-y-2",
    loose: orientation === "horizontal" ? "space-x-4" : "space-y-4",
  };

  const orientationClasses =
    orientation === "horizontal" ? "flex flex-row" : "flex flex-col";

  return (
    <div className={cn(orientationClasses, spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};
