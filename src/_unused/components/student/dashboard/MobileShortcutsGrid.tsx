"use client";

import { useState } from "react";
import {
  PlayCircle,
  Calendar,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";
import {
  isMobile,
  triggerHapticFeedback,
  TOUCH_TARGET_SIZE,
  getCurrentBreakpoint,
} from "@/lib/mobile-utils";

interface Shortcut {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count?: number;
  onClick: () => void;
  description?: string;
}

interface MobileShortcutsGridProps {
  shortcuts?: Shortcut[];
  columns?: number;
  showLabels?: boolean;
  compact?: boolean;
}

const defaultShortcuts: Shortcut[] = [
  {
    id: "continue-learning",
    title: "Continue",
    icon: PlayCircle,
    color: "from-blue-500 to-blue-600",
    onClick: () => {},
    description: "Resume your course",
  },
  {
    id: "assignments",
    title: "Assignments",
    icon: Calendar,
    color: "from-orange-500 to-orange-600",
    onClick: () => {},
    description: "View deadlines",
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: Award,
    color: "from-purple-500 to-purple-600",
    onClick: () => {},
    description: "Track progress",
  },
  {
    id: "browse-courses",
    title: "Browse",
    icon: BookOpen,
    color: "from-green-500 to-green-600",
    onClick: () => {},
    description: "Explore courses",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    color: "from-red-500 to-red-600",
    onClick: () => {},
    description: "View updates",
  },
  {
    id: "progress",
    title: "Progress",
    icon: TrendingUp,
    color: "from-indigo-500 to-indigo-600",
    onClick: () => {},
    description: "View analytics",
  },
  {
    id: "goals",
    title: "Goals",
    icon: Target,
    color: "from-pink-500 to-pink-600",
    onClick: () => {},
    description: "Set targets",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    color: "from-gray-500 to-gray-600",
    onClick: () => {},
    description: "Preferences",
  },
];

export default function MobileShortcutsGrid({
  shortcuts = defaultShortcuts,
  columns,
  showLabels = true,
  compact = false,
}: MobileShortcutsGridProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);

  // Auto-detect columns based on screen size if not specified
  const getColumns = () => {
    if (columns) return columns;
    const breakpoint = getCurrentBreakpoint();
    if (breakpoint === "xs") return 2;
    if (breakpoint === "sm") return 3;
    return 4;
  };

  const gridColumns = getColumns();

  const handleShortcutClick = (shortcut: Shortcut) => {
    if (isMobile()) {
      triggerHapticFeedback("medium");
    }

    setPressedId(shortcut.id);
    setTimeout(() => setPressedId(null), 150);

    shortcut.onClick();
  };

  const handleShortcutPress = (shortcut: Shortcut) => {
    setPressedId(shortcut.id);
    if (isMobile()) {
      triggerHapticFeedback("light");
    }
  };

  const handleShortcutRelease = () => {
    setPressedId(null);
  };

  const getShortcutSize = () => {
    if (compact) return TOUCH_TARGET_SIZE.MIN;
    return TOUCH_TARGET_SIZE.COMFORTABLE * 1.5;
  };

  const shortcutSize = getShortcutSize();

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
      }}
    >
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        const isPressed = pressedId === shortcut.id;

        return (
          <button
            key={shortcut.id}
            onClick={() => handleShortcutClick(shortcut)}
            onTouchStart={() => handleShortcutPress(shortcut)}
            onTouchEnd={handleShortcutRelease}
            onTouchCancel={handleShortcutRelease}
            className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${
              shortcut.color
            } rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white overflow-hidden ${
              isPressed ? "scale-95" : "scale-100"
            }`}
            style={{
              minHeight: `${shortcutSize}px`,
              minWidth: `${shortcutSize}px`,
            }}
            aria-label={shortcut.description || shortcut.title}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-8 -translate-y-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-6 translate-y-6" />
            </div>

            {/* Badge Count */}
            {shortcut.count !== undefined && shortcut.count > 0 && (
              <span className="absolute top-2 right-2 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                {shortcut.count > 99 ? "99+" : shortcut.count}
              </span>
            )}

            {/* Icon */}
            <Icon
              className={`${
                compact ? "w-6 h-6" : "w-8 h-8"
              } mb-2 relative z-10`}
            />

            {/* Label */}
            {showLabels && (
              <span
                className={`${
                  compact ? "text-xs" : "text-sm"
                } font-medium text-center px-2 relative z-10`}
              >
                {shortcut.title}
              </span>
            )}

            {/* Ripple Effect */}
            {isPressed && (
              <span className="absolute inset-0 bg-white opacity-20 animate-ping rounded-xl" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Export individual shortcut component for custom layouts
export function MobileShortcut({
  shortcut,
  size = "default",
  showLabel = true,
}: {
  shortcut: Shortcut;
  size?: "small" | "default" | "large";
  showLabel?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const Icon = shortcut.icon;

  const handleClick = () => {
    if (isMobile()) {
      triggerHapticFeedback("medium");
    }
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    shortcut.onClick();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "min-h-[60px] min-w-[60px]",
          icon: "w-5 h-5",
          text: "text-xs",
        };
      case "large":
        return {
          container: "min-h-[100px] min-w-[100px]",
          icon: "w-10 h-10",
          text: "text-base",
        };
      default:
        return {
          container: `min-h-[${TOUCH_TARGET_SIZE.COMFORTABLE * 1.5}px] min-w-[${
            TOUCH_TARGET_SIZE.COMFORTABLE * 1.5
          }px]`,
          icon: "w-8 h-8",
          text: "text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <button
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${
        shortcut.color
      } rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white overflow-hidden ${
        sizeClasses.container
      } ${isPressed ? "scale-95" : "scale-100"}`}
      aria-label={shortcut.description || shortcut.title}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-8 -translate-y-8" />
      </div>

      {/* Badge Count */}
      {shortcut.count !== undefined && shortcut.count > 0 && (
        <span className="absolute top-2 right-2 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
          {shortcut.count > 99 ? "99+" : shortcut.count}
        </span>
      )}

      {/* Icon */}
      <Icon className={`${sizeClasses.icon} mb-2 relative z-10`} />

      {/* Label */}
      {showLabel && (
        <span
          className={`${sizeClasses.text} font-medium text-center px-2 relative z-10`}
        >
          {shortcut.title}
        </span>
      )}

      {/* Ripple Effect */}
      {isPressed && (
        <span className="absolute inset-0 bg-white opacity-20 animate-ping rounded-xl" />
      )}
    </button>
  );
}
