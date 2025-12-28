// Adaptive "My Course" Tab Component
// This replaces both "Courses" and "Applications" tabs with a single adaptive view

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CreditCard, BookOpen, AlertCircle } from "lucide-react";
import EnrolledCourseView from "./EnrolledCourseView";

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
  onShowUnifiedPayment?: (context: {
    amount: number;
    courseId?: string;
    courseName?: string;
    applicationId?: string;
    type: "TUITION" | "INSTALLMENT";
  }) => void;
  onLessonClick?: (lessonId: string) => void;
  onAssignmentClick?: (assignmentId: string) => void;
  onAssessmentClick?: (assessmentId: string) => void;
  
  // Utilities
  formatCurrency: (amount: number) => string;
}

export function AdaptiveCourseTab({
  courses,
  applications,
  enrollments,
  onApplyForCourse,
  onPayTuition,
  onShowUnifiedPayment,
  onLessonClick = () => {},
  onAssignmentClick = () => {},
  onAssessmentClick = () => {},
  formatCurrency,
}: AdaptiveCourseTabProps) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(enrollments[0]?.id || "");
  
  // Ensure selectedEnrollmentId is valid
  useEffect(() => {
    if (enrollments.length > 0 && (!selectedEnrollmentId || !enrollments.find(e => e.id === selectedEnrollmentId))) {
      setSelectedEnrollmentId(enrollments[0].id);
    }
  }, [enrollments, selectedEnrollmentId]);
  
  // Determine current state
  const hasEnrollment = enrollments.length > 0;
  const hasApplication = applications.length > 0;
  const approvedApplication = applications.find((app: any) => app.status === "APPROVED");
  const pendingApplication = applications.find((app: any) => app.status === "PENDING");
  
  // STATE 4: ENROLLED - Show full course content
  if (hasEnrollment) {
    const enrollment = enrollments.find(e => e.id === selectedEnrollmentId) || enrollments[0];
    return (
      <div className="space-y-6">
        {enrollments.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {enrollments.map((e: any) => (
              <Button
                key={e.id}
                variant={selectedEnrollmentId === e.id ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap rounded-xl"
                onClick={() => setSelectedEnrollmentId(e.id)}
              >
                {e.course.title}
              </Button>
            ))}
          </div>
        )}
        <EnrolledCourseView
          enrollment={enrollment}
          onLessonClick={onLessonClick}
          onAssignmentClick={onAssignmentClick}
          onAssessmentClick={onAssessmentClick}
        />
        
        {/* Still show catalog below if needed, or in a separate space */}
      </div>
    );
  }
  
  // STATE 3: APPROVED - Show payment options
  if (approvedApplication) {
    const app = approvedApplication;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Complete Your Enrollment</h2>
        <Card className="border-brand-primary/20 bg-brand-primary/5">
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
                onClick={() => {
                  if (onShowUnifiedPayment) {
                    onShowUnifiedPayment({
                      amount: app.course.price,
                      courseId: app.course.id,
                      courseName: app.course.title,
                      applicationId: app.id,
                      type: "TUITION"
                    });
                  } else {
                    onPayTuition(app.id, "FULL");
                  }
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Full Tuition
              </Button>
              
              {app.course.installmentEnabled && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (onShowUnifiedPayment) {
                      onShowUnifiedPayment({
                        amount: app.course.price,
                        courseId: app.course.id,
                        courseName: app.course.title,
                        applicationId: app.id,
                        type: "INSTALLMENT"
                      });
                    } else {
                      onPayTuition(app.id, "INSTALLMENT");
                    }
                  }}
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
        <Card className="border-neutral-200 bg-neutral-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-neutral-500" />
              <div>
                <CardTitle className="text-neutral-900">Application Under Review</CardTitle>
                <CardDescription className="text-neutral-600">
                  {app.course.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-neutral-100 text-neutral-800">
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
          {courses.filter((course: any) => {
            // FILTER: Check if enrollment deadline has passed
            if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) return false;
            
            // FILTER: Check for cohort overlaps
            if (course.startDate) {
              const cohortStart = new Date(course.startDate);
              const cohortEnd = course.endDate ? new Date(course.endDate) : new Date(cohortStart.getTime() + 180 * 24 * 60 * 60 * 1000);
              
              const hasOverlap = enrollments.some((e: any) => {
                if (!e.course.startDate) return false;
                const eStart = new Date(e.course.startDate);
                const eEnd = e.course.endDate ? new Date(e.course.endDate) : new Date(eStart.getTime() + 180 * 24 * 60 * 60 * 1000);
                return (eStart <= cohortStart && eEnd >= cohortStart) || (eStart >= cohortStart && eStart <= cohortEnd);
              });
              
              if (hasOverlap) return false;
            }
            return true;
          }).map((course: any) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow border-neutral-200">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-brand-primary border-brand-primary/20 bg-brand-primary/5">
                    {course.cohort || "Upcoming"}
                  </Badge>
                  {course.enrollmentDeadline && (
                    <span className="text-[10px] text-neutral-500 font-medium">
                      Deadline: {new Date(course.enrollmentDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
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
                  {course.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starts:</span>
                      <span className="text-brand-primary font-medium">{new Date(course.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white rounded-xl shadow-sm" 
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
