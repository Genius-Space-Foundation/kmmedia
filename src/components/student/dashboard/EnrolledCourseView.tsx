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
  X,
  Video,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import QuizTakingInterface from "@/components/student/quiz/QuizTakingInterface";
import { StudentCourseSkeleton } from "@/components/ui/DashboardSkeletons";


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
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLessonViewerOpen, setIsLessonViewerOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isQuizInterfaceOpen, setIsQuizInterfaceOpen] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

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

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/student/lessons/${lessonId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchCourseContent();
      } else {
        toast.error("Failed to mark lesson as complete");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast.error("Failed to mark lesson as complete");
    }
  };

  const handleTakeQuiz = async (assessmentId: string) => {
    setLoadingAssessment(true);
    try {
      const response = await fetch(`/api/student/assessments/${assessmentId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedAssessment(data.data);
        setIsQuizInterfaceOpen(true);
      } else {
        toast.error(data.message || "Failed to load assessment");
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
      toast.error("Failed to load assessment");
    } finally {
      setLoadingAssessment(false);
    }
  };

  const handleSubmitQuiz = async (answers: Map<string, any>, timeSpent: number) => {
    try {
      // Convert Map to object for API
      const answersObject: Record<string, any> = {};
      answers.forEach((value, key) => {
        answersObject[key] = value;
      });

      const response = await fetch(`/api/student/assessments/${selectedAssessment.id}/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: answersObject,
          timeSpent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchCourseContent(); // Refresh to show updated stats
        setIsQuizInterfaceOpen(false);
        setSelectedAssessment(null);
      } else {
        toast.error(data.message || "Failed to submit assessment");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error; // Re-throw so QuizTakingInterface can handle it
    }
  };

  const handleSaveQuizDraft = async (answers: Map<string, any>) => {
    // For now, we'll just save to localStorage
    // You can implement a proper draft API endpoint later
    try {
      const answersObject: Record<string, any> = {};
      answers.forEach((value, key) => {
        answersObject[key] = value;
      });
      localStorage.setItem(
        `quiz_draft_${selectedAssessment.id}`,
        JSON.stringify(answersObject)
      );
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  if (loading) {
    return <StudentCourseSkeleton />;
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
      <Card className="border-brand-primary/20 bg-brand-primary/5">
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
                {course.startDate && course.endDate && (
                  <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                    Month {Math.floor((new Date().getTime() - new Date(course.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000)) + 1} of 6
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-brand-primary">
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
        <Card className="border-brand-primary/20 bg-brand-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary">Continue Learning</p>
                  <p className="text-sm text-neutral-700">{nextLesson.title}</p>
                </div>
              </div>
              <Button onClick={() => onLessonClick(nextLesson.id)} className="bg-brand-primary hover:bg-brand-secondary">
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
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setIsLessonViewerOpen(true);
                              onLessonClick(lesson.id);
                            }}
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
        <TabsContent value="assignments" className="mt-6 space-y-3">
          {!courseContent?.assignments || courseContent.assignments.length === 0 ? (
            <Card className="border-brand-primary/20 bg-brand-primary/5">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 mb-4">
                  No assignments posted for this course yet
                </p>
              </CardContent>
            </Card>
          ) : (
            courseContent.assignments.map((assignment: any) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        {assignment.hasSubmission ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-brand-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{assignment.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
                          <span className="flex items-center gap-1 text-red-600">
                            <Clock className="h-3 w-3" />
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          {assignment.hasSubmission && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {assignment.submission.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={assignment.hasSubmission ? "outline" : "default"}
                      size="sm"
                      onClick={() => onAssignmentClick(assignment.id)}
                    >
                      {assignment.hasSubmission ? "View Submission" : "Complete Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="mt-6 space-y-3">
          {!courseContent?.assessments || courseContent.assessments.length === 0 ? (
            <Card className="border-brand-primary/20 bg-brand-primary/5">
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 mb-4">
                  No assessments scheduled for this course yet
                </p>
              </CardContent>
            </Card>
          ) : (
            courseContent.assessments.map((assessment: any) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        {assessment.hasSubmission ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Award className="h-5 w-5 text-brand-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{assessment.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
                          <Badge variant="outline">{assessment.type}</Badge>
                          <span>{assessment.totalPoints} Points</span>
                          {assessment.hasSubmission && (
                            <span className="text-brand-primary font-bold">
                              Score: {assessment.submission.score}/{assessment.totalPoints}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={assessment.hasSubmission ? "outline" : "default"}
                      size="sm"
                      onClick={() => assessment.hasSubmission ? onAssessmentClick(assessment.id) : handleTakeQuiz(assessment.id)}
                      disabled={loadingAssessment}
                      className={!assessment.hasSubmission ? "bg-brand-primary hover:bg-brand-secondary" : ""}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {loadingAssessment ? "Loading..." : assessment.hasSubmission ? "Review Results" : "Take Quiz"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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

      {/* Lesson Viewer Modal - Redesigned */}
      <Dialog open={isLessonViewerOpen} onOpenChange={setIsLessonViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 border-0 bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col">
          {selectedLesson && (
            <>
              {/* Fixed Header */}
              <div className="flex-shrink-0 px-6 py-5 border-b bg-white flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-brand-primary border-brand-primary/30 bg-brand-primary/10 capitalize font-semibold">
                      {selectedLesson.type.toLowerCase()}
                    </Badge>
                    {selectedLesson.duration && (
                      <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedLesson.duration} min
                      </Badge>
                    )}
                    {selectedLesson.isCompleted && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1 border-0 font-semibold">
                        <CheckCircle className="h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {selectedLesson.title}
                  </DialogTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsLessonViewerOpen(false)} 
                  className="flex-shrink-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-0">
                  {/* Video Section */}
                  {selectedLesson.videoUrl && (
                    <div className="w-full bg-black">
                      <div className="aspect-video w-full">
                        <iframe
                          src={selectedLesson.videoUrl.includes('youtube.com') || selectedLesson.videoUrl.includes('youtu.be') 
                            ? `https://www.youtube.com/embed/${selectedLesson.videoUrl.split('v=')[1]?.split('&')[0] || selectedLesson.videoUrl.split('/').pop()}`
                            : selectedLesson.videoUrl
                          }
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedLesson.title}
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="px-6 py-6 space-y-6">
                    {/* Description */}
                    {selectedLesson.description && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-brand-primary" />
                          About This Lesson
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {selectedLesson.description}
                        </p>
                      </div>
                    )}
                      
                    {/* Lesson Content */}
                    {selectedLesson.content && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-brand-primary" />
                          Lesson Materials
                        </h3>
                        <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200">
                          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                            {selectedLesson.content}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resources Section */}
                    {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Download className="h-5 w-5 text-brand-primary" />
                          Learning Resources ({selectedLesson.resources.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedLesson.resources.map((resource: any) => (
                            <a
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-brand-primary hover:shadow-lg transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 p-2.5 bg-neutral-100 rounded-lg group-hover:bg-brand-primary/10 transition-colors">
                                  {resource.type === 'VIDEO' ? (
                                    <Video className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-orange-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">
                                    {resource.name}
                                  </p>
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                                    {resource.type}
                                  </p>
                                </div>
                              </div>
                              <Download className="h-4 w-4 text-neutral-400 group-hover:text-brand-primary transition-colors flex-shrink-0 ml-2" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!selectedLesson.videoUrl && !selectedLesson.content && (!selectedLesson.resources || selectedLesson.resources.length === 0) && (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-base">No lesson content available yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Check back later for updates.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsLessonViewerOpen(false)}
                  className="border-gray-300 hover:bg-white"
                >
                  Close
                </Button>
                <div className="flex items-center gap-3">
                  {!selectedLesson.isCompleted ? (
                    <Button 
                      className="bg-brand-primary hover:bg-brand-secondary text-white px-8 shadow-md hover:shadow-lg transition-all"
                      disabled={completing}
                      onClick={async () => {
                        setCompleting(true);
                        await handleCompleteLesson(selectedLesson.id);
                        setCompleting(false);
                        setIsLessonViewerOpen(false);
                        toast.success("Lesson marked as complete!");
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {completing ? "Saving..." : "Mark as Complete"}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold border-2 border-green-200">
                      <CheckCircle className="h-5 w-5" />
                      <span>Lesson Completed! 🎉</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Taking Interface Modal */}
      <Dialog open={isQuizInterfaceOpen} onOpenChange={setIsQuizInterfaceOpen}>
        <DialogContent className="max-w-6xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
          {selectedAssessment && (
            <div className="flex-1 overflow-y-auto p-6">
              <QuizTakingInterface
                assessment={selectedAssessment}
                onSubmit={handleSubmitQuiz}
                onSaveDraft={handleSaveQuizDraft}
                onClose={() => setIsQuizInterfaceOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
