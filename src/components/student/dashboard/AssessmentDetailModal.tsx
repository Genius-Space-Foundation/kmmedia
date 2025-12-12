"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Clock,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Eye,
  Play,
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "DOCUMENT";
  url: string;
  downloadable: boolean;
}

interface Submission {
  id: string;
  attemptNumber: number;
  submittedAt: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  status: "PENDING" | "GRADED";
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUIZ" | "ASSIGNMENT" | "PROJECT" | "EXAM";
  courseId: string;
  courseName: string;
  dueDate: string;
  points: number;
  duration?: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "OVERDUE";
  instructions: string;
  requirements: string[];
  resources: Resource[];
  submissions?: Submission[];
  allowedAttempts: number;
  attemptsUsed: number;
}

interface AssessmentDetailModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment?: (assessmentId: string) => void;
  onViewSubmission?: (submissionId: string) => void;
}

export default function AssessmentDetailModal({
  assessment,
  isOpen,
  onClose,
  onStartAssessment,
  onViewSubmission,
}: AssessmentDetailModalProps) {
  if (!assessment) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "from-blue-500 to-indigo-600";
      case "ASSIGNMENT":
        return "from-green-500 to-emerald-600";
      case "PROJECT":
        return "from-purple-500 to-violet-600";
      case "EXAM":
        return "from-red-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "GRADED":
        return "bg-green-100 text-green-800 border-green-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const due = new Date(assessment.dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) return { text: "Overdue", urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h remaining`, urgent: days < 2 };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m remaining`, urgent: hours < 24 };
    } else {
      return { text: `${minutes}m remaining`, urgent: true };
    }
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <Badge
                className={`bg-gradient-to-r ${getTypeColor(assessment.type)} text-white border-0`}
              >
                {assessment.type}
              </Badge>
              <Badge className={getStatusColor(assessment.status)}>
                {assessment.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-800">
                {assessment.courseName}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold px-6 pb-4 text-gray-900">
            {assessment.title}
          </h2>
        </div>

        {/* Due Date Card */}
        <div
          className={`p-6 ${
            timeRemaining.urgent
              ? "bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200"
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-b"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  timeRemaining.urgent
                    ? "bg-gradient-to-br from-red-500 to-orange-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                }`}
              >
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(assessment.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-2xl font-bold ${
                  timeRemaining.urgent ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeRemaining.text}
              </p>
              {assessment.duration && (
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {assessment.duration} minutes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Points and Attempts */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50">
          <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {assessment.points}
            </div>
            <div className="text-xs text-gray-600">Points</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {assessment.attemptsUsed} / {assessment.allowedAttempts}
            </div>
            <div className="text-xs text-gray-600">Attempts Used</div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Instructions
          </h3>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">
              {assessment.instructions}
            </p>
          </div>
        </div>

        {/* Requirements */}
        {assessment.requirements && assessment.requirements.length > 0 && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Requirements
            </h3>
            <div className="space-y-2">
              {assessment.requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {assessment.resources && assessment.resources.length > 0 && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Resources
            </h3>
            <div className="space-y-2">
              {assessment.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{resource.name}</p>
                      <p className="text-sm text-gray-600">{resource.type}</p>
                    </div>
                  </div>
                  {resource.downloadable && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission History */}
        {assessment.submissions && assessment.submissions.length > 0 && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Submission History
            </h3>
            <div className="space-y-2">
              {assessment.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Attempt</div>
                      <div className="text-xl font-bold text-gray-900">
                        {submission.attemptNumber}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.status === "GRADED"
                          ? `Score: ${submission.score}/${submission.maxScore}`
                          : "Pending grading"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewSubmission?.(submission.id)}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {assessment.status === "NOT_STARTED" ||
            assessment.status === "IN_PROGRESS" ? (
              <>
                <Button
                  onClick={() => onStartAssessment?.(assessment.id)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {assessment.status === "IN_PROGRESS"
                    ? "Continue Assessment"
                    : "Start Assessment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-12"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
