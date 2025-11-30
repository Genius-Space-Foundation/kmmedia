import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const modernBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200",
        primary:
          "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200",
        secondary:
          "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200",
        success:
          "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
        warning:
          "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200",
        danger:
          "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200",
        info: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border border-cyan-200",
        outline:
          "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
        gradient:
          "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg border-0",
        glass:
          "bg-white/80 backdrop-blur-sm text-gray-700 border border-white/60 shadow-sm hover:shadow-md",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-3 py-1",
        lg: "text-sm px-4 py-1.5",
      },
      dot: {
        true: "pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernBadgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function ModernBadge({
  className,
  variant,
  size,
  dot,
  dotColor = "bg-current",
  children,
  ...props
}: ModernBadgeProps) {
  return (
    <div
      className={cn(modernBadgeVariants({ variant, size, dot }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full mr-1.5 animate-pulse",
            dotColor
          )}
        />
      )}
      {children}
    </div>
  );
}

export { ModernBadge, modernBadgeVariants };
