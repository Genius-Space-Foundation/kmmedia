import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-inter font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-primary text-white hover:bg-brand-primary-dark",
        accent:
          "border-transparent bg-brand-accent text-white hover:bg-brand-accent-dark",
        secondary:
          "border-transparent bg-brand-background text-brand-text-primary hover:bg-brand-border",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-brand-border text-brand-text-primary hover:bg-brand-background",
        success:
          "border-transparent bg-emerald-600 text-white hover:bg-emerald-700",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-brand-primary-light text-brand-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
