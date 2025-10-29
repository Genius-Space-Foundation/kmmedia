/**
 * Accessible Search Component
 * Provides search functionality with proper ARIA attributes, keyboard navigation, and screen reader support
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useKeyboardNavigation,
  useAnnouncer,
  useClickOutside,
} from "@/lib/hooks/useKeyboardNavigation";
import { AriaUtils } from "@/lib/accessibility";

interface SearchResult {
  id: string;
  title: string;
  type: "course" | "instructor" | "category";
  category?: string;
  instructor?: string;
  url: string;
  description?: string;
}

interface AccessibleSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
  showMobileSearch?: boolean;
  onMobileToggle?: () => void;
}

export default function AccessibleSearch({
  placeholder = "Search courses, instructors...",
  onSearch,
  onResultSelect,
  className = "",
  showMobileSearch = false,
  onMobileToggle,
}: AccessibleSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const resultRefs = useRef<(HTMLLIElement | null)[]>([]);

  const announce = useAnnouncer();
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, isOpen);

  // Generate unique IDs for ARIA relationships
  const searchId = AriaUtils.generateId("search");
  const resultsId = AriaUtils.generateId("search-results");
  const statusId = AriaUtils.generateId("search-status");

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setResults(data.results);
            announce(`${data.results.length} search results found`, "polite");
          }
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        announce("Search failed. Please try again.", "assertive");
      } finally {
        setIsLoading(false);
      }
    },
    [announce]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);

    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen && query) {
          setIsOpen(true);
        } else if (results.length > 0) {
          const newIndex =
            selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(newIndex);
          resultRefs.current[newIndex]?.focus();
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (results.length > 0) {
          const newIndex =
            selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
          setSelectedIndex(newIndex);
          resultRefs.current[newIndex]?.focus();
        }
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        } else if (query.trim()) {
          // Perform full search
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
        break;

      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      case "Home":
        if (isOpen && results.length > 0) {
          e.preventDefault();
          setSelectedIndex(0);
          resultRefs.current[0]?.focus();
        }
        break;

      case "End":
        if (isOpen && results.length > 0) {
          e.preventDefault();
          const lastIndex = results.length - 1;
          setSelectedIndex(lastIndex);
          resultRefs.current[lastIndex]?.focus();
        }
        break;
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onResultSelect) {
      onResultSelect(result);
    } else {
      window.location.href = result.url;
    }

    announce(`Selected ${result.title}`, "polite");
  };

  // Handle focus
  const handleFocus = () => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  // Get result type icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case "course":
        return "📚";
      case "instructor":
        return "👨‍🏫";
      case "category":
        return "📂";
      default:
        return "🔍";
    }
  };

  return (
    <div className={`relative ${className}`} ref={clickOutsideRef}>
      {/* Mobile Search Toggle */}
      {onMobileToggle && (
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 min-h-[44px] min-w-[44px]"
          onClick={onMobileToggle}
          aria-label="Open search"
          aria-expanded={showMobileSearch}
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
      )}

      {/* Desktop Search */}
      <div className="relative hidden md:block" ref={searchRef}>
        <div className="relative">
          <Input
            ref={inputRef}
            id={searchId}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="w-64 h-10 pl-10 pr-4 bg-brand-neutral-50 border-brand-border/30 text-brand-text-primary placeholder-brand-text-muted/60 focus:bg-white focus:border-brand-primary/50 text-sm"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-owns={isOpen ? resultsId : undefined}
            aria-describedby={statusId}
            aria-autocomplete="list"
            aria-activedescendant={
              selectedIndex >= 0 ? `result-${selectedIndex}` : undefined
            }
          />

          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-muted/60">
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

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div
                className="animate-spin w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Search Status (Screen Reader Only) */}
        <div
          id={statusId}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading && "Searching..."}
          {!isLoading &&
            results.length > 0 &&
            `${results.length} results available`}
          {!isLoading &&
            query.length > 2 &&
            results.length === 0 &&
            "No results found"}
        </div>

        {/* Search Results */}
        {isOpen && (query.length > 0 || results.length > 0) && (
          <div
            className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-2xl border border-brand-border/20 overflow-hidden animate-fade-in-up max-h-96 overflow-y-auto z-50"
            role="listbox"
            id={resultsId}
            aria-label="Search results"
          >
            {isLoading ? (
              <div
                className="p-4 text-center text-brand-text-secondary"
                role="status"
                aria-live="polite"
              >
                <div
                  className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-2"
                  aria-hidden="true"
                />
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul role="listbox" ref={resultsRef}>
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    ref={(el) => {
                      resultRefs.current[index] = el;
                    }}
                    id={`result-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    className={`cursor-pointer px-4 py-3 hover:bg-brand-neutral-50 focus:bg-brand-neutral-50 focus:outline-none transition-colors flex items-center space-x-3 min-h-[56px] ${
                      selectedIndex === index ? "bg-brand-neutral-50" : ""
                    }`}
                    onClick={() => handleResultSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    tabIndex={-1}
                  >
                    <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm" aria-hidden="true">
                        {getResultIcon(result.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-brand-text-primary text-sm truncate">
                        {result.title}
                      </h4>
                      <p className="text-xs text-brand-text-secondary truncate">
                        {result.type === "course" &&
                          result.category &&
                          result.instructor &&
                          `${result.category} • ${result.instructor}`}
                        {result.type === "instructor" && "Instructor"}
                        {result.type === "category" && "Category"}
                        {result.description && ` • ${result.description}`}
                      </p>
                    </div>
                  </li>
                ))}

                {/* View All Results */}
                {query.trim() && (
                  <li className="border-t border-brand-border/20">
                    <a
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="flex items-center justify-center w-full py-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 focus:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors min-h-[44px]"
                      role="option"
                    >
                      View all results for "{query}"
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
                    </a>
                  </li>
                )}
              </ul>
            ) : query.length > 2 ? (
              <div className="p-4 text-center text-brand-text-secondary">
                <span className="text-2xl mb-2 block" aria-hidden="true">
                  🔍
                </span>
                No results found for "{query}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="md:hidden py-4 border-t border-brand-border/30">
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pl-10 pr-4 bg-brand-neutral-50 border-brand-border/30 text-brand-text-primary placeholder-brand-text-muted/60 focus:bg-white focus:border-brand-primary/50"
              autoFocus
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-owns={isOpen ? `${resultsId}-mobile` : undefined}
              aria-describedby={`${statusId}-mobile`}
              aria-autocomplete="list"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-muted/60">
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
    </div>
  );
}
