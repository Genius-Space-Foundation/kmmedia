import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements with improved visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.1),transparent_50%)] opacity-60"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white/20 rounded-full top-1/4 left-1/4 animate-float"></div>
        <div className="absolute w-3 h-3 bg-white/10 rounded-full top-1/2 right-1/4 animate-float animation-delay-1000"></div>
        <div className="absolute w-2 h-2 bg-white/15 rounded-full bottom-1/4 left-1/3 animate-float animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Brand Header with enhanced styling */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center space-y-6 mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 p-2.5 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Training Institute Logo"
                  className="w-full h-full object-cover rounded-2xl"
              />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tight">
                KM Media
              </h1>
              <p className="text-blue-200/90 text-sm font-semibold tracking-wider uppercase flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <span>Training Institute</span>
              </p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Welcome Section with glassmorphism */}
          <div className="mb-10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome Back!
            </h2>
            <p className="text-blue-100/90 leading-relaxed text-base">
              Sign in to access your learning dashboard and continue your
              journey towards media excellence.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Registration Link with enhanced styling */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
            <p className="text-blue-100/90 text-sm">
              Don&apos;t have an account?
            </p>
            <a
              href="/auth/register"
              className="font-bold text-white hover:text-blue-300 transition-colors relative group"
            >
              <span className="relative z-10">Sign up for free</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center space-x-8 text-blue-200/60">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span className="text-xs font-medium">10K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-xs font-medium">Top Rated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
