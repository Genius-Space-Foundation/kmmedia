"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Calendar,
  Award,
  User,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  isMobile,
  triggerHapticFeedback,
  TOUCH_TARGET_SIZE,
} from "@/lib/mobile-utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

interface MobileCollapsibleNavProps {
  user?: any;
  notificationCount?: number;
  onLogout?: () => void;
}

export default function MobileCollapsibleNav({
  user,
  notificationCount = 0,
  onLogout,
}: MobileCollapsibleNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboards/student",
      icon: Home,
      description: "Your learning overview",
    },
    {
      label: "My Courses",
      href: "/courses",
      icon: BookOpen,
      description: "Browse and manage courses",
    },
    {
      label: "Assignments",
      href: "/assignments",
      icon: Calendar,
      description: "View deadlines and tasks",
    },
    {
      label: "Achievements",
      href: "/achievements",
      icon: Award,
      description: "Track your progress",
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: notificationCount,
      description: "View updates",
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      description: "Manage your account",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      description: "Preferences and options",
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isMobile()) {
      triggerHapticFeedback("light");
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
    if (isMobile()) {
      triggerHapticFeedback("medium");
    }
  };

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 md:hidden"
        style={{
          minWidth: `${TOUCH_TARGET_SIZE.RECOMMENDED}px`,
          minHeight: `${TOUCH_TARGET_SIZE.RECOMMENDED}px`,
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
        {notificationCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-in fade-in duration-200"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Collapsible Navigation Menu */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg truncate">
                  {user?.name || "Student"}
                </h2>
                <p className="text-sm text-blue-100 truncate">
                  {user?.email || "student@example.com"}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-30 transition-all duration-200"
                style={{ minHeight: `${TOUCH_TARGET_SIZE.MIN}px` }}
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                      style={{
                        minHeight: `${TOUCH_TARGET_SIZE.RECOMMENDED}px`,
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              isActive ? "text-blue-600" : "text-gray-900"
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {item.badge > 9 ? "9+" : item.badge}
                          </Badge>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                handleNavClick();
                onLogout?.();
              }}
              style={{ minHeight: `${TOUCH_TARGET_SIZE.RECOMMENDED}px` }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}
