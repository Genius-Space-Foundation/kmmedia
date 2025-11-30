
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoursesTabProps {
  courses: any[];
  courseFilter: {
    search: string;
    category: string;
    difficulty: string;
    priceRange: string;
  };
  setCourseFilter: (filter: any) => void;
  onApplyForCourse: (courseId: string) => void;
}

export default function CoursesTab({
  courses,
  courseFilter,
  setCourseFilter,
  onApplyForCourse,
}: CoursesTabProps) {
  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(courseFilter.search.toLowerCase()) ||
      course.description
        .toLowerCase()
        .includes(courseFilter.search.toLowerCase());
    const matchesCategory =
      courseFilter.category === "ALL" ||
      course.category === courseFilter.category;
    const matchesDifficulty =
      courseFilter.difficulty === "ALL" ||
      course.difficulty === courseFilter.difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <Card className="shadow-sm border border-neutral-200 rounded-xl bg-white">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-brand-primary text-lg">🎯</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Course Catalog
            </CardTitle>
            <CardDescription className="text-gray-600">
              Discover and apply for amazing courses to advance your skills
            </CardDescription>
          </div>
        </div>

        {/* Course Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Search courses..."
            value={courseFilter.search}
            onChange={(e) =>
              setCourseFilter({
                ...courseFilter,
                search: e.target.value,
              })
            }
            className="max-w-xs"
          />
          <Select
            value={courseFilter.category}
            onValueChange={(value: string) =>
              setCourseFilter({ ...courseFilter, category: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
              <SelectItem value="VIDEOGRAPHY">Videography</SelectItem>
              <SelectItem value="EDITING">Editing</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={courseFilter.difficulty}
            onValueChange={(value: string) =>
              setCourseFilter({ ...courseFilter, difficulty: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!Array.isArray(filteredCourses) || filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No courses available at the moment
              </p>
              <p className="text-sm text-gray-400">
                Check back soon for new courses!
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md hover:border-brand-primary transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-neutral-900 group-hover:text-brand-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">👨‍🏫</span>
                      <span className="text-gray-600">
                        {course.instructor.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">⏱️</span>
                      <span className="text-gray-600">
                        {course.duration} weeks
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-500">🎓</span>
                      <span className="text-gray-600">
                        {course.mode.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">💰</span>
                      <span className="text-gray-600">
                        ₵{course.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {course.applicationFee > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Application Fee:</span>{" "}
                        ₵{course.applicationFee.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full py-3 rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                      >
                        📖 View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => onApplyForCourse(course.id)}
                      className="flex-1 btn-brand-professional font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                    >
                      🚀 Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
