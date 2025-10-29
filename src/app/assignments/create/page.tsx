"use client";

import React, { useState } from "react";
import { AssignmentCreator } from "@/components/assignments";
import { UploadedFile } from "@/components/ui/file-upload";

// Mock data for demonstration
const mockCourses = [
  { id: "1", title: "Introduction to Web Development" },
  { id: "2", title: "Advanced JavaScript" },
  { id: "3", title: "React Fundamentals" },
  { id: "4", title: "Database Design" },
];

interface AssignmentFormData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxFileSize: number;
  allowedFormats: string[];
  maxFiles: number;
  allowLateSubmission: boolean;
  latePenalty?: number;
  totalPoints: number;
  courseId: string;
}

export default function CreateAssignmentPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (
    data: AssignmentFormData & { attachments?: UploadedFile[] }
  ) => {
    setIsLoading(true);

    // Simulate API call
    console.log("Saving assignment:", data);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Assignment saved successfully!");
    setIsLoading(false);
  };

  const handlePublish = async (
    data: AssignmentFormData & { attachments?: UploadedFile[] }
  ) => {
    setIsLoading(true);

    // Simulate API call
    console.log("Publishing assignment:", data);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Assignment published successfully!");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Assignment
          </h1>
          <p className="text-gray-600 mt-2">
            Create a comprehensive assignment with file submissions, due dates,
            and grading criteria.
          </p>
        </div>

        <AssignmentCreator
          courses={mockCourses}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
