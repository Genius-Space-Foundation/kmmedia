import { MultiStepRegistrationForm } from "@/components/forms/MultiStepRegistrationForm";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo and Brand Header */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-900">KM Media</h1>
              <p className="text-neutral-600 text-sm font-medium">
                Training Institute
              </p>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mb-8 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-brand-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
              Start Your Journey
            </h2>
            <p className="text-neutral-600 leading-relaxed text-sm text-center">
              Create your account to access world-class training and join a
              network of 10,000+ media professionals.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <MultiStepRegistrationForm />

        {/* Login Link */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-white px-6 py-3 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-neutral-600 text-sm">Already have an account?</p>
            <a
              href="/auth/login"
              className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Sign in here
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-500">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Free to Join</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Verified Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="text-xs font-medium">Expert Instructors</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
