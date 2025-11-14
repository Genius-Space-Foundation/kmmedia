"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/ui/notification-bell";

interface CourseCategory {
  name: string;
  slug: string;
  icon: string;
  courseCount: number;
  description: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: "course" | "instructor" | "category";
  category?: string;
  instructor?: string;
  url: string;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

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

  // Memoized search function for better performance
  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.results);
        }
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, performSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
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

  const handleSearchSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-surface/95 backdrop-blur-md border-b border-brand-border shadow-brand-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-lg"
            aria-label="KM Media Training Institute - Go to homepage"
          >
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">KM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-brand-text-primary">
                KM Media
              </h1>
              <p className="text-xs text-brand-text-secondary">
                Training Institute
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button
              asChild
              variant="ghost"
              className="px-4 py-2 text-sm font-medium text-brand-text-primary hover:bg-brand-neutral-100 radius-button"
            >
              <Link href="/">
                <span className="mr-2">🏠</span>
                Home
              </Link>
            </Button>

            {/* Mega Menu for Courses */}
            <div className="relative" ref={megaMenuRef}>
              <Button
                variant="ghost"
                className="px-4 py-2 text-sm font-medium text-brand-text-primary hover:bg-brand-neutral-100 radius-button"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
              >
                <span className="mr-2">📚</span>
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
                          className="flex items-center p-3 rounded-lg hover:bg-brand-neutral-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                          onClick={() => setIsMegaMenuOpen(false)}
                          role="menuitem"
                        >
                          <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-brand-primary/20 transition-colors">
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
              className="px-4 py-2 text-sm font-medium text-brand-text-primary hover:bg-brand-neutral-100 radius-button"
            >
              <Link href="/about">
                <span className="mr-2">👤</span>
                About
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="px-4 py-2 text-sm font-medium text-brand-text-primary hover:bg-brand-neutral-100 radius-button"
            >
              <Link href="/stories">
                <span className="mr-2">📄</span>
                Stories
              </Link>
            </Button>
          </div>

          {/* Search and Auth Section */}
          <div className="flex items-center space-x-3">
            {/* Global Search */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search courses, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                  className="w-64 h-9 pl-10 pr-4 bg-brand-neutral-50 border-brand-border/30 text-brand-text-primary placeholder-brand-text-muted/60 focus:bg-white focus:border-brand-primary/50 text-sm hidden md:block"
                  aria-label="Search courses and instructors"
                  role="searchbox"
                  aria-autocomplete="list"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-muted/60">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen &&
                (searchResults.length > 0 ||
                  isSearching ||
                  searchQuery.length > 2) && (
                  <div
                    className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-2xl border border-brand-border/20 overflow-hidden animate-fade-in-up max-h-96 overflow-y-auto z-50"
                    role="listbox"
                    aria-label="Search results"
                  >
                    {isSearching ? (
                      <div
                        className="p-4 text-center text-brand-text-secondary"
                        role="status"
                        aria-live="polite"
                      >
                        <div
                          className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-2"
                          aria-hidden="true"
                        ></div>
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleSearchSelect(result)}
                            className="w-full px-4 py-3 text-left hover:bg-brand-neutral-50 transition-colors flex items-center space-x-3 focus:outline-none focus:bg-brand-neutral-50"
                            role="option"
                            aria-selected={false}
                            tabIndex={0}
                          >
                            <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-sm" aria-hidden="true">
                                {result.type === "course"
                                  ? "📚"
                                  : result.type === "instructor"
                                  ? "👨‍🏫"
                                  : "📂"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-brand-text-primary text-sm">
                                {result.title}
                              </h4>
                              <p className="text-xs text-brand-text-secondary">
                                {result.type === "course" &&
                                  result.category &&
                                  `${result.category} • ${result.instructor}`}
                                {result.type === "instructor" && "Instructor"}
                                {result.type === "category" && "Category"}
                              </p>
                            </div>
                          </button>
                        ))}

                        {searchQuery.trim() && (
                          <div className="border-t border-brand-border/20 p-2">
                            <Link
                              href={`/search?q=${encodeURIComponent(
                                searchQuery
                              )}`}
                              className="flex items-center justify-center w-full py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                            >
                              View all results for &quot;{searchQuery}&quot;
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
                        )}
                      </div>
                    ) : searchQuery.length > 2 ? (
                      <div className="p-4 text-center text-brand-text-secondary">
                        <span
                          className="text-2xl mb-2 block"
                          aria-hidden="true"
                        >
                          🔍
                        </span>
                        No results found for &quot;{searchQuery}&quot;
                      </div>
                    ) : null}
                  </div>
                )}
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 btn-touch-friendly"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>

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
                <Link href={`/dashboards/${user.role.toLowerCase()}`}>
                  <Button
                    variant="ghost"
                    className="text-brand-text-primary hover:bg-brand-neutral-100 px-3 py-2 text-sm font-medium"
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
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-brand-text-primary hover:bg-brand-neutral-100 px-3 py-2 text-sm font-medium"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild className="btn-brand-primary">
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </>
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

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-brand-border/30">
            <div className="search-mobile">
              <Input
                type="text"
                placeholder="Search courses, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="form-control-mobile w-full pl-10 pr-4 bg-brand-neutral-50 border-brand-border/30 text-brand-text-primary placeholder-brand-text-muted/60 focus:bg-white focus:border-brand-primary/50"
                autoFocus
                aria-label="Search courses and instructors"
                role="searchbox"
              />
              <div className="search-icon">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-navigation-menu"
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          role="navigation"
          aria-label="Mobile navigation menu"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="py-4 border-t border-brand-border/30">
            <div className="flex flex-col space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
                  className="w-full justify-start text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
                  className="w-full justify-start text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
                  className="w-full justify-start text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <span className="mr-2" aria-hidden="true">
                    📄
                  </span>
                  Stories
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
                      className="w-full justify-start text-brand-text-primary hover:bg-brand-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                      <span className="mr-2" aria-hidden="true">
                        📊
                      </span>
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center p-3 mt-2 bg-brand-neutral-50 rounded-lg">
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center mr-3">
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
                    <div className="flex-1">
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
                        className="w-full justify-start border-brand-primary/20 hover:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-start btn-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50">
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
