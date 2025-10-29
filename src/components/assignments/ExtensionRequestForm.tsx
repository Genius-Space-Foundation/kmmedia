"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Assignment, AssignmentExtension } from "@prisma/client";

interface ExtensionRequestFormProps {
  assignment: Assignment;
  existingExtension?: AssignmentExtension;
  onSubmit: (data: { newDueDate: Date; reason: string }) => Promise<void>;
  onCancel: () => void;
}

export function ExtensionRequestForm({
  assignment,
  existingExtension,
  onSubmit,
  onCancel,
}: ExtensionRequestFormProps) {
  const [newDueDate, setNewDueDate] = useState(
    existingExtension?.newDueDate
      ? new Date(existingExtension.newDueDate).toISOString().split("T")[0]
      : ""
  );
  const [reason, setReason] = useState(existingExtension?.reason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newDueDate || !reason.trim()) {
      setError(
        "Please provide both a new due date and reason for the extension."
      );
      return;
    }

    const requestedDate = new Date(newDueDate);
    const originalDueDate = new Date(assignment.dueDate);

    if (requestedDate <= originalDueDate) {
      setError("The new due date must be after the original due date.");
      return;
    }

    if (requestedDate <= new Date()) {
      setError("The new due date must be in the future.");
      return;
    }

    if (reason.trim().length < 10) {
      setError(
        "Please provide a more detailed reason (at least 10 characters)."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        newDueDate: requestedDate,
        reason: reason.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit extension request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {existingExtension
            ? "Update Extension Request"
            : "Request Assignment Extension"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {assignment.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Original Due: {formatDate(new Date(assignment.dueDate))}
                </span>
              </div>
            </div>
          </div>

          {existingExtension && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You currently have an extension until{" "}
                {formatDate(new Date(existingExtension.newDueDate))}. You can
                update your request below.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Due Date */}
            <div className="space-y-2">
              <Label htmlFor="newDueDate">Requested New Due Date</Label>
              <Input
                id="newDueDate"
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date(assignment.dueDate).toISOString().slice(0, 16)}
                required
              />
              <p className="text-sm text-gray-500">
                Must be after the original due date:{" "}
                {formatDate(new Date(assignment.dueDate))}
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Extension</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed explanation for why you need an extension..."
                rows={4}
                required
                minLength={10}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {reason.length}/500 characters (minimum 10 required)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? "Submitting..."
                  : existingExtension
                  ? "Update Request"
                  : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
