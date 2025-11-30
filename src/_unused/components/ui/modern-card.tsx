import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "elevated" | "bordered";
  hover?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border border-gray-200/60 shadow-sm",
      gradient:
        "bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 shadow-md",
      glass:
        "bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg",
      elevated: "bg-white border-0 shadow-xl",
      bordered: "bg-white border-2 border-gray-200 shadow-none",
    };

    const hoverStyles = hover
      ? "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-brand-primary/20"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl overflow-hidden",
          variantStyles[variant],
          hoverStyles,
          className
        )}
        {...props}
      />
    );
  }
);
ModernCard.displayName = "ModernCard";

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
ModernCardHeader.displayName = "ModernCardHeader";

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
));
ModernCardTitle.displayName = "ModernCardTitle";

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
    {...props}
  />
));
ModernCardDescription.displayName = "ModernCardDescription";

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
ModernCardContent.displayName = "ModernCardContent";

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
ModernCardFooter.displayName = "ModernCardFooter";

export {
  ModernCard,
  ModernCardHeader,
  ModernCardFooter,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
};
