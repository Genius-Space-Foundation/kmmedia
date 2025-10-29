"use client";

import React, { useState } from "react";
import { AssignmentStatusManager } from "@/components/assignments";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

// Mock assignment data
const mockAssignments = [
  {
    id: "1",
    title: "JavaScript Fundamentals Project",
    description:
      "Create a comprehensive web application using vanilla JavaScript. This project should demonstrate your understanding of DOM manipulation, event handling, and asynchronous programming.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalPoints: 100,
    isPublished: true,
    submissionCount: 15,
    gradedCount: 8,
    course: { title: "Introduction to Web Development" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "React Component Library",
    description:
      "Build a reusable component library with proper documentation and testing. Focus on accessibility and performance optimization.",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    totalPoints: 150,
    isPublished: false,
    submissionCount: 0,
    gradedCount: 0,
    course: { title: "React Fundamentals" },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Database Design Assignment",
    description:
      "Design and implement a normalized database schema for an e-commerce platform. Include proper relationships, constraints, and sample data.",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (past due)
    totalPoints: 80,
    isPublished: true,
    submissionCount: 22,
    gradedCount: 22,
    course: { title: "Database Design" },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export default function ManageAssignmentsPage() {
  const [assignments, setAssignments] = useState(mockAssignments);

  const handleEdit = (assignment: any) => {
    console.log("Edit assignment:", assignment);
    alert(`Edit assignment: ${assignment.title}`);
  };

  const handlePreview = (assignment: any) => {
    console.log("Preview assignment:", assignment);
    alert(`Preview assignment: ${assignment.title}`);
  };

  const handlePublish = async (assignmentId: string) => {
    console.log("Publish assignment:", assignmentId);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update local state
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, isPublished: true }
          : assignment
      )
    );

    alert("Assignment published successfully!");
  };

  const handleDelete = async (assignmentId: string) => {
    console.log("Delete assignment:", assignmentId);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update local state
    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== assignmentId)
    );

    alert("Assignment deleted successfully!");
  };

  const handleViewSubmissions = (assignment: any) => {
    console.log("View submissions for:", assignment);
    alert(`View submissions for: ${assignment.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Assignments
            </h1>
            <p className="text-gray-600 mt-2">
              View, edit, and manage all your course assignments.
            </p>
          </div>
          <Link href="/assignments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>

        <AssignmentStatusManager
          assignments={assignments}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onDelete={handleDelete}
          onViewSubmissions={handleViewSubmissions}
        />
      </div>
    </div>
  );
}
