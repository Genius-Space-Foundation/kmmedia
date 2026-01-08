// Adaptive "My Course" Tab Component
// This replaces both "Courses" and "Applications" tabs with a single adaptive view

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, AlertCircle } from "lucide-react";
import EnrolledCourseView from "./EnrolledCourseView";

interface AdaptiveCourseTabProps {
  // Course catalog data
  courses: any[];
  
  // Application data
  applications: any[];
  
  // Enrollment data
  enrollments: any[];
  
  // Handlers
  onViewCourseDetails: (course: any) => void;
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
  onViewCourseDetails,
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
  
  // STATE 2 & 3: APPLICATION UPDATES - Show application status or payment options
  if (hasApplication) {
    // If there are multiple applications, we might want to show a list or the most relevant one
    // For now, prioritize APPROVED, then UNDER_REVIEW, then PENDING, then REJECTED
    const priorityApp = 
      applications.find((app: any) => app.status === "APPROVED") ||
      applications.find((app: any) => app.status === "UNDER_REVIEW") ||
      applications.find((app: any) => app.status === "PENDING") ||
      applications[0];

    const appStatus = priorityApp.status;

    if (appStatus === "APPROVED") {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Complete Your Enrollment</h2>
          <Card className="border-brand-primary/20 bg-brand-primary/5">
            <CardHeader>
              <CardTitle>{priorityApp.course.title}</CardTitle>
              <CardDescription>Your application has been approved!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Course Price:</span>
                <span className="text-2xl font-bold">{formatCurrency(priorityApp.course.price)}</span>
              </div>
              
              <div className="grid gap-3">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (onShowUnifiedPayment) {
                      onShowUnifiedPayment({
                        amount: priorityApp.course.price,
                        courseId: priorityApp.course.id,
                        courseName: priorityApp.course.title,
                        applicationId: priorityApp.id,
                        type: "TUITION"
                      });
                    } else {
                      onPayTuition(priorityApp.id, "FULL");
                    }
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Full Tuition
                </Button>
                
                {priorityApp.course.installmentEnabled && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (onShowUnifiedPayment) {
                        onShowUnifiedPayment({
                          amount: priorityApp.course.price,
                          courseId: priorityApp.course.id,
                          courseName: priorityApp.course.title,
                          applicationId: priorityApp.id,
                          type: "INSTALLMENT"
                        });
                      } else {
                        onPayTuition(priorityApp.id, "INSTALLMENT");
                      }
                    }}
                  >
                    Pay in Installments
                    {priorityApp.course.installmentPlan && (
                      <span className="ml-2 text-sm">
                        (Start with {priorityApp.course.installmentPlan.upfront}%)
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

    // Handle PENDING, UNDER_REVIEW, REJECTED
    return (
      <div className="space-y-6">
        <Card className={`border-neutral-200 ${appStatus === 'REJECTED' ? 'bg-red-50' : 'bg-neutral-50'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {appStatus === 'REJECTED' ? (
                <AlertCircle className="h-10 w-10 text-red-500" />
              ) : (
                <Clock className="h-10 w-10 text-neutral-500" />
              )}
              <div>
                <CardTitle className="text-neutral-900">
                  {appStatus === 'REJECTED' ? 'Application Rejected' : 'Application Under Review'}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {priorityApp.course.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={
                  appStatus === 'REJECTED' ? "bg-red-100 text-red-800" :
                  appStatus === 'UNDER_REVIEW' ? "bg-blue-100 text-blue-800" :
                  "bg-neutral-100 text-neutral-800"
                }>
                  {appStatus.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="text-gray-900">
                  {new Date(priorityApp.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {appStatus === 'REJECTED' 
                ? priorityApp.reviewNotes || "Your application was not successful at this time. Please contact support for more information."
                : "Your application is being reviewed by our team. You'll receive an email notification once a decision is made."
              }
            </p>
            {appStatus === 'REJECTED' && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {/* Potentially allow re-applying or contacting support */}}
              >
                Contact Support
              </Button>
            )}
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all"
                    onClick={() => onViewCourseDetails(course)}
                  >
                    Details
                  </Button>
                  <Button 
                    className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl shadow-sm" 
                    onClick={() => onApplyForCourse(course.id)}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
