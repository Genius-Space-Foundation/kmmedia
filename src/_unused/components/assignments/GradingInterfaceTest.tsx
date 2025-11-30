"use client";

import React from "react";
import { GradingInterface } from "./GradingInterface";

// Test component to verify the grading interface works
export function GradingInterfaceTest() {
  // This would normally come from the assignment page
  const testAssignmentId = "test-assignment-id";

  const handleGradeSubmitted = (
    submissionId: string,
    grade: number,
    feedback: string
  ) => {
    console.log("Grade submitted:", { submissionId, grade, feedback });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Grading Interface Test</h1>
      <GradingInterface
        assignmentId={testAssignmentId}
        onGradeSubmitted={handleGradeSubmitted}
      />
    </div>
  );
}
