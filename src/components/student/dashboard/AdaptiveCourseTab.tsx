// Adaptive "My Course" Tab Component
// This replaces both "Courses" and "Applications" tabs with a single adaptive view

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CreditCard, BookOpen, AlertCircle } from "lucide-react";

interface AdaptiveCourseTabProps {
  // Course catalog data
  courses: any[];
  
  // Application data
  applications: any[];
  
  // Enrollment data
  enrollments: any[];
  
  // Handlers
  onApplyForCourse: (courseId: string) => void;
  onPayTuition: (applicationId: string, type: "FULL" | "INSTALLMENT") => void;
  
  // Utilities
  formatCurrency: (amount: number) => string;
}

export function AdaptiveCourseTab({
  courses,
  applications,
  enrollments,
  onApplyForCourse,
  onPayTuition,
  formatCurrency,
}: AdaptiveCourseTabProps) {
  
  // Determine current state
  const hasEnrollment = enrollments.length > 0;
  const hasApplication = applications.length > 0;
  const approvedApplication = applications.find((app: any) => app.status === "APPROVED");
  const pendingApplication = applications.find((app: any) => app.status === "PENDING");
  
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
                  {enrollment.course.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Congratulations! You are now enrolled in this course. Start learning today!
            </p>
            <Button asChild className="w-full">
              <a href={`/courses/${enrollment.courseId}/learn`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Go to Course
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // STATE 3: APPROVED - Show payment options
  if (approvedApplication) {
    const app = approvedApplication;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Complete Your Enrollment</h2>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{app.course.title}</CardTitle>
            <CardDescription>Your application has been approved!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Course Price:</span>
              <span className="text-2xl font-bold">{formatCurrency(app.course.price)}</span>
            </div>
            
            <div className="grid gap-3">
              <Button 
                className="w-full" 
                onClick={() => onPayTuition(app.id, "FULL")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Full Tuition
              </Button>
              
              {app.course.installmentEnabled && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onPayTuition(app.id, "INSTALLMENT")}
                >
                  Pay in Installments
                  {app.course.installmentPlan && (
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
                  {app.course.title}
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
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="text-gray-900">
                  {new Date(app.submittedAt).toLocaleDateString()}
                </span>
              </div>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Available Courses</h2>
        <p className="text-gray-600">Browse and apply to start your learning journey</p>
      </div>
      
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{course.duration} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">{formatCurrency(course.price)}</span>
                  </div>
                  {course.cohort && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cohort:</span>
                      <Badge variant="outline">{course.cohort}</Badge>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onApplyForCourse(course.id)}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
