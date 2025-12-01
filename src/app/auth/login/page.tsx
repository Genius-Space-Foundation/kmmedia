import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
          {/* <div className="mb-8 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-bold text-neutral-900">
                Student Portal
              </h2>
            </div>
            <p className="text-neutral-600 text-sm">
              Access your courses, track progress, and manage your learning
              journey.
            </p>
          </div> */}
        </div>

        {/* Login Form */}
        <Suspense fallback={<div className="text-center text-neutral-600">Loading form...</div>}>
          <LoginForm />
        </Suspense>

        {/* Registration Link */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-white px-6 py-3 rounded-xl border border-neutral-200 shadow-sm">
            <p className="text-neutral-600 text-sm">
              Don&apos;t have an account?
            </p>
            <a
              href="/auth/register"
              className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Sign up for free
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center pt-6">
          <div className="flex items-center justify-center space-x-6 text-neutral-500">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-xs font-medium">10K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium">Top Rated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
