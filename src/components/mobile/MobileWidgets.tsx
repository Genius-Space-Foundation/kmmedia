"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Users,
  Award,
  Target,
  Calendar,
  Bell,
  ChevronRight,
  Play,
  Pause,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  X,
} from "lucide-react";
import { getCurrentBreakpoint, isMobile } from "@/lib/mobile-utils";

interface MobileStatsWidgetProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange" | "red";
  subtitle?: string;
  onClick?: () => void;
}

export function MobileStatsWidget({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  color,
  subtitle,
  onClick,
}: MobileStatsWidgetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-600",
    green: "from-green-500 to-green-600 bg-green-50 text-green-600",
    purple: "from-purple-500 to-purple-600 bg-purple-50 text-purple-600",
    orange: "from-orange-500 to-orange-600 bg-orange-50 text-orange-600",
    red: "from-red-500 to-red-600 bg-red-50 text-red-600",
  };

  const trendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-gray-600";

  const handleTouchStart = () => {
    if (isTouchDevice()) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDevice()) {
      setIsPressed(false);
    }
  };

  const handleLongPress = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card
      className={`group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
        isPressed ? "scale-95" : "hover:scale-105"
      }`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
          colorClasses[color].split(" ")[0]
        } ${
          colorClasses[color].split(" ")[1]
        } rounded-full blur-2xl opacity-20 transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}
      ></div>

      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 bg-gradient-to-br ${
              colorClasses[color].split(" ")[0]
            } ${
              colorClasses[color].split(" ")[1]
            } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {change && trendIcon && (
            <div
              className={`flex items-center space-x-1 text-sm font-semibold ${trendColor}`}
            >
              {React.createElement(trendIcon, { className: "w-4 h-4" })}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>

        {/* Mobile-specific details panel */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Tap to view details</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MobileProgressWidgetProps {
  title: string;
  progress: number;
  total?: number;
  current?: number;
  color?: "blue" | "green" | "purple" | "orange";
  showPercentage?: boolean;
  subtitle?: string;
  onClick?: () => void;
}

export function MobileProgressWidget({
  title,
  progress,
  total,
  current,
  color = "blue",
  showPercentage = true,
  subtitle,
  onClick,
}: MobileProgressWidgetProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <Card
      className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
          )}
        </div>

        <Progress
          value={progress}
          className="h-2 mb-2"
          // className={`h-2 mb-2 [&>div]:${colorClasses[color]}`}
        />

        <div className="flex items-center justify-between text-sm text-gray-600">
          {current !== undefined && total !== undefined && (
            <span>
              {current} of {total}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileQuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange" | "red";
  onClick: () => void;
  badge?: string | number;
}

export function MobileQuickAction({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  badge,
}: MobileQuickActionProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
  };

  return (
    <Button
      onClick={onClick}
      className={`relative h-auto p-4 bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl`}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold">{title}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
        {badge && (
          <Badge className="bg-white/20 text-white border-white/30">
            {badge}
          </Badge>
        )}
        <ChevronRight className="w-5 h-5 opacity-70" />
      </div>
    </Button>
  );
}

interface MobileActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: "course" | "assignment" | "achievement" | "payment" | "general";
  status?: "completed" | "pending" | "overdue";
  onClick?: () => void;
}

export function MobileActivityItem({
  title,
  description,
  time,
  type,
  status,
  onClick,
}: MobileActivityItemProps) {
  const getTypeIcon = () => {
    switch (type) {
      case "course":
        return BookOpen;
      case "assignment":
        return Clock;
      case "achievement":
        return Award;
      case "payment":
        return Target;
      default:
        return Bell;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "course":
        return "bg-blue-100 text-blue-600";
      case "assignment":
        return "bg-orange-100 text-orange-600";
      case "achievement":
        return "bg-purple-100 text-purple-600";
      case "payment":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "overdue":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-orange-600";
    }
  };

  const Icon = getTypeIcon();
  const StatusIcon = getStatusIcon();

  return (
    <div
      className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`w-10 h-10 ${getTypeColor()} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-900 truncate">{title}</p>
            <p className="text-sm text-gray-600 truncate">{description}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {time}
            </p>
          </div>
          {status && (
            <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
              <StatusIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MobileLearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  weeklyGoal: {
    current: number;
    target: number;
    unit: string;
  };
}

export function MobileLearningStreak({
  currentStreak,
  longestStreak,
  lastActivity,
  weeklyGoal,
}: MobileLearningStreakProps) {
  const streakProgress = (currentStreak / Math.max(longestStreak, 7)) * 100;
  const goalProgress = (weeklyGoal.current / weeklyGoal.target) * 100;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Zap className="w-5 h-5" />
          <span>Learning Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {currentStreak}
          </div>
          <p className="text-sm text-orange-700">
            {currentStreak === 1 ? "day" : "days"} streak
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Best: {longestStreak} days
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Streak Progress</span>
            <span className="text-orange-600 font-medium">
              {Math.round(streakProgress)}%
            </span>
          </div>
          <Progress value={streakProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Weekly Goal</span>
            <span className="text-orange-600 font-medium">
              {weeklyGoal.current}/{weeklyGoal.target} {weeklyGoal.unit}
            </span>
          </div>
          <Progress value={goalProgress} className="h-2" />
        </div>

        <div className="text-center pt-2 border-t border-orange-200">
          <p className="text-xs text-orange-700">
            Last activity: {lastActivity}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileUpcomingDeadlineProps {
  title: string;
  course: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  type: "assignment" | "quiz" | "project";
  estimatedTime?: number;
  onSetReminder?: () => void;
  onViewDetails?: () => void;
}

export function MobileUpcomingDeadline({
  title,
  course,
  dueDate,
  priority,
  type,
  estimatedTime,
  onSetReminder,
  onViewDetails,
}: MobileUpcomingDeadlineProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "assignment":
        return "📝";
      case "quiz":
        return "❓";
      case "project":
        return "🎯";
    }
  };

  const daysUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getTypeIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 truncate">{course}</p>
              </div>
              <Badge className={getPriorityColor()}>{priority}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>
                Due in {daysUntilDue} {daysUntilDue === 1 ? "day" : "days"}
              </span>
              {estimatedTime && <span>{estimatedTime} min</span>}
            </div>

            <div className="flex space-x-2">
              {onSetReminder && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSetReminder}
                  className="flex-1"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Remind
                </Button>
              )}
              {onViewDetails && (
                <Button size="sm" onClick={onViewDetails} className="flex-1">
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileShortcutGridProps {
  shortcuts: {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    count?: number;
    onClick: () => void;
  }[];
  columns?: 2 | 3 | 4;
}

export function MobileShortcutGrid({
  shortcuts,
  columns = 4,
}: MobileShortcutGridProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);

  const handleTouchStart = (id: string) => {
    if (isTouchDevice()) {
      setPressedId(id);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDevice()) {
      setPressedId(null);
    }
  };

  return (
    <div className={`grid grid-cols-${columns} gap-3`}>
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        const isPressed = pressedId === shortcut.id;

        return (
          <button
            key={shortcut.id}
            onClick={shortcut.onClick}
            onTouchStart={() => handleTouchStart(shortcut.id)}
            onTouchEnd={handleTouchEnd}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white shadow-lg border-0 transition-all duration-200 ${
              isPressed
                ? "scale-95 shadow-md"
                : "hover:scale-105 hover:shadow-xl"
            }`}
            style={{ minHeight: "80px" }}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} opacity-10 rounded-2xl`}
            />

            {/* Icon */}
            <div
              className={`relative w-8 h-8 bg-gradient-to-br ${shortcut.color} rounded-xl flex items-center justify-center mb-2 shadow-md`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>

            {/* Title */}
            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
              {shortcut.title}
            </span>

            {/* Count badge */}
            {shortcut.count !== undefined && shortcut.count > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {shortcut.count > 99 ? "99+" : shortcut.count}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface MobileFloatingActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
  size?: "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export function MobileFloatingActionButton({
  icon: Icon,
  onClick,
  color = "from-blue-500 to-blue-600",
  size = "md",
  position = "bottom-right",
}: MobileFloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2",
  };

  const handleTouchStart = () => {
    if (isTouchDevice()) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDevice()) {
      setIsPressed(false);
    }
  };

  return (
    <button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed ${positionClasses[position]} ${
        sizeClasses[size]
      } bg-gradient-to-br ${color} rounded-full shadow-2xl border-0 transition-all duration-200 z-50 ${
        isPressed ? "scale-90" : "hover:scale-110"
      }`}
    >
      <Icon className={`${iconSizes[size]} text-white`} />
    </button>
  );
}


