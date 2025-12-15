"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Play,
  Lock,
  Award,
  TrendingUp,
} from "lucide-react";

interface EnrolledCourseViewProps {
  enrollment: any;
  onLessonClick: (lessonId: string) => void;
  onAssignmentClick: (assignmentId: string) => void;
  onAssessmentClick: (assessmentId: string) => void;
}

export default function EnrolledCourseView({
  enrollment,
  onLessonClick,
  onAssignmentClick,
  onAssessmentClick,
}: EnrolledCourseViewProps) {
  const [courseContent, setCourseContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lessons");

  useEffect(() => {
    fetchCourseContent();
  }, [enrollment.id]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/enrollments/${enrollment.id}/content`);
      const data = await response.json();
      
      if (data.success) {
        setCourseContent(data.data);
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId: string, timeSpent: number = 0) => {
    try {
      const response = await fetch(`/api/student/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSpent, enrollmentId: enrollment.id }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh course content to update completion status
        fetchCourseContent();
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Failed to load course content</p>
        </CardContent>
      </Card>
    );
  }

  const { course, lessons, stats, nextLesson } = courseContent;

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
              <CardDescription className="text-base">
                {course.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.round(stats.timeSpent / 60)}h spent</span>
                </div>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">
                {stats.progressPercentage}%
              </div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stats.completedLessons} of {stats.totalLessons} lessons completed</span>
              <span className="text-gray-600">{stats.totalLessons - stats.completedLessons} remaining</span>
            </div>
            <Progress value={stats.progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Next Lesson Recommendation */}
      {nextLesson && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Continue Learning</p>
                  <p className="text-sm text-blue-700">{nextLesson.title}</p>
                </div>
              </div>
              <Button onClick={() => onLessonClick(nextLesson.id)} className="bg-blue-600">
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">
            <BookOpen className="h-4 w-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileText className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <Award className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Download className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6 space-y-3">
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No lessons available yet</p>
              </CardContent>
            </Card>
          ) : (
            lessons.map((lesson: any, index: number) => (
              <Card
                key={lesson.id}
                className={`hover:shadow-md transition-shadow ${
                  lesson.isCompleted ? "border-green-200 bg-green-50/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                        {lesson.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : lesson.isPublished ? (
                          <span className="font-semibold text-gray-600">{index + 1}</span>
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {lesson.type}
                          </Badge>
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration} min
                            </span>
                          )}
                          {lesson.isCompleted && lesson.completedAt && (
                            <span className="text-green-600 text-xs">
                              Completed {new Date(lesson.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.isPublished ? (
                        <>
                          <Button
                            variant={lesson.isCompleted ? "outline" : "default"}
                            onClick={() => onLessonClick(lesson.id)}
                          >
                            {lesson.isCompleted ? "Review" : "Start"}
                          </Button>
                          {!lesson.isCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteLesson(lesson.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Assignments are managed in the Assignments section
              </p>
              <Button variant="outline" onClick={() => onAssignmentClick("")}>
                Go to Assignments
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Assessments are managed in the Assessments section
              </p>
              <Button variant="outline" onClick={() => onAssessmentClick("")}>
                Go to Assessments
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6 space-y-3">
          {lessons.some((l: any) => l.resources.length > 0) ? (
            lessons.map((lesson: any) =>
              lesson.resources.length > 0 ? (
                <Card key={lesson.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lesson.resources.map((resource: any) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm">{resource.name}</p>
                            <p className="text-xs text-gray-500">
                              {resource.type}
                              {resource.size && ` • ${(resource.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>
                        {resource.downloadable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={resource.url} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null
            )
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No resources available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
