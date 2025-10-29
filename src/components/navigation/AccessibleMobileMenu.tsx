/**
 * Accessible Mobile Menu Component
 * Provides touch-friendly navigation with proper ARIA attributes and keyboard support
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useFocusTrap,
  useEscapeKey,
  useAnnouncer,
} from "@/lib/hooks/useKeyboardNavigation";
import { AriaUtils } from "@/lib/accessibility";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  } | null;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "🏠",
    description: "Go to homepage",
  },
  {
    href: "/courses",
    label: "Courses",
    icon: "📚",
    description: "Browse available courses",
  },
  {
    href: "/about",
    label: "About",
    icon: "👤",
    description: "Learn about us",
  },
  {
    href: "/stories",
    label: "Stories",
    icon: "📄",
    description: "Read success stories",
  },
  {
    href: "/contact",
    label: "Contact",
    icon: "📞",
    description: "Get in touch",
  },
];

export default function AccessibleMobileMenu({
  isOpen,
  onClose,
  user,
}: MobileMenuProps) {
  const menuRef = useFocusTrap(isOpen);
  const announce = useAnnouncer();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  // Close menu on escape key
  useEscapeKey(onClose, isOpen);

  // Announce menu state changes
  useEffect(() => {
    if (isOpen) {
      announce("Mobile menu opened", "polite");
      // Focus first item after animation
      setTimeout(() => {
        itemRefs.current[0]?.focus();
        setFocusedIndex(0);
      }, 150);
    } else {
      announce("Mobile menu closed", "polite");
      setFocusedIndex(-1);
    }
  }, [isOpen, announce]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        const nextIndex =
          focusedIndex < items.length - 1 ? focusedIndex + 1 : 0;
        setFocusedIndex(nextIndex);
        items[nextIndex]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        const prevIndex =
          focusedIndex > 0 ? focusedIndex - 1 : items.length - 1;
        setFocusedIndex(prevIndex);
        items[prevIndex]?.focus();
        break;
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        const lastIndex = items.length - 1;
        setFocusedIndex(lastIndex);
        items[lastIndex]?.focus();
        break;
    }
  };

  const handleItemClick = (href: string) => {
    onClose();
    announce(`Navigating to ${href}`, "polite");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out"
        role="navigation"
        aria-label="Mobile navigation menu"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">KM</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text-primary">
                Menu
              </h2>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px]"
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <ul role="list" className="space-y-2 px-4">
            {navigationItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors min-h-[56px] group"
                  aria-describedby={
                    item.description ? `nav-desc-${index}` : undefined
                  }
                >
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-brand-text-primary group-hover:text-brand-primary transition-colors">
                      {item.label}
                    </span>
                    {item.description && (
                      <p
                        id={`nav-desc-${index}`}
                        className="text-sm text-brand-text-secondary mt-1"
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* User Section */}
          {user ? (
            <div className="mt-8 px-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Account
                </h3>

                {/* User Profile */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-brand-text-secondary capitalize truncate">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Dashboard Link */}
                <Link
                  ref={(el) => {
                    itemRefs.current[navigationItems.length] = el;
                  }}
                  href={`/dashboards/${user.role.toLowerCase()}`}
                  onClick={() =>
                    handleItemClick(`/dashboards/${user.role.toLowerCase()}`)
                  }
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors min-h-[56px] group"
                >
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <span className="text-lg" aria-hidden="true">
                      📊
                    </span>
                  </div>
                  <span className="font-medium text-brand-text-primary group-hover:text-brand-primary transition-colors">
                    Dashboard
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 px-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Account
                </h3>

                <div className="space-y-2">
                  <Link
                    ref={(el) => {
                      itemRefs.current[navigationItems.length] = el;
                    }}
                    href="/auth/login"
                    onClick={() => handleItemClick("/auth/login")}
                    className="flex items-center justify-center w-full p-4 border-2 border-brand-primary text-brand-primary rounded-xl hover:bg-brand-primary/5 focus:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors min-h-[56px] font-medium"
                  >
                    Sign In
                  </Link>

                  <Link
                    ref={(el) => {
                      itemRefs.current[navigationItems.length + 1] = el;
                    }}
                    href="/auth/register"
                    onClick={() => handleItemClick("/auth/register")}
                    className="flex items-center justify-center w-full p-4 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark focus:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors min-h-[56px] font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2024 KM Media Training Institute
          </p>
        </div>
      </nav>
    </>
  );
}
