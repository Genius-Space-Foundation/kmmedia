"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  FileText,
  Clock,
  Download,
  Mail,
  Copy,
  Share2,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types
interface SubmissionFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
}

interface SubmissionReceipt {
  id: string;
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  instructorName: string;
  submissionText?: string;
  files: SubmissionFile[];
  submittedAt: Date;
  isLate: boolean;
  daysLate: number;
  latePenalty?: number;
  status: "SUBMITTED" | "DRAFT" | "GRADED" | "RETURNED" | "RESUBMITTED";
  confirmationCode: string;
  receiptUrl?: string;
}

interface SubmissionConfirmationProps {
  receipt: SubmissionReceipt;
  isOpen: boolean;
  onClose: () => void;
  onDownloadReceipt?: () => void;
  onEmailReceipt?: () => void;
  onViewSubmission?: () => void;
  className?: string;
}

export function SubmissionConfirmation({
  receipt,
  isOpen,
  onClose,
  onDownloadReceipt,
  onEmailReceipt,
  onViewSubmission,
  className,
}: SubmissionConfirmationProps) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsEmailSent(false);
      setIsCopied(false);
      setIsDownloading(false);
    }
  }, [isOpen]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Copy confirmation code to clipboard
  const copyConfirmationCode = async () => {
    try {
      await navigator.clipboard.writeText(receipt.confirmationCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy confirmation code:", error);
    }
  };

  // Handle email receipt
  const handleEmailReceipt = async () => {
    if (onEmailReceipt) {
      try {
        await onEmailReceipt();
        setIsEmailSent(true);
      } catch (error) {
        console.error("Failed to send email receipt:", error);
      }
    }
  };

  // Handle download receipt
  const handleDownloadReceipt = async () => {
    if (onDownloadReceipt) {
      setIsDownloading(true);
      try {
        await onDownloadReceipt();
      } catch (error) {
        console.error("Failed to download receipt:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Share submission details
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Assignment Submission: ${receipt.assignmentTitle}`,
          text: `I've successfully submitted my assignment "${receipt.assignmentTitle}" for ${receipt.courseTitle}. Confirmation code: ${receipt.confirmationCode}`,
          url: receipt.receiptUrl,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      // Fallback to copying URL
      if (receipt.receiptUrl) {
        await navigator.clipboard.writeText(receipt.receiptUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", className)}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Submission Successful!
              </DialogTitle>
              <DialogDescription>
                Your assignment has been submitted successfully
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="font-medium">
                Assignment submitted successfully!
              </div>
              <div className="text-sm mt-1">
                Submitted on{" "}
                {format(new Date(receipt.submittedAt), "PPP 'at' p")}
                {receipt.isLate && (
                  <span className="ml-2 text-orange-600">
                    (Late submission - {receipt.daysLate} day
                    {receipt.daysLate !== 1 ? "s" : ""} late)
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Late Submission Warning */}
          {receipt.isLate && receipt.latePenalty && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Late Submission Penalty</div>
                <div className="text-sm mt-1">
                  A penalty of {receipt.latePenalty}% will be applied to your
                  grade for this late submission.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Course</div>
                      <div className="font-medium">{receipt.courseTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Assignment</div>
                      <div className="font-medium">
                        {receipt.assignmentTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Instructor</div>
                      <div className="font-medium">
                        {receipt.instructorName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Submitted</div>
                      <div className="font-medium">
                        {format(new Date(receipt.submittedAt), "PPP 'at' p")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Confirmation Code
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {receipt.confirmationCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyConfirmationCode}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {isCopied && (
                          <span className="text-xs text-green-600">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge
                        variant="secondary"
                        className="text-green-700 bg-green-100"
                      >
                        {receipt.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Files */}
          {receipt.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Submitted Files ({receipt.files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receipt.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)} •{" "}
                            {file.fileType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(file.cloudinaryUrl, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Text */}
          {receipt.submissionText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {receipt.submissionText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    Your instructor will review your submission and provide
                    feedback.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    You'll receive an email notification when your assignment is
                    graded.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    Keep your confirmation code ({receipt.confirmationCode}) for
                    your records.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    You can view your submission status anytime in your
                    assignments dashboard.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation */}
          {isEmailSent && (
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-medium">Email receipt sent!</div>
                <div className="text-sm mt-1">
                  A confirmation email has been sent to {receipt.studentEmail}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-wrap gap-2 flex-1">
            {onEmailReceipt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailReceipt}
                disabled={isEmailSent}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isEmailSent ? "Email Sent" : "Email Receipt"}
              </Button>
            )}

            {onDownloadReceipt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download Receipt"}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex gap-2">
            {onViewSubmission && (
              <Button variant="outline" onClick={onViewSubmission}>
                View Submission
              </Button>
            )}

            <Button onClick={onClose}>Done</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Submission Receipt Generator Component
interface SubmissionReceiptProps {
  receipt: SubmissionReceipt;
  className?: string;
}

export function SubmissionReceipt({
  receipt,
  className,
}: SubmissionReceiptProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("max-w-2xl mx-auto bg-white p-8 print:p-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Assignment Submission Receipt
        </h1>
        <div className="text-sm text-gray-500">
          Generated on {format(new Date(), "PPP 'at' p")}
        </div>
      </div>

      {/* Confirmation Code */}
      <div className="text-center mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Confirmation Code</div>
        <div className="text-xl font-mono font-bold text-gray-900">
          {receipt.confirmationCode}
        </div>
      </div>

      {/* Submission Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Student Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{receipt.studentEmail}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Assignment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Course:</span>
                <span className="ml-2 font-medium">{receipt.courseTitle}</span>
              </div>
              <div>
                <span className="text-gray-600">Assignment:</span>
                <span className="ml-2 font-medium">
                  {receipt.assignmentTitle}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Instructor:</span>
                <span className="ml-2 font-medium">
                  {receipt.instructorName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Submission Details
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Submitted:</span>
              <span className="ml-2 font-medium">
                {format(new Date(receipt.submittedAt), "PPP 'at' p")}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">{receipt.status}</span>
            </div>
            {receipt.isLate && (
              <div>
                <span className="text-gray-600">Late Submission:</span>
                <span className="ml-2 font-medium text-orange-600">
                  {receipt.daysLate} day{receipt.daysLate !== 1 ? "s" : ""} late
                  {receipt.latePenalty && ` (${receipt.latePenalty}% penalty)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Files */}
        {receipt.files.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Submitted Files ({receipt.files.length})
            </h3>
            <div className="space-y-2">
              {receipt.files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {file.originalName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)} •{" "}
                      {file.fileType.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Text */}
        {receipt.submissionText && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Additional Comments
            </h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              {receipt.submissionText}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>
          This is an official submission receipt. Keep this for your records.
        </p>
        <p className="mt-1">
          For questions about this submission, contact your instructor or
          reference confirmation code: {receipt.confirmationCode}
        </p>
      </div>
    </div>
  );
}
