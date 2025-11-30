"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Calendar,
  Award,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { isMobile, getCurrentBreakpoint } from "@/lib/mobile-utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

interface MobileNavigationMenuProps {
  user?: any;
  notificationCount?: number;
  onLogout?: () => void;
}

export default function MobileNavigationMenu({
  user,
  notificationCount = 0,
  onLogout,
}: MobileNavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

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

  const navigationItems: NavigationItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      href: "/dashboards/student",
    },
    {
      id: "courses",
      label: "My Courses",
      icon: BookOpen,
      href: "/dashboards/student?tab=learning",
    },
    {
      id: "deadlines",
      label: "Deadlines",
      icon: Calendar,
      href: "/dashboards/student?tab=deadlines",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Award,
      href: "/dashboards/student?tab=achievements",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
      badge: notificationCount,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/dashboards/student?tab=profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboards/student?tab=settings",
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  return (
    <>
      {/* Mobile Menu Toggle Button - Touch-friendly size */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg rounded-full"
        style={{ minWidth: "44px", minHeight: "44px" }}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">
                  {user?.name || "Student"}
                </h2>
                <p className="text-sm text-blue-100 truncate">
                  {user?.email || "student@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  {item.children ? (
                    // Expandable item
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ minHeight: "44px" }}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-700">
                            {item.label}
                          </span>
                        </div>
                        {expandedItems.includes(item.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {expandedItems.includes(item.id) && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.href}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                                  isActive(child.href)
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                                style={{ minHeight: "44px" }}
                              >
                                <child.icon className="h-4 w-4" />
                                <span className="text-sm">{child.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Regular link item
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      style={{ minHeight: "44px" }}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {item.badge > 99 ? "99+" : item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              style={{ minHeight: "44px" }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
