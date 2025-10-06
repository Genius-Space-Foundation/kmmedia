import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        pending: "bg-orange-100 text-orange-800",
        approved: "bg-emerald-100 text-emerald-800",
        rejected: "bg-rose-100 text-rose-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export function StatusBadge({
  className,
  variant,
  size,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

// Predefined status badges for common use cases
export function ApplicationStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { variant: "pending" as const, label: "⏳ Pending", icon: "⏳" },
    APPROVED: {
      variant: "approved" as const,
      label: "✅ Approved",
      icon: "✅",
    },
    REJECTED: {
      variant: "rejected" as const,
      label: "❌ Rejected",
      icon: "❌",
    },
    SUBMITTED: { variant: "info" as const, label: "📝 Submitted", icon: "📝" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "default" as const,
    label: status,
    icon: "📋",
  };

  return (
    <StatusBadge variant={config.variant}>
      <span className="flex items-center space-x-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </StatusBadge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { variant: "warning" as const, label: "⏳ Pending", icon: "⏳" },
    COMPLETED: { variant: "success" as const, label: "✅ Paid", icon: "✅" },
    FAILED: { variant: "error" as const, label: "❌ Failed", icon: "❌" },
    REFUNDED: { variant: "info" as const, label: "🔄 Refunded", icon: "🔄" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "default" as const,
    label: status,
    icon: "💳",
  };

  return (
    <StatusBadge variant={config.variant}>
      <span className="flex items-center space-x-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </StatusBadge>
  );
}
