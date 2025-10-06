import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-gradient-hero flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
        {/* Logo and Brand Header */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/20 p-2 shadow-2xl">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Training Institute Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                KM Media
              </h1>
              <p className="text-brand-neutral-100/80 text-sm font-medium tracking-wide uppercase">
                Training Institute
              </p>
              <div className="w-24 h-1 bg-brand-primary-light/50 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Welcome Back!
            </h2>
            <p className="text-brand-neutral-100/90 leading-relaxed">
              Sign in to access your learning dashboard and continue your
              journey towards media excellence.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Registration Link */}
        <div className="text-center">
          <p className="text-brand-neutral-100/80 text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-white hover:text-brand-primary-light transition-colors underline underline-offset-4"
            >
              Sign up for free
            </a>
          </p>
        </div>

        {/* Trust Badge */}
        <div className="text-center pt-6 border-t border-white/20">
          <p className="text-brand-neutral-100/60 text-xs">
            Trusted by media professionals worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
