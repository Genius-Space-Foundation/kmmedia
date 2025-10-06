import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // For now, return mock notifications without database dependency
    const notifications = [
      {
        id: "1",
        title: "New Student Enrollment",
        message: "John Doe enrolled in Film Production Course",
        type: "enrollment",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Assignment Submitted",
        message: "Sarah Wilson submitted assignment for Video Editing",
        type: "assignment",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        title: "Course Approved",
        message: "Your Advanced Cinematography course has been approved",
        type: "course",
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, userId } = body;

    // Mock notification creation - in production this would save to database
    console.log("Creating notification:", { title, message, type, userId });

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      data: {
        id: Date.now().toString(),
        title,
        message,
        type,
        userId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
