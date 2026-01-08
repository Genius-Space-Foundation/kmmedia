import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { formatCurrency } from "@/lib/currency";

interface ApplyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params; // Await params here
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      price: true,
      applicationFee: true,
      status: true,
      instructor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  if (course.status !== "APPROVED" && course.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Course Not Available
          </h1>
          <p className="text-gray-600 mb-4">
            This course is not currently accepting applications.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Other Courses
          </a>
        </div>
      </div>
    );
  }

  // Check if user already has an application
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  });

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Application Already Submitted
          </h1>
          <p className="text-gray-600 mb-4">
            You have already submitted an application for this course.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className="font-medium">{existingApplication.status}</span>
            </p>
            <p className="text-sm text-gray-500">
              Submitted: {existingApplication.submittedAt.toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 space-x-2">
            <a
              href={`/applications/${existingApplication.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Application
            </a>
            <a
              href="/courses"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Apply for {course.title}
              </h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Category: {course.category}</span>
                <span>•</span>
                <span>Instructor: {course.instructor.name}</span>
                <span>•</span>
                <span>Course Fee: {formatCurrency(course.price)}</span>
                {course.applicationFee > 0 && (
                  <>
                    <span>•</span>
                    <span>Application Fee: {formatCurrency(course.applicationFee)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <ApplicationForm
          courseId={course.id}
          courseName={course.title}
          applicationFee={course.applicationFee || 0}
          onSuccessRedirect="/dashboards/student"
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Your application is automatically saved as you fill it out. You can
            leave and return to complete it later.
          </p>
          <div className="space-y-1 text-sm text-blue-600">
            <p>• All fields marked with * are required</p>
            <p>• Your progress is saved automatically every few seconds</p>
            <p>
              • You can use the "Save Now" button to manually save your progress
            </p>
            <p>• Contact support if you encounter any issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
