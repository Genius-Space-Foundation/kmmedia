import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { submissionService } from "@/lib/assignments/submission-service";
import { AssignmentService } from "@/lib/assignments/assignment-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const assignmentId = params.id;
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering and pagination
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "submittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verify user has access to this assignment
    const hasAccess = await AssignmentService.validateInstructorAccess(
      assignmentId,
      session.user.id,
      session.user.role as any
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied. You don't have permission to view these submissions.",
        },
        { status: 403 }
      );
    }

    // Get submissions for the assignment
    const submissions = await submissionService.getSubmissionsByAssignment(
      assignmentId,
      session.user.id,
      session.user.role
    );

    // Apply filters
    let filteredSubmissions = submissions;

    // Filter by status
    if (status && status !== "all") {
      filteredSubmissions = filteredSubmissions.filter(
        (submission) => submission.status === status
      );
    }

    // Filter by search term (student name or email)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter(
        (submission) =>
          submission.student.name.toLowerCase().includes(searchLower) ||
          submission.student.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredSubmissions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "student":
          aValue = a.student.name.toLowerCase();
          bValue = b.student.name.toLowerCase();
          break;
        case "grade":
          aValue = a.grade ?? -1; // Ungraded submissions go to the end
          bValue = b.grade ?? -1;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "submittedAt":
        default:
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = filteredSubmissions.slice(
      startIndex,
      endIndex
    );

    // Calculate statistics
    const stats = {
      total: submissions.length,
      filtered: filteredSubmissions.length,
      submitted: submissions.filter((s) => s.status !== "DRAFT").length,
      graded: submissions.filter((s) => s.status === "GRADED").length,
      pending: submissions.filter(
        (s) => s.status === "SUBMITTED" || s.status === "RESUBMITTED"
      ).length,
      late: submissions.filter((s) => s.isLate).length,
    };

    return NextResponse.json({
      submissions: paginatedSubmissions,
      stats,
      pagination: {
        page,
        limit,
        total: filteredSubmissions.length,
        pages: Math.ceil(filteredSubmissions.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
