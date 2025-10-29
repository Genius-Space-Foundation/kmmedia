"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";

interface SearchResult {
  id: string;
  title: string;
  type: "course" | "instructor" | "category";
  category?: string;
  instructor?: string;
  url: string;
  description?: string;
  price?: number;
  rating?: number;
  enrollments?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Check for authenticated user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setResults([]);
      setTotalResults(0);
    }
  }, [searchQuery]);

  // Initial search on page load
  useEffect(() => {
    if (initialQuery.trim().length > 2) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
          setTotalResults(data.total);
        }
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const groupedResults = {
    courses: results.filter((r) => r.type === "course"),
    instructors: results.filter((r) => r.type === "instructor"),
    categories: results.filter((r) => r.type === "category"),
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <EnhancedNavigation user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text-primary mb-4">
            Search Results
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search courses, instructors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border-brand-border/30 text-brand-text-primary placeholder-brand-text-muted/60 focus:border-brand-primary/50 text-lg"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-text-muted/60">
                <svg
                  className="w-5 h-5"
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
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-brand-primary"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Results Summary */}
          {searchQuery && (
            <div className="mt-4 text-brand-text-secondary">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                  <span>Searching for "{searchQuery}"...</span>
                </div>
              ) : (
                <span>
                  {totalResults > 0
                    ? `Found ${totalResults} result${
                        totalResults !== 1 ? "s" : ""
                      } for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-8">
            {/* Courses */}
            {groupedResults.courses.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-brand-text-primary mb-4 flex items-center">
                  <span className="mr-2">📚</span>
                  Courses ({groupedResults.courses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedResults.courses.map((result) => (
                    <Card
                      key={result.id}
                      className="card-brand-modern hover:shadow-lg transition-all duration-300 group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                            <span className="text-xl">📚</span>
                          </div>
                          {result.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400 text-sm">
                                ⭐
                              </span>
                              <span className="text-sm font-medium text-brand-text-secondary">
                                {result.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors">
                          {result.title}
                        </CardTitle>
                        <CardDescription className="text-brand-text-secondary">
                          {result.category} • {result.instructor}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.description && (
                          <p className="text-sm text-brand-text-secondary mb-4 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {result.price && (
                            <div className="text-lg font-bold text-brand-text-primary">
                              ₵{result.price.toLocaleString()}
                            </div>
                          )}
                          {result.enrollments && (
                            <div className="text-sm text-brand-text-muted">
                              {result.enrollments} enrolled
                            </div>
                          )}
                        </div>
                        <Link href={result.url} className="mt-4 block">
                          <Button className="w-full btn-brand-primary">
                            View Course
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Instructors */}
            {groupedResults.instructors.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-brand-text-primary mb-4 flex items-center">
                  <span className="mr-2">👨‍🏫</span>
                  Instructors ({groupedResults.instructors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedResults.instructors.map((result) => (
                    <Card
                      key={result.id}
                      className="card-brand-modern hover:shadow-lg transition-all duration-300 group"
                    >
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-secondary/20 transition-colors">
                          <span className="text-2xl">👨‍🏫</span>
                        </div>
                        <CardTitle className="text-lg text-brand-text-primary group-hover:text-brand-secondary transition-colors">
                          {result.title}
                        </CardTitle>
                        <CardDescription className="text-brand-text-secondary">
                          {result.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={result.url}>
                          <Button
                            variant="outline"
                            className="w-full border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
                          >
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {groupedResults.categories.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-brand-text-primary mb-4 flex items-center">
                  <span className="mr-2">📂</span>
                  Categories ({groupedResults.categories.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedResults.categories.map((result) => (
                    <Link key={result.id} href={result.url}>
                      <Card className="card-brand-modern hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-accent/20 transition-colors">
                            <span className="text-xl">📂</span>
                          </div>
                          <h3 className="font-semibold text-brand-text-primary group-hover:text-brand-accent transition-colors mb-1">
                            {result.title}
                          </h3>
                          <p className="text-sm text-brand-text-secondary">
                            {result.category}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-brand-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">
              No results found
            </h2>
            <p className="text-brand-text-secondary mb-6 max-w-md mx-auto">
              We couldn't find anything matching "{searchQuery}". Try adjusting
              your search terms or browse our course categories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button className="btn-brand-primary">
                  Browse All Courses
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-brand-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">
              Search our courses and instructors
            </h2>
            <p className="text-brand-text-secondary mb-6 max-w-md mx-auto">
              Enter a search term above to find courses, instructors, or
              categories that match your interests.
            </p>
            <Link href="/courses">
              <Button className="btn-brand-primary">Browse All Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
