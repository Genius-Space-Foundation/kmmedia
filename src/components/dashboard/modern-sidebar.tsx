"use client";

import React from "react";
import { LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModernBadge } from "@/components/ui/modern-badge";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | null;
}

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navigationItems: NavItem[];
  brandName: string;
  brandSubtitle: string;
  brandInitials?: string;
  brandLogo?: string;
}

export function ModernSidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  navigationItems,
  brandName,
  brandSubtitle,
  brandInitials,
  brandLogo,
}: ModernSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300",
        isOpen ? "w-72" : "w-20"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              {brandLogo ? (
                <img 
                  src={brandLogo} 
                  alt={brandName} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-brand-primary">{brandInitials}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">{brandName}</h2>
              <p className="text-xs text-gray-500 font-semibold">{brandSubtitle}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-xl hover:bg-gray-100 flex-shrink-0"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all group font-medium",
                isActive
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-blue-600"
                )}
              />
              {isOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <ModernBadge
                      variant={isActive ? "default" : "primary"}
                      className={cn(
                        "text-xs",
                        isActive ? "bg-white/20 text-white border-0" : ""
                      )}
                    >
                      {item.badge}
                    </ModernBadge>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
