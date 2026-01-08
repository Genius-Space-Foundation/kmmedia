"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboards/admin",
    badge: null,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboards/admin?tab=analytics",
    badge: null,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    href: "/dashboards/admin?tab=users",
    badge: null,
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    href: "/dashboards/admin?tab=courses",
    badge: null,
  },
  {
    id: "applications",
    label: "Applications",
    icon: FileText,
    href: "/dashboards/admin?tab=applications",
    badge: "12", // This would come from props
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    href: "/dashboards/admin?tab=payments",
    badge: null,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/dashboards/admin?tab=notifications",
    badge: "3",
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: Activity,
    href: "/dashboards/admin?tab=audit",
    badge: null,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboards/admin?tab=settings",
    badge: null,
  },
];

export default function Sidebar({
  isCollapsed,
  onToggle,
  className = "",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboards/admin?search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KM</span>
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200/50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href.split("?")[0];
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-10 ${
                isActive
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isCollapsed ? "px-2" : "px-3"}`}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-800"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200/50">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Menu className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


