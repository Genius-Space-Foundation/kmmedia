"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import { NotificationBell } from "@/components/ui/notification-bell";

interface CourseCategory {
  name: string;
  slug: string;
  icon: string;
  courseCount: number;
  description: string;
}



interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface EnhancedNavigationProps {
  user?: User | null;
}

export default function EnhancedNavigation({ user }: EnhancedNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch course categories for mega menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/courses/categories");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.categories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);



  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node)
      ) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-brand-border shadow-brand-sm text-brand-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-xl"
            aria-label="KM Media Training Institute - Go to homepage"
          >
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-brand-primary/10">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Training Institute"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-brand-text-primary leading-tight">
                KM Media
              </h1>
              <p className="text-[10px] sm:text-xs text-brand-text-secondary leading-none">
                Training Institute
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button
              asChild
              variant="ghost"
              className={`px-4 py-2 text-sm font-medium hover:bg-brand-neutral-100 radius-button ${
                isActive("/") 
                  ? "text-brand-primary font-semibold" 
                  : "text-brand-text-primary"
              }`}
            >
              <Link href="/">
                Home
              </Link>
            </Button>

            {/* Mega Menu for Courses */}
            <div className="relative" ref={megaMenuRef}>
              <Button
                variant="ghost"
                className={`px-4 py-2 text-sm font-medium hover:bg-brand-neutral-100 rounded-xl ${
                  isActive("/courses") 
                    ? "text-brand-primary font-semibold" 
                    : "text-brand-text-primary"
                }`}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
              >
                Courses
                <svg
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-brand-border/20 overflow-hidden animate-fade-in-up z-50"
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                  role="menu"
                  aria-label="Course categories menu"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-brand-text-primary mb-2">
                        Course Categories
                      </h3>
                      <p className="text-sm text-brand-text-secondary">
                        Explore our comprehensive course offerings
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.slug}
                          href={`/courses?category=${category.slug}`}
                          className="flex items-center p-3 rounded-xl hover:bg-brand-neutral-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                          onClick={() => setIsMegaMenuOpen(false)}
                          role="menuitem"
                        >
                          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-brand-primary/20 transition-colors">
                            <span className="text-lg" aria-hidden="true">
                              {category.icon}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-text-primary group-hover:text-brand-primary transition-colors">
                              {category.name}
                            </h4>
                            <p className="text-xs text-brand-text-secondary">
                              {category.courseCount} courses •{" "}
                              {category.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-brand-border/20">
                      <Link
                        href="/courses"
                        className="flex items-center justify-center w-full py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        onClick={() => setIsMegaMenuOpen(false)}
                        role="menuitem"
                      >
                        View All Courses
                        <svg
                          className="ml-1 w-4 h-4"
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
                </div>
              )}
            </div>

            <Button
              asChild
              variant="ghost"
              className={`px-4 py-2 text-sm font-medium hover:bg-brand-neutral-100 radius-button ${
                isActive("/about") 
                  ? "text-brand-primary font-semibold" 
                  : "text-brand-text-primary"
              }`}
            >
              <Link href="/about">
                About
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`px-4 py-2 text-sm font-medium hover:bg-brand-neutral-100 radius-button ${
                isActive("/stories") 
                  ? "text-brand-primary font-semibold" 
                  : "text-brand-text-primary"
              }`}
            >
              <Link href="/stories">
                Stories
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`px-4 py-2 text-sm font-medium hover:bg-brand-neutral-100 radius-button ${
                isActive("/contact") 
                  ? "text-brand-primary font-semibold" 
                  : "text-brand-text-primary"
              }`}
            >
              <Link href="/contact">
                Contact
              </Link>
            </Button>
          </div>

          {/* Search and Auth Section */}
          <div className="flex items-center space-x-3">


            {/* Notifications Bell - Only show for authenticated users */}
            {user && (
              <NotificationBell
                userId={user.id}
                className="text-brand-text-primary hover:bg-brand-neutral-100"
              />
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-text-primary hover:bg-brand-neutral-100 p-2 btn-touch-friendly"
              aria-label="Toggle dark mode"
            >
              <span aria-hidden="true">🌙</span>
            </Button>

            {/* User-aware Navigation */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href={`/dashboards/${user.role.toLowerCase()}`} className="hidden lg:block">
                  <Button
                    variant="ghost"
                    className="text-brand-text-primary hover:bg-brand-neutral-100 px-3 py-2 text-sm font-medium rounded-xl"
                  >
                    <span className="mr-2">📊</span>
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button
                    className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center hover:ring-2 hover:ring-brand-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    aria-label={`User menu for ${user.name}`}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  {/* User role indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-secondary rounded-full border-2 border-white">
                    <span className="sr-only">{user.role}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-brand-text-primary hover:bg-brand-neutral-100 px-3 py-2 text-sm font-medium"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild className="btn-brand-primary rounded-xl">
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={
                isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-navigation-menu"
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-y-auto ${
            isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          }`}
          role="navigation"
          aria-label="Mobile navigation menu"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="py-6 border-t border-brand-border/30 px-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    🏠
                  </span>
                  Home
                </Button>
              </Link>
              <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    📚
                  </span>
                  Courses
                </Button>
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    👤
                  </span>
                  About
                </Button>
              </Link>
              <Link href="/stories" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    📄
                  </span>
                  Stories
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    📞
                  </span>
                  Contact
                </Button>
              </Link>

              {/* Mobile User Menu */}
              {user && (
                <div className="pt-4 border-t border-brand-border/30 mt-4">
                  <Link
                    href={`/dashboards/${user.role.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                      <span className="mr-2" aria-hidden="true">
                        📊
                      </span>
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex flex-col items-center p-4 mt-2 bg-brand-neutral-50 rounded-xl">
                    <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mb-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-brand-text-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-brand-text-secondary capitalize">
                        {user.role.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="pt-4 border-t border-brand-border/30 mt-4">
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-center border-brand-primary/20 hover:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-center btn-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
