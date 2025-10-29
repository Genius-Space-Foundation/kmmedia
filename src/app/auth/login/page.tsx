import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/1.jpeg"
          alt="KM Media Training Institute Login"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-700/80"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Brand Header */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center space-y-6 mb-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-blue-600">KM</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white">KM Media</h1>
              <p className="text-blue-100 text-sm font-medium">
                Training Institute
              </p>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mb-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              Welcome Back!
            </h2>
            <p className="text-blue-100/90 leading-relaxed text-base text-center">
              Sign in to access your learning dashboard and continue your
              journey towards media excellence.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Registration Link */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
            <p className="text-blue-100/90 text-sm">
              Don&apos;t have an account?
            </p>
            <a
              href="/auth/register"
              className="font-bold text-white hover:text-blue-300 transition-colors"
            >
              Sign up for free
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center space-x-6 text-blue-200/60">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">🔒</span>
              <span className="text-xs font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">👥</span>
              <span className="text-xs font-medium">10K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs font-medium">Top Rated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
