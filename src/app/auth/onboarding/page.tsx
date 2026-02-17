"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LearningProfileSetup from "@/components/onboarding/LearningProfileSetup";
import CourseRecommendations from "@/components/onboarding/CourseRecommendations";

import PersonalProfileSetup from "@/components/onboarding/PersonalProfileSetup";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

function OnboardingPageContent() {
  const [currentPhase, setCurrentPhase] = useState<
    "intro" | "personal" | "profile" | "recommendations"
  >("intro");
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";

  const phases = [
    { id: "intro", label: "Welcome", title: "Welcome" },
    { id: "personal", label: "Personal", title: "Personal Details" },
    { id: "profile", label: "Learning", title: "Learning Preferences" },
    { id: "recommendations", label: "Ready", title: "Get Started" },
  ];

  const currentStepIndex = phases.findIndex((p) => p.id === currentPhase);

  const handleOnboardingComplete = (data: any) => {
    setProfileData((prev: any) => ({ ...prev, ...data }));
    if (role === "student") {
      setCurrentPhase("personal");
    } else {
      router.push(`/dashboards/${role}`);
    }
  };

  const handlePersonalComplete = (data: any) => {
    setProfileData((prev: any) => ({ ...prev, ...data }));
    setCurrentPhase("profile");
  };

  const handleProfileComplete = (
    profile: any,
    courseRecommendations: any[]
  ) => {
    setProfileData((prev: any) => ({ ...prev, ...profile }));
    setRecommendations(courseRecommendations);
    setCurrentPhase("recommendations");
  };

  const handleRecommendationsComplete = () => {
    router.push(`/dashboards/${role}`);
  };

  const handleSkip = () => {
    router.push(`/dashboards/${role}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Left Column: Branding and Progress (Visual) */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[450px] bg-brand-primary relative overflow-hidden flex-col justify-between p-12 text-white shrink-0">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-brand-secondary rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-brand-primary text-xl">
              KM
            </div>
            <span className="text-xl font-bold tracking-tight">Media Institute</span>
          </div>

          <div className="space-y-8 mt-12">
            <h1 className="text-4xl font-bold leading-tight">
              Scale your media career to the next level.
            </h1>
            <p className="text-brand-primary-light/80 text-lg leading-relaxed">
              Join thousands of creatives and professionals learning the skills that matter in today's media landscape.
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="relative z-10 mt-12 mb-12">
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              
              return (
                <div key={phase.id} className="flex items-center gap-4 transition-all duration-500">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    isCompleted ? "bg-white border-white" : 
                    isActive ? "border-white bg-white/20" : "border-white/30 bg-transparent"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                    ) : (
                      <span className={`text-sm font-bold ${isActive ? "text-white" : "text-white/40"}`}>
                        {index + 1}
                      </span>
                    )}
                    {index < phases.length - 1 && (
                      <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-[2px] h-6 ${
                        isCompleted ? "bg-white" : "bg-white/10"
                      }`}></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold transition-all duration-300 ${
                      isActive ? "text-white opacity-100" : "text-white/40"
                    }`}>
                      {phase.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-brand-primary-light/60 text-sm">
          &copy; 2026 KM Media Training Institute. All rights reserved.
        </div>
      </div>

      {/* Right Column: Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto bg-neutral-50/50 flex flex-col pt-12 lg:pt-0">
        <div className="flex lg:hidden px-6 items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
                KM
                </div>
                <span className="font-bold">Media Institute</span>
            </div>
            <div className="text-xs font-semibold text-neutral-400">
                STEP {currentStepIndex + 1} OF {phases.length}
            </div>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-neutral-100"
            >
              {currentPhase === "intro" && (
                <OnboardingFlow
                  onComplete={handleOnboardingComplete}
                  onSkip={handleSkip}
                />
              )}

              {currentPhase === "personal" && (
                <PersonalProfileSetup
                  onComplete={handlePersonalComplete}
                  onSkip={() => setCurrentPhase("profile")}
                />
              )}

              {currentPhase === "profile" && (
                <LearningProfileSetup
                  onComplete={handleProfileComplete}
                  onSkip={() => setCurrentPhase("recommendations")}
                />
              )}

              {currentPhase === "recommendations" && (
                <CourseRecommendations
                  recommendations={recommendations}
                  onComplete={handleRecommendationsComplete}
                  onSkip={handleRecommendationsComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}
