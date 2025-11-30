import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-inter text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-1 hover:shadow-2 radius-button",
        accent:
          "bg-brand-accent text-brand-neutral-900 hover:bg-brand-accent-dark shadow-1 hover:shadow-2 radius-button",
        outline:
          "border border-brand-primary bg-brand-surface text-brand-primary hover:bg-brand-primary-light radius-button",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-1 hover:shadow-2 radius-button",
        secondary:
          "bg-brand-background text-brand-text-primary hover:bg-brand-border radius-button",
        ghost: "text-brand-text-primary hover:bg-brand-background",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Import Loader2 icon dynamically to avoid issues
    const LoaderIcon = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    );

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {React.isValidElement(children) ? children : null}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2">
            <LoaderIcon />
          </span>
        )}
        {loading && loadingText ? loadingText : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
