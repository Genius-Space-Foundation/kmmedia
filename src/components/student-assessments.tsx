"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("available");
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "bg-blue-100 text-blue-800";
      case "EXAM":
        return "bg-red-100 text-red-800";
      case "ASSIGNMENT":
        return "bg-green-100 text-green-800";
      case "PROJECT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GRADED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Submitted":
        return "bg-yellow-100 text-yellow-800";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assessments</h2>
      </div>

      {/* Assessment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedAssessments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {passedAssessments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageScore.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription>
                        {assessment.course.title}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(assessment.type)}>
                      {assessment.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Points:</span>
                      <span>{assessment.totalPoints}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Passing Score:</span>
                      <span>{assessment.passingScore}%</span>
                    </div>
                    {assessment.timeLimit && (
                      <div className="flex justify-between text-sm">
                        <span>Time Limit:</span>
                        <span>{assessment.timeLimit} min</span>
                      </div>
                    )}
                    {assessment.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span>Due Date:</span>
                        <span>
                          {new Date(assessment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge className={getAssessmentStatusColor(assessment)}>
                        {getAssessmentStatus(assessment)}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    {isAssessmentAvailable(assessment) ? (
                      <Button
                        className="w-full"
                        onClick={() => handleTakeAssessment(assessment)}
                      >
                        Take Assessment
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Not Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="space-y-2">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">
                            {submission.assessment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {submission.assessment.type} •{" "}
                            {submission.assessment.totalPoints} points
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted:{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {submission.score}/{submission.assessment.totalPoints}{" "}
                          points
                        </div>
                        <div className="text-sm text-gray-600">
                          {submission.percentage.toFixed(1)}%
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                          <Badge
                            className={
                              submission.passed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {submission.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewSubmission(submission.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No submissions yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Take Assessment Dialog */}
      <Dialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Assessment</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {selectedAssessment.title}
                </h3>
                <p className="text-gray-600">
                  {selectedAssessment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedAssessment.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Points</Label>
                  <p className="text-sm">{selectedAssessment.totalPoints}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Passing Score</Label>
                  <p className="text-sm">{selectedAssessment.passingScore}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time Limit</Label>
                  <p className="text-sm">
                    {selectedAssessment.timeLimit || "No limit"} min
                  </p>
                </div>
              </div>

              {selectedAssessment.dueDate && (
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm">
                    {new Date(selectedAssessment.dueDate).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• You cannot pause and resume the assessment</li>
                  <li>• Your answers will be automatically saved</li>
                  {selectedAssessment.attempts && (
                    <li>
                      • You have {selectedAssessment.attempts} attempt(s)
                      remaining
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAssessmentDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={confirmTakeAssessment}>
                  Start Assessment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
