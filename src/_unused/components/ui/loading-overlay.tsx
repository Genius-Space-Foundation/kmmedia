import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({
  message = "Loading...",
  fullScreen = false,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-brand-background/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        {/* Spinning loader */}
        <div className="w-16 h-16 border-4 border-brand-neutral-200 border-t-brand-primary rounded-full animate-spin" />
        
        {/* Pulse effect */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-brand-primary/20 rounded-full animate-ping" />
      </div>
      
      {message && (
        <p className="mt-4 text-brand-text-secondary font-medium">{message}</p>
      )}
    </div>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
