"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubmissionHistoryProps {
  assignmentId: string;
  studentId: string;
}

export function SubmissionHistory({ assignmentId, studentId }: SubmissionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No submission history available</p>
      </CardContent>
    </Card>
  );
}