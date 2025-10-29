"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Filter,
  Search,
  X,
  ChevronDown,
  BookOpen,
  Clock,
  DollarSign,
  Star,
  Users,
  Bookmark,
  RotateCcw,
} from "lucide-react";

export interface CourseFilter {
  search: string;
  categories: string[];
  difficulties: string[];
  modes: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  rating: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface CourseFiltersProps {
  filters: CourseFilter;
  onFiltersChange: (filters: CourseFilter) => void;
  totalCourses: number;
  filteredCount: number;
  isLoading?: boolean;
}

const CATEGORIES = [
  "Film & Television",
  "Animation & VFX",
  "Photography",
  "Marketing",
  "Production",
  "Journalism",
  "Design",
  "Audio",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const MODES = ["Online", "Offline", "Hybrid"];
const SORT_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "price", label: "Price" },
  { value: "duration", label: "Duration" },
  { value: "rating", label: "Rating" },
  { value: "enrollments", label: "Popularity" },
  { value: "createdAt", label: "Newest" },
];

const FILTER_PRESETS = [
  {
    name: "Popular Courses",
    filters: {
      search: "",
      categories: [],
      difficulties: [],
      modes: [],
      priceRange: [0, 10000] as [number, number],
      durationRange: [1, 52] as [number, number],
      rating: 4,
      sortBy: "enrollments",
      sortOrder: "desc" as const,
    },
  },
  {
    name: "Beginner Friendly",
    filters: {
      search: "",
      categories: [],
      difficulties: ["Beginner"],
      modes: [],
      priceRange: [0, 5000] as [number, number],
      durationRange: [1, 12] as [number, number],
      rating: 0,
      sortBy: "price",
      sortOrder: "asc" as const,
    },
  },
  {
    name: "Online Only",
    filters: {
      search: "",
      categories: [],
      difficulties: [],
      modes: ["Online"],
      priceRange: [0, 10000] as [number, number],
      durationRange: [1, 52] as [number, number],
      rating: 0,
      sortBy: "title",
      sortOrder: "asc" as const,
    },
  },
];

export default function CourseFilters({
  filters,
  onFiltersChange,
  totalCourses,
  filteredCount,
  isLoading = false,
}: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedSearches, setSavedSearches] = useState<
    Array<{ name: string; filters: CourseFilter }>
  >([]);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("courseFilterSavedSearches");
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved searches:", error);
      }
    }
  }, []);

  // Sync filters with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams();

    if (filters.search) urlParams.set("search", filters.search);
    if (filters.categories.length > 0)
      urlParams.set("categories", filters.categories.join(","));
    if (filters.difficulties.length > 0)
      urlParams.set("difficulties", filters.difficulties.join(","));
    if (filters.modes.length > 0)
      urlParams.set("modes", filters.modes.join(","));
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      urlParams.set("priceMin", filters.priceRange[0].toString());
      urlParams.set("priceMax", filters.priceRange[1].toString());
    }
    if (filters.durationRange[0] > 1 || filters.durationRange[1] < 52) {
      urlParams.set("durationMin", filters.durationRange[0].toString());
      urlParams.set("durationMax", filters.durationRange[1].toString());
    }
    if (filters.rating > 0) urlParams.set("rating", filters.rating.toString());
    if (filters.sortBy !== "title") urlParams.set("sortBy", filters.sortBy);
    if (filters.sortOrder !== "asc")
      urlParams.set("sortOrder", filters.sortOrder);

    const newUrl = urlParams.toString() ? `?${urlParams.toString()}` : "";
    if (newUrl !== window.location.search) {
      router.replace(`/courses${newUrl}`, { scroll: false });
    }
  }, [filters, router]);

  const handleFilterChange = (key: keyof CourseFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayFilterToggle = (key: keyof CourseFilter, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      categories: [],
      difficulties: [],
      modes: [],
      priceRange: [0, 10000],
      durationRange: [1, 52],
      rating: 0,
      sortBy: "title",
      sortOrder: "asc",
    });
  };

  const applyPreset = (preset: (typeof FILTER_PRESETS)[0]) => {
    onFiltersChange(preset.filters);
  };

  const saveCurrentSearch = () => {
    const name = prompt("Enter a name for this search:");
    if (name && name.trim()) {
      const newSavedSearches = [
        ...savedSearches,
        { name: name.trim(), filters },
      ];
      setSavedSearches(newSavedSearches);
      localStorage.setItem(
        "courseFilterSavedSearches",
        JSON.stringify(newSavedSearches)
      );
    }
  };

  const loadSavedSearch = (savedFilters: CourseFilter) => {
    onFiltersChange(savedFilters);
  };

  const deleteSavedSearch = (index: number) => {
    const newSavedSearches = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(newSavedSearches);
    localStorage.setItem(
      "courseFilterSavedSearches",
      JSON.stringify(newSavedSearches)
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.difficulties.length > 0) count++;
    if (filters.modes.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.durationRange[0] > 1 || filters.durationRange[1] < 52) count++;
    if (filters.rating > 0) count++;
    return count;
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                Course Filters
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading courses..."
                  : `Showing ${filteredCount} of ${totalCourses} courses`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses by title, description, or instructor..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange("search", "")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-gray-700">
              Quick filters:
            </Label>
            {FILTER_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="h-8 text-xs border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                {preset.name}
              </Button>
            ))}
          </div>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Filters</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="saved">Saved Searches</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Categories
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {CATEGORIES.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={() =>
                            handleArrayFilterToggle("categories", category)
                          }
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Difficulty
                  </Label>
                  <div className="space-y-2">
                    {DIFFICULTIES.map((difficulty) => (
                      <div
                        key={difficulty}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`difficulty-${difficulty}`}
                          checked={filters.difficulties.includes(difficulty)}
                          onCheckedChange={() =>
                            handleArrayFilterToggle("difficulties", difficulty)
                          }
                        />
                        <Label
                          htmlFor={`difficulty-${difficulty}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          {difficulty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Mode
                  </Label>
                  <div className="space-y-2">
                    {MODES.map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mode-${mode}`}
                          checked={filters.modes.includes(mode)}
                          onCheckedChange={() =>
                            handleArrayFilterToggle("modes", mode)
                          }
                        />
                        <Label
                          htmlFor={`mode-${mode}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          {mode}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Price Range (₵{filters.priceRange[0]} - ₵
                    {filters.priceRange[1]})
                  </Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "priceRange",
                        value as [number, number]
                      )
                    }
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₵0</span>
                    <span>₵10,000+</span>
                  </div>
                </div>

                {/* Duration Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration ({filters.durationRange[0]} -{" "}
                    {filters.durationRange[1]} weeks)
                  </Label>
                  <Slider
                    value={filters.durationRange}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "durationRange",
                        value as [number, number]
                      )
                    }
                    max={52}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 week</span>
                    <span>52+ weeks</span>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Minimum Rating ({filters.rating} stars)
                  </Label>
                  <Slider
                    value={[filters.rating]}
                    onValueChange={(value) =>
                      handleFilterChange("rating", value[0])
                    }
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Any rating</span>
                    <span>5 stars</span>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Sort By
                  </Label>
                  <div className="flex space-x-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        handleFilterChange("sortBy", value)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        handleFilterChange("sortOrder", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Saved Searches
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentSearch}
                  className="h-8 text-xs"
                >
                  <Bookmark className="w-3 h-3 mr-1" />
                  Save Current
                </Button>
              </div>

              {savedSearches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved searches yet</p>
                  <p className="text-xs">
                    Save your current filters to quickly access them later
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedSearches.map((saved, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <button
                        onClick={() => loadSavedSearch(saved.filters)}
                        className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-blue-600"
                      >
                        {saved.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedSearch(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
