import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    title: string;
  };
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  submittedAt?: string;
}

interface StudentAssignmentsProps {
  assignments: Assignment[];
  onViewAssignment: (id: string) => void;
  onSubmitAssignment: (id: string) => void;
}

export default function StudentAssignments({
  assignments,
  onViewAssignment,
  onSubmitAssignment,
}: StudentAssignmentsProps) {
  const [activeTab, setActiveTab] = useState("pending");

  const pendingAssignments = assignments.filter(a => a.status === "PENDING");
  const submittedAssignments = assignments.filter(a => a.status === "SUBMITTED");
  const gradedAssignments = assignments.filter(a => a.status === "GRADED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <p className="text-gray-600 mt-1">Track and submit your course assignments</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 rounded-xl">
          <TabsTrigger value="pending" className="rounded-xl">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted" className="rounded-xl">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="graded" className="rounded-xl">
            Graded ({gradedAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <AssignmentList 
            assignments={pendingAssignments} 
            onView={onViewAssignment}
            onSubmit={onSubmitAssignment}
            type="pending"
          />
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          <AssignmentList 
            assignments={submittedAssignments} 
            onView={onViewAssignment}
            type="submitted"
          />
        </TabsContent>

        <TabsContent value="graded" className="mt-6">
          <AssignmentList 
            assignments={gradedAssignments} 
            onView={onViewAssignment}
            type="graded"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentList({ 
  assignments, 
  onView, 
  onSubmit,
  type 
}: { 
  assignments: Assignment[]; 
  onView: (id: string) => void;
  onSubmit?: (id: string) => void;
  type: "pending" | "submitted" | "graded";
}) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          {type === "pending" ? "✅" : type === "submitted" ? "⏳" : "🎉"}
        </div>
        <p className="text-gray-500 text-lg">
          {type === "pending" && "No pending assignments"}
          {type === "submitted" && "No submitted assignments"}
          {type === "graded" && "No graded assignments yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {assignments.map((assignment) => (
        <AssignmentCard 
          key={assignment.id} 
          assignment={assignment} 
          onView={onView}
          onSubmit={onSubmit}
          type={type}
        />
      ))}
    </div>
  );
}

function AssignmentCard({ 
  assignment, 
  onView, 
  onSubmit,
  type 
}: { 
  assignment: Assignment; 
  onView: (id: string) => void;
  onSubmit?: (id: string) => void;
  type: "pending" | "submitted" | "graded";
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date() && type === "pending";
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{assignment.course.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
              </div>
              <Badge className={`${getPriorityColor(assignment.priority)} border`}>
                {assignment.priority}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm">
                <span className={isOverdue ? "text-red-600" : "text-gray-600"}>
                  📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
                {type === "pending" && !isOverdue && daysUntilDue <= 3 && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    {daysUntilDue} days left
                  </Badge>
                )}
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Grade (if graded) */}
              {type === "graded" && assignment.grade !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    🏆 Grade: {assignment.grade}/{assignment.maxGrade}
                  </span>
                  <Badge className={assignment.grade >= (assignment.maxGrade || 100) * 0.7 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {Math.round((assignment.grade / (assignment.maxGrade || 100)) * 100)}%
                  </Badge>
                </div>
              )}

              {/* Submitted Date */}
              {(type === "submitted" || type === "graded") && assignment.submittedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  ✅ Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onView(assignment.id)}
              className="rounded-xl"
            >
              View Details
            </Button>
            {type === "pending" && onSubmit && (
              <Button 
                onClick={() => onSubmit(assignment.id)}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white"
              >
                Submit
              </Button>
            )}
          </div>
        </div>

        {/* Feedback (if graded) */}
        {type === "graded" && assignment.feedback && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-1">Instructor Feedback:</p>
            <p className="text-sm text-blue-800">{assignment.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
