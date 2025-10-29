"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Bell,
  Calendar,
  Timer,
} from "lucide-react";
import {
  format,
  formatDistanceToNow,
  isAfter,
  differenceInMilliseconds,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownProps {
  dueDate: Date;
  title?: string;
  isOverdue?: boolean;
  showNotifications?: boolean;
  compact?: boolean;
  className?: string;
  onReminder?: (type: "48h" | "24h" | "1h") => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  isOverdue: boolean;
}

interface UrgencyLevel {
  level: "normal" | "warning" | "urgent" | "critical" | "overdue";
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

// Calculate time remaining until due date
function calculateTimeRemaining(dueDate: Date): TimeRemaining {
  const now = new Date();
  const timeDiff = differenceInMilliseconds(dueDate, now);

  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHours: 0,
      totalMinutes: 0,
      isOverdue: true,
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const totalHours = differenceInHours(dueDate, now);
  const totalMinutes = differenceInMinutes(dueDate, now);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    totalMinutes,
    isOverdue: false,
  };
}

// Determine urgency level based on time remaining
function getUrgencyLevel(timeRemaining: TimeRemaining): UrgencyLevel {
  if (timeRemaining.isOverdue) {
    return {
      level: "overdue",
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: AlertCircle,
      message: "Assignment is overdue",
    };
  }

  if (timeRemaining.totalHours <= 1) {
    return {
      level: "critical",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      icon: AlertTriangle,
      message: "Due in less than 1 hour - submit now!",
    };
  }

  if (timeRemaining.totalHours <= 24) {
    return {
      level: "urgent",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      icon: AlertTriangle,
      message: "Due within 24 hours",
    };
  }

  if (timeRemaining.totalHours <= 48) {
    return {
      level: "warning",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      icon: Clock,
      message: "Due within 48 hours",
    };
  }

  return {
    level: "normal",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Calendar,
    message: "Assignment available",
  };
}

// Format time remaining for display
function formatTimeRemaining(
  timeRemaining: TimeRemaining,
  compact: boolean = false
): string {
  if (timeRemaining.isOverdue) {
    return "Overdue";
  }

  if (compact) {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    return `${timeRemaining.minutes}m`;
  }

  const parts: string[] = [];

  if (timeRemaining.days > 0) {
    parts.push(
      `${timeRemaining.days} day${timeRemaining.days !== 1 ? "s" : ""}`
    );
  }
  if (timeRemaining.hours > 0) {
    parts.push(
      `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""}`
    );
  }
  if (timeRemaining.minutes > 0 && timeRemaining.days === 0) {
    parts.push(
      `${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? "s" : ""}`
    );
  }

  if (parts.length === 0) {
    return "Less than 1 minute";
  }

  return parts.join(", ");
}

// Compact countdown display
interface CompactCountdownProps {
  timeRemaining: TimeRemaining;
  urgency: UrgencyLevel;
  className?: string;
}

function CompactCountdown({
  timeRemaining,
  urgency,
  className,
}: CompactCountdownProps) {
  const Icon = urgency.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("h-4 w-4", urgency.color)} />
      <span className={cn("text-sm font-medium", urgency.color)}>
        {formatTimeRemaining(timeRemaining, true)}
      </span>
    </div>
  );
}

// Full countdown display with digital clock
interface FullCountdownProps {
  timeRemaining: TimeRemaining;
  urgency: UrgencyLevel;
  dueDate: Date;
  title?: string;
  showNotifications?: boolean;
  onReminder?: (type: "48h" | "24h" | "1h") => void;
}

function FullCountdown({
  timeRemaining,
  urgency,
  dueDate,
  title,
  showNotifications,
  onReminder,
}: FullCountdownProps) {
  const Icon = urgency.icon;

  // Check if we should show reminder notifications
  useEffect(() => {
    if (!showNotifications || !onReminder || timeRemaining.isOverdue) return;

    // 48 hour reminder
    if (timeRemaining.totalHours <= 48 && timeRemaining.totalHours > 47) {
      onReminder("48h");
    }
    // 24 hour reminder
    else if (timeRemaining.totalHours <= 24 && timeRemaining.totalHours > 23) {
      onReminder("24h");
    }
    // 1 hour reminder
    else if (timeRemaining.totalHours <= 1 && timeRemaining.totalMinutes > 59) {
      onReminder("1h");
    }
  }, [
    timeRemaining.totalHours,
    timeRemaining.totalMinutes,
    showNotifications,
    onReminder,
    timeRemaining.isOverdue,
  ]);

  return (
    <Card className={cn("", urgency.borderColor, urgency.bgColor)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          {title || "Assignment Countdown"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgency Alert */}
        <Alert className={cn(urgency.borderColor, urgency.bgColor)}>
          <Icon className="h-4 w-4" />
          <AlertDescription className={urgency.color}>
            {urgency.message}
          </AlertDescription>
        </Alert>

        {/* Digital Countdown Display */}
        {!timeRemaining.isOverdue && (
          <div className="text-center space-y-2">
            <div className="text-3xl font-mono font-bold tracking-wider">
              {timeRemaining.days > 0 && (
                <span className={urgency.color}>
                  {String(timeRemaining.days).padStart(2, "0")}
                  <span className="text-sm ml-1">d</span>
                </span>
              )}
              {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
                <>
                  {timeRemaining.days > 0 && <span className="mx-2">:</span>}
                  <span className={urgency.color}>
                    {String(timeRemaining.hours).padStart(2, "0")}
                    <span className="text-sm ml-1">h</span>
                  </span>
                </>
              )}
              <span className="mx-2">:</span>
              <span className={urgency.color}>
                {String(timeRemaining.minutes).padStart(2, "0")}
                <span className="text-sm ml-1">m</span>
              </span>
              <span className="mx-2">:</span>
              <span className={urgency.color}>
                {String(timeRemaining.seconds).padStart(2, "0")}
                <span className="text-sm ml-1">s</span>
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {formatTimeRemaining(timeRemaining)} remaining
            </div>
          </div>
        )}

        {/* Overdue Display */}
        {timeRemaining.isOverdue && (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">OVERDUE</div>
            <div className="text-sm text-red-600">
              Was due {formatDistanceToNow(dueDate)} ago
            </div>
          </div>
        )}

        {/* Due Date Info */}
        <div className="text-center text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Due: {format(dueDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        {/* Notification Settings */}
        {showNotifications && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 border-t pt-2">
            <Bell className="h-3 w-3" />
            <span>Reminders enabled</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main countdown component
export function AssignmentCountdown({
  dueDate,
  title,
  isOverdue = false,
  showNotifications = false,
  compact = false,
  className,
  onReminder,
}: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(dueDate)
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>(() =>
    getUrgencyLevel(timeRemaining)
  );

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(dueDate);
      const newUrgency = getUrgencyLevel(newTimeRemaining);

      setTimeRemaining(newTimeRemaining);
      setUrgency(newUrgency);
    }, 1000);

    return () => clearInterval(interval);
  }, [dueDate]);

  // Handle browser visibility change to update when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newTimeRemaining = calculateTimeRemaining(dueDate);
        const newUrgency = getUrgencyLevel(newTimeRemaining);
        setTimeRemaining(newTimeRemaining);
        setUrgency(newUrgency);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dueDate]);

  if (compact) {
    return (
      <CompactCountdown
        timeRemaining={timeRemaining}
        urgency={urgency}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <FullCountdown
        timeRemaining={timeRemaining}
        urgency={urgency}
        dueDate={dueDate}
        title={title}
        showNotifications={showNotifications}
        onReminder={onReminder}
      />
    </div>
  );
}

// Utility component for inline countdown display
interface InlineCountdownProps {
  dueDate: Date;
  showIcon?: boolean;
  className?: string;
}

export function InlineCountdown({
  dueDate,
  showIcon = true,
  className,
}: InlineCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(dueDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dueDate));
    }, 60000); // Update every minute for inline display

    return () => clearInterval(interval);
  }, [dueDate]);

  const urgency = getUrgencyLevel(timeRemaining);
  const Icon = urgency.icon;

  return (
    <span
      className={cn("inline-flex items-center gap-1", urgency.color, className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-sm">
        {timeRemaining.isOverdue
          ? `Overdue by ${formatDistanceToNow(dueDate)}`
          : `Due in ${formatTimeRemaining(timeRemaining, true)}`}
      </span>
    </span>
  );
}

// Badge countdown for assignment cards
interface CountdownBadgeProps {
  dueDate: Date;
  variant?: "default" | "outline" | "secondary" | "destructive";
  className?: string;
}

export function CountdownBadge({
  dueDate,
  variant,
  className,
}: CountdownBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(dueDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dueDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueDate]);

  const urgency = getUrgencyLevel(timeRemaining);

  // Determine badge variant based on urgency if not specified
  const badgeVariant =
    variant ||
    (() => {
      switch (urgency.level) {
        case "overdue":
        case "critical":
          return "destructive";
        case "urgent":
          return "default";
        case "warning":
          return "secondary";
        default:
          return "outline";
      }
    })();

  return (
    <Badge
      variant={badgeVariant}
      className={cn("flex items-center gap-1", className)}
    >
      <Clock className="h-3 w-3" />
      {formatTimeRemaining(timeRemaining, true)}
    </Badge>
  );
}
