"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trophy,
  AlertCircle, 
  Calendar, 
  Timer, 
  Award,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  attempts?: number;
  dueDate?: string;
  course: {
    title: string;
  };
  instructor: {
    name: string;
  };
  _count: {
    submissions: number;
  };
}

interface AssessmentSubmission {
  id: string;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  submittedAt: string;
  status: "PENDING" | "GRADED";
  assessment: {
    title: string;
    type: string;
    totalPoints: number;
    passingScore: number;
  };
}

interface StudentAssessmentsProps {
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  onTakeAssessment: (assessmentId: string) => void;
  onViewSubmission: (submissionId: string) => void;
}

export default function StudentAssessments({
  assessments,
  submissions,
  onTakeAssessment,
  onViewSubmission,
}: StudentAssessmentsProps) {
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "EXAM":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ASSIGNMENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PROJECT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GRADED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isAssessmentAvailable = (assessment: Assessment) => {
    // Check if due date has passed
    if (assessment.dueDate && new Date(assessment.dueDate) < new Date()) {
      return false;
    }

    // Check if student has exceeded attempts
    const studentSubmissions = submissions.filter(
      (s) => s.assessment.title === assessment.title
    );
    if (
      assessment.attempts &&
      studentSubmissions.length >= assessment.attempts
    ) {
      return false;
    }

    return true;
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const studentSubmissions = submissions.filter(
      (s) => s.assessment.title === assessment.title
    );

    if (studentSubmissions.length === 0) {
      return "Not Started";
    }

    const latestSubmission = studentSubmissions[0];
    if (latestSubmission.status === "PENDING") {
      return "Submitted";
    }

    return latestSubmission.passed ? "Passed" : "Failed";
  };

  const getAssessmentStatusColor = (assessment: Assessment) => {
    const status = getAssessmentStatus(assessment);
    switch (status) {
      case "Passed":
        return "bg-emerald-100 text-emerald-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Submitted":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTakeAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowAssessmentDialog(true);
  };

  const confirmTakeAssessment = () => {
    if (selectedAssessment) {
      onTakeAssessment(selectedAssessment.id);
      setShowAssessmentDialog(false);
    }
  };

  const totalAssessments = assessments.length;
  const completedAssessments = submissions.filter(
    (s) => s.status === "GRADED"
  ).length;
  const passedAssessments = submissions.filter((s) => s.passed).length;
  const averageScore =
    submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.percentage, 0) /
        submissions.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Assessments</h2>
          <p className="text-muted-foreground mt-1">
            Track your progress and complete your quizzes and exams
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Total Assessments</span>
                <span className="text-2xl font-bold">{totalAssessments}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <span className="text-2xl font-bold">{completedAssessments}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Passed</span>
                <span className="text-2xl font-bold">{passedAssessments}</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Average Score</span>
                <span className="text-2xl font-bold">{averageScore.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const status = getAssessmentStatus(assessment);
          const submission = submissions.find(s => s.assessment.title === assessment.title);
          
          return (
            <Card
              key={assessment.id}
              className="group flex flex-col h-full hover:shadow-lg transition-all duration-300 border-gray-200"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className={cn("mb-2", getTypeColor(assessment.type))}>
                      {assessment.type}
                    </Badge>
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {assessment.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {assessment.course.title}
                    </CardDescription>
                  </div>
                  {status !== "Not Started" && (
                    <Badge className={getAssessmentStatusColor(assessment)}>
                      {status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>{assessment.totalPoints} pts</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pass: {assessment.passingScore}%</span>
                  </div>
                  {assessment.timeLimit && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      <span>{assessment.timeLimit} min</span>
                    </div>
                  )}
                  {assessment.dueDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(assessment.dueDate), "MMM d")}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t bg-gray-50/50 gap-2">
                {submission ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onViewSubmission(submission.id)}
                  >
                    View Results
                  </Button>
                ) : null}
                
                {isAssessmentAvailable(assessment) && (
                  <Button
                    className={cn("w-full bg-blue-600 hover:bg-blue-700", submission ? "flex-1" : "")}
                    onClick={() => handleTakeAssessment(assessment)}
                  >
                    {submission ? "Retake" : "Start Assessment"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                {!isAssessmentAvailable(assessment) && !submission && (
                  <Button className="w-full" variant="secondary" disabled>
                    Not Available
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Take Assessment Dialog */}
      <Dialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Take Assessment</DialogTitle>
            <DialogDescription>
              Please review the details below before starting.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  {selectedAssessment.title}
                </h3>
                <p className="text-muted-foreground">
                  {selectedAssessment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</span>
                  <p className="font-medium">{selectedAssessment.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</span>
                  <p className="font-medium">{selectedAssessment.totalPoints}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pass Score</span>
                  <p className="font-medium">{selectedAssessment.passingScore}%</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Limit</span>
                  <p className="font-medium">
                    {selectedAssessment.timeLimit ? `${selectedAssessment.timeLimit} min` : "None"}
                  </p>
                </div>
              </div>

              {selectedAssessment.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-100">
                  <Clock className="w-4 h-4" />
                  <span>Due by {format(new Date(selectedAssessment.dueDate), "PPP p")}</span>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Instructions
                </h4>
                <ul className="text-sm text-amber-700 space-y-1.5 list-disc list-inside">
                  <li>Ensure you have a stable internet connection</li>
                  <li>Do not refresh the page during the assessment</li>
                  <li>Your progress will be saved automatically</li>
                  {selectedAssessment.attempts && (
                    <li>
                      You have <strong>{selectedAssessment.attempts}</strong> attempt(s) remaining
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAssessmentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmTakeAssessment} className="bg-blue-600 hover:bg-blue-700">
              Start Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
