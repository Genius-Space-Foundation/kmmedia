"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  User,
  BookOpen,
  FileText,
  CreditCard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: "user" | "course" | "application" | "payment";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

interface GlobalSearchProps {
  className?: string;
}

const searchIcons = {
  user: <User className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  application: <FileText className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

export default function GlobalSearch({ className = "" }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual search endpoint
      const response = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);

    // Add to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      const newRecent = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem("admin-recent-searches", JSON.stringify(newRecent));
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery("");
  };

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("admin-recent-searches");
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Trigger */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-gray-500"
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users, courses, applications..."
                className="border-0 focus:ring-0 text-sm"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : query ? (
              results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {searchIcons[result.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      {result.status && (
                        <Badge
                          className={`text-xs ${
                            statusColors[
                              result.status as keyof typeof statusColors
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No results found for "{query}"</p>
                </div>
              )
            ) : (
              <div className="p-4">
                {recentSearches.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((recent, index) => (
                        <div
                          key={index}
                          onClick={() => handleRecentSearch(recent)}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {recent}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Start typing to search...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


