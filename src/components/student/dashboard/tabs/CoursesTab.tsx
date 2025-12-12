import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, CreditCard, BookOpen, AlertCircle } from "lucide-react";

interface CoursesTabProps {
  courses: any[];
  applications: any[];
  enrollments: any[];
  courseFilter: {
    search: string;
    category: string;
    difficulty: string;
    priceRange: string;
  };
  setCourseFilter: (filter: any) => void;
  onApplyForCourse: (courseId: string) => void;
  onPayTuition?: (applicationId: string, type: "FULL" | "INSTALLMENT") => void;
}

export default function CoursesTab({
  courses,
  applications,
  enrollments,
  courseFilter,
  setCourseFilter,
  onApplyForCourse,
  onPayTuition,
}: CoursesTabProps) {
  
  // Determine current state
  const hasEnrollment = enrollments && enrollments.length > 0;
  const hasApplication = applications && applications.length > 0;
  const approvedApplication = applications?.find((app: any) => app.status === "APPROVED");
  const pendingApplication = applications?.find((app: any) => app.status === "PENDING");
  
  // STATE 4: ENROLLED - Show enrollment confirmation
  if (hasEnrollment) {
    const enrollment = enrollments[0];
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <div>
                <CardTitle className="text-green-900">You're Enrolled!</CardTitle>
                <CardDescription className="text-green-700">
                  {enrollment.course?.title || "Course"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Congratulations! You are now enrolled in this course. Start learning today!
            </p>
            <Button asChild className="w-full">
              <Link href={`/courses/${enrollment.courseId}/learn`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Go to Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // STATE 3: APPROVED - Show payment options
  if (approvedApplication && onPayTuition) {
    const app = approvedApplication;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Complete Your Enrollment</h2>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{app.course?.title}</CardTitle>
            <CardDescription>Your application has been approved!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Course Price:</span>
              <span className="text-2xl font-bold">₵{app.course?.price?.toLocaleString()}</span>
            </div>
            
            <div className="grid gap-3">
              <Button 
                className="w-full" 
                onClick={() => onPayTuition(app.id, "FULL")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Full Tuition
              </Button>
              
              {app.course?.installmentEnabled && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onPayTuition(app.id, "INSTALLMENT")}
                >
                  Pay in Installments
                  {app.course?.installmentPlan && (
                    <span className="ml-2 text-sm">
                      (Start with {app.course.installmentPlan.upfront}%)
                    </span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // STATE 2: PENDING - Show application status
  if (pendingApplication) {
    const app = pendingApplication;
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-yellow-600" />
              <div>
                <CardTitle className="text-yellow-900">Application Under Review</CardTitle>
                <CardDescription className="text-yellow-700">
                  {app.course?.title || "Course"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {app.status}
                </Badge>
              </div>
              {app.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="text-gray-900">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Your application is being reviewed by our team. You'll receive an email notification once a decision is made.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // STATE 1: NO APPLICATION - Show course catalog
  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(courseFilter.search.toLowerCase()) ||
      course.description
        .toLowerCase().includes(courseFilter.search.toLowerCase());
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
              Available Courses
            </CardTitle>
            <CardDescription className="text-gray-600">
              Browse and apply to start your learning journey
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
                <AlertCircle className="h-10 w-10 text-gray-400" />
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
                        {course.cohort && (
                          <Badge variant="outline" className="text-xs">
                            {course.cohort}
                          </Badge>
                        )}
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
                        {course.instructor?.name || "Instructor"}
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
                        {course.mode?.join(", ") || "Online"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">💰</span>
                      <span className="text-gray-600">
                        ₵{course.price?.toLocaleString()}
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
