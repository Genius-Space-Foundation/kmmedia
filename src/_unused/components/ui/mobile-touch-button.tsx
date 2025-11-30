"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  TOUCH_TARGET_SIZE,
  isMobile,
  triggerHapticFeedback,
} from "@/lib/mobile-utils";

const mobileTouchButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform duration-150",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        touch: "px-6 py-3", // Touch-friendly size
        "touch-sm": "px-4 py-2.5", // Smaller touch-friendly
        "touch-lg": "px-8 py-4", // Larger touch-friendly
      },
      touchSize: {
        min: "", // 44px minimum
        recommended: "", // 48px recommended
        comfortable: "", // 56px comfortable
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      touchSize: "recommended",
    },
  }
);

export interface MobileTouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileTouchButtonVariants> {
  asChild?: boolean;
  hapticFeedback?: "light" | "medium" | "heavy" | false;
  enforceMinSize?: boolean;
}

const MobileTouchButton = React.forwardRef<
  HTMLButtonElement,
  MobileTouchButtonProps
>(
  (
    {
      className,
      variant,
      size,
      touchSize = "recommended",
      asChild = false,
      hapticFeedback = "medium",
      enforceMinSize = true,
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on mobile devices
      if (hapticFeedback && isMobile()) {
        triggerHapticFeedback(hapticFeedback);
      }

      // Call the original onClick handler
      onClick?.(e);
    };

    // Calculate minimum size based on touchSize prop
    const getMinSize = () => {
      switch (touchSize) {
        case "min":
          return TOUCH_TARGET_SIZE.MIN;
        case "recommended":
          return TOUCH_TARGET_SIZE.RECOMMENDED;
        case "comfortable":
          return TOUCH_TARGET_SIZE.COMFORTABLE;
        default:
          return TOUCH_TARGET_SIZE.RECOMMENDED;
      }
    };

    const minSize = enforceMinSize ? getMinSize() : undefined;

    const buttonStyle = minSize
      ? {
          minWidth: `${minSize}px`,
          minHeight: `${minSize}px`,
          ...style,
        }
      : style;

    return (
      <Comp
        className={cn(mobileTouchButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        style={buttonStyle}
        {...props}
      />
    );
  }
);
MobileTouchButton.displayName = "MobileTouchButton";

export { MobileTouchButton, mobileTouchButtonVariants };
