import { RegisterForm } from "@/components/forms/register-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements with improved visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.1),transparent_50%)] opacity-60"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white/20 rounded-full top-1/4 left-1/4 animate-float"></div>
        <div className="absolute w-3 h-3 bg-white/10 rounded-full top-1/2 right-1/4 animate-float animation-delay-1000"></div>
        <div className="absolute w-2 h-2 bg-white/15 rounded-full bottom-1/4 left-1/3 animate-float animation-delay-2000"></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Logo and Brand Header with enhanced styling */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center space-y-6 mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 p-2.5 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Training Institute Logo"
                  className="w-full h-full object-cover rounded-2xl"
              />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200 tracking-tight">
                KM Media
              </h1>
              <p className="text-emerald-200/90 text-sm font-semibold tracking-wider uppercase flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <span>Training Institute</span>
              </p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Welcome Section with glassmorphism */}
          <div className="mb-10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-emerald-100/90 leading-relaxed text-base">
              Create your account to access world-class training and join a network of 10,000+ media professionals.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <RegisterForm />

        {/* Login Link with enhanced styling */}
        <div className="text-center pt-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
            <p className="text-emerald-100/90 text-sm">
              Already have an account?
            </p>
            <a
              href="/auth/login"
              className="font-bold text-white hover:text-emerald-300 transition-colors relative group"
            >
              <span className="relative z-10">Sign in here</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-emerald-200/60">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Free to Join</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Verified Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <span className="text-xs font-medium">Expert Instructors</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
