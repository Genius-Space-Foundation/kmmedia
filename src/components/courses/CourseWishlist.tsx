"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import CourseCard from "./CourseCard";
import {
  Heart,
  Share2,
  Trash2,
  BookOpen,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  _count: {
    applications: number;
    enrollments: number;
  };
  averageRating?: number;
  totalReviews?: number;
  isWishlisted?: boolean;
  addedToWishlistAt?: string;
}

interface CourseWishlistProps {
  courses: Course[];
  onRemoveFromWishlist: (courseId: string) => void;
  onClearWishlist: () => void;
  onShareWishlist?: () => void;
  trigger?: React.ReactNode;
}

type SortOption = "dateAdded" | "title" | "price" | "duration" | "rating";
type SortOrder = "asc" | "desc";

export default function CourseWishlist({
  courses,
  onRemoveFromWishlist,
  onClearWishlist,
  onShareWishlist,
  trigger,
}: CourseWishlistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Get unique categories from wishlist
  const categories = Array.from(
    new Set(courses.map((course) => course.category))
  );

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter(
      (course) => filterCategory === "all" || course.category === filterCategory
    )
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "dateAdded":
          const dateA = new Date(a.addedToWishlistAt || 0).getTime();
          const dateB = new Date(b.addedToWishlistAt || 0).getTime();
          comparison = dateA - dateB;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "rating":
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          comparison = ratingA - ratingB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalValue = courses.reduce((sum, course) => sum + course.price, 0);

  if (courses.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Heart className="w-4 h-4 mr-2" />
              Wishlist (0)
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Your Course Wishlist
            </DialogTitle>
            <DialogDescription>
              Save courses you're interested in for later
            </DialogDescription>
          </DialogHeader>
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Start adding courses to your wishlist to keep track of the ones you're interested in."
            action={
              <Button onClick={() => setIsOpen(false)}>Browse Courses</Button>
            }
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            <Heart className="w-4 h-4 mr-2 fill-pink-600" />
            Wishlist ({courses.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Your Course Wishlist
              </DialogTitle>
              <DialogDescription>
                {courses.length} course{courses.length !== 1 ? "s" : ""} saved •
                Total value: ₵{totalValue.toLocaleString()}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {onShareWishlist && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShareWishlist}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearWishlist}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters and Sorting */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dateAdded">Date Added</option>
                    <option value="title">Title</option>
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="h-8 w-8 p-0"
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Active Filters */}
                {filterCategory !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 cursor-pointer"
                    onClick={() => setFilterCategory("all")}
                  >
                    {filterCategory} ×
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {courses.length}
                    </div>
                    <div className="text-sm text-gray-600">Courses Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {categories.length}
                    </div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">₵</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {courses.reduce(
                        (sum, course) => sum + course.duration,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Weeks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          {filteredAndSortedCourses.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No courses match your filters"
              description="Try adjusting your filters to see more courses."
              action={
                <Button onClick={() => setFilterCategory("all")}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard
                    course={course}
                    variant="default"
                    onWishlistToggle={onRemoveFromWishlist}
                  />
                  {/* Added date */}
                  {course.addedToWishlistAt && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-600">
                      Added{" "}
                      {new Date(course.addedToWishlistAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bulk Actions */}
          {filteredAndSortedCourses.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Ready to apply?
                    </h3>
                    <p className="text-sm text-blue-700">
                      You can apply to multiple courses at once to save time.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Compare Selected
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Apply to All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
