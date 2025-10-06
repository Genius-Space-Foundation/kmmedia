import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  variant?: "default" | "minimal";
}

export function EmptyStateCard({
  variant = "default",
  ...props
}: EmptyStateCardProps) {
  if (variant === "minimal") {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">{props.icon}</span>
        <p className="text-gray-500 font-medium">{props.title}</p>
        {props.description && (
          <p className="text-sm text-gray-400 mt-1">{props.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-8">
      <EmptyState {...props} />
    </div>
  );
}
