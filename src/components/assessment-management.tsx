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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  isPublished: boolean;
  createdAt: string;
  course: {
    title: string;
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
  student: {
    name: string;
    email: string;
  };
  answers: {
    questionId: string;
    answer: string | string[];
    timeSpent: number;
    question: {
      text: string;
      type: string;
      points: number;
    };
  }[];
}

interface AssessmentManagementProps {
  assessments: Assessment[];
  onCreateAssessment: (data: any) => void;
  onUpdateAssessment: (id: string, data: any) => void;
  onDeleteAssessment: (id: string) => void;
  onGradeSubmission: (submissionId: string, data: any) => void;
}

export default function AssessmentManagement({
  assessments,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  onGradeSubmission,
}: AssessmentManagementProps) {
  const [activeTab, setActiveTab] = useState("assessments");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssessmentSubmission | null>(null);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "QUIZ" as const,
    courseId: "",
    totalPoints: 100,
    passingScore: 70,
    timeLimit: 60,
    attempts: 3,
    dueDate: "",
    questions: [] as any[],
  });

  const [gradingData, setGradingData] = useState({
    feedback: "",
    manualScore: 0,
  });

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

  const handleCreateAssessment = () => {
    onCreateAssessment(newAssessment);
    setShowCreateDialog(false);
    setNewAssessment({
      title: "",
      description: "",
      type: "QUIZ",
      courseId: "",
      totalPoints: 100,
      passingScore: 70,
      timeLimit: 60,
      attempts: 3,
      dueDate: "",
      questions: [],
    });
  };

  const handleGradeSubmission = () => {
    if (selectedSubmission) {
      onGradeSubmission(selectedSubmission.id, gradingData);
      setShowGradeDialog(false);
      setGradingData({ feedback: "", manualScore: 0 });
    }
  };

  const handleViewSubmissions = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setActiveTab("submissions");

    try {
      const response = await fetch(
        `/api/instructor/assessments/${assessment.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
        setStatistics(data.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assessment Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Assessment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
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
                    <div className="flex justify-between text-sm">
                      <span>Submissions:</span>
                      <span>{assessment._count.submissions}</span>
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
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSubmissions(assessment)}
                    >
                      View Submissions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onUpdateAssessment(assessment.id, assessment)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteAssessment(assessment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {selectedAssessment && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Submissions for: {selectedAssessment.title}
              </h3>
            </div>
          )}

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.totalSubmissions}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.averageScore}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pass Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.passRate}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.averageTimeSpent} min
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-2">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">
                            {submission.student.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {submission.student.email}
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
                          {submission.score}/
                          {selectedAssessment?.totalPoints || 0} points
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
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowGradeDialog(true);
                          }}
                        >
                          Grade
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Assessment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAssessment.title}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Assessment title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAssessment.type}
                  onValueChange={(value: any) =>
                    setNewAssessment((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAssessment.description}
                onChange={(e) =>
                  setNewAssessment((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Assessment description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalPoints">Total Points</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  value={newAssessment.totalPoints}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      totalPoints: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={newAssessment.passingScore}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      passingScore: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={newAssessment.timeLimit}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="attempts">Max Attempts</Label>
                <Input
                  id="attempts"
                  type="number"
                  value={newAssessment.attempts}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      attempts: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={newAssessment.dueDate}
                onChange={(e) =>
                  setNewAssessment((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAssessment}>
                Create Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm">{selectedSubmission.student.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Score</Label>
                  <p className="text-sm">{selectedSubmission.score} points</p>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={gradingData.feedback}
                  onChange={(e) =>
                    setGradingData((prev) => ({
                      ...prev,
                      feedback: e.target.value,
                    }))
                  }
                  placeholder="Provide feedback to the student"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="manualScore">Manual Score Override</Label>
                <Input
                  id="manualScore"
                  type="number"
                  value={gradingData.manualScore}
                  onChange={(e) =>
                    setGradingData((prev) => ({
                      ...prev,
                      manualScore: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Override automatic score if needed"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGradeDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleGradeSubmission}>
                  Grade Submission
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
