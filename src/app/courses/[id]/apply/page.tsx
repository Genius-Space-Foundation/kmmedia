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
    redirect(`/auth/login?returnUrl=/courses/${id}/apply`);
  }

  // Get user details for prefilling
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
    },
  });

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
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Combine user and profile for prefilling
  const initialUser = user ? {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    phone: user.profile?.phone || user.phone || "",
    address: user.profile?.address || "",
    gender: user.profile?.gender || "",
    dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : "",
  } : null;

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
    <div className="min-h-screen bg-[#FDFDFF] py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header - Professional Minimalist */}
        <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Enrollment Open</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Start Your Journey in <span className="text-brand-primary">{course.title}</span>
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            {course.description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-semibold text-neutral-400 uppercase tracking-tighter">
             <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-neutral-200" />
                <span>Instructor: {course.instructor.firstName} {course.instructor.lastName}</span>
             </div>
             <div className="flex items-center gap-2 border-x border-neutral-200 px-6">
                <span>Tuition: {formatCurrency(course.price)}</span>
             </div>
             <div className="flex items-center gap-2">
                <span>Category: {course.category}</span>
                <div className="w-8 h-px bg-neutral-200" />
             </div>
          </div>
        </div>

        {/* Application Form */}
        <ApplicationForm
          courseId={course.id}
          courseName={course.title}
          applicationFee={course.applicationFee || 0}
          initialUser={initialUser}
          onSuccessRedirect="/dashboards/student"
        />

        {/* Professional Help/Trust Footer */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
           <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm italic">Auto-Optimization</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Your application progress is securely saved every 2 seconds. Feel free to resume whenever you're ready.
              </p>
           </div>
           <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm italic">Secure Payment</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Application fees are processed via 256-bit encrypted global payment gateways for maximum security.
              </p>
           </div>
           <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm italic">Dedicated Support</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Encountering technical difficulties? Contact our admissions support team at <span className="font-bold text-neutral-900">support@kmmedia.edu</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
