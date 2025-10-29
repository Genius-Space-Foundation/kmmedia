"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LearningProfileSetup from "@/components/onboarding/LearningProfileSetup";
import CourseRecommendations from "@/components/onboarding/CourseRecommendations";

export default function OnboardingPage() {
  const [currentPhase, setCurrentPhase] = useState<
    "onboarding" | "profile" | "recommendations"
  >("onboarding");
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";

  const handleOnboardingComplete = (profile: any) => {
    if (role === "student") {
      // Students go through profile setup
      setCurrentPhase("profile");
    } else {
      // Instructors skip to dashboard
      router.push(`/dashboards/${role}`);
    }
  };

  const handleProfileComplete = (
    profile: any,
    courseRecommendations: any[]
  ) => {
    setProfileData(profile);
    setRecommendations(courseRecommendations);
    setCurrentPhase("recommendations");
  };

  const handleRecommendationsComplete = () => {
    router.push(`/dashboards/${role}`);
  };

  const handleSkipOnboarding = () => {
    // Redirect to appropriate dashboard based on role
    router.push(`/dashboards/${role}`);
  };

  const handleSkipProfile = () => {
    router.push(`/dashboards/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/2.jpeg"
          alt="KM Media Training Institute Onboarding"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-700/80"></div>
      </div>

      <div className="relative z-10 w-full">
        {currentPhase === "onboarding" && (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
          />
        )}

        {currentPhase === "profile" && (
          <LearningProfileSetup
            onComplete={handleProfileComplete}
            onSkip={handleSkipProfile}
          />
        )}

        {currentPhase === "recommendations" && (
          <CourseRecommendations
            recommendations={recommendations}
            onComplete={handleRecommendationsComplete}
            onSkip={handleRecommendationsComplete}
          />
        )}
      </div>
    </div>
  );
}
