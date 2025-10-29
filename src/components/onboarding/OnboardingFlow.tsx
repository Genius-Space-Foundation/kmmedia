"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
}

interface LearningProfile {
  interests: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  goals: string[];
  timeCommitment: number;
  experience: string;
  careerGoals: string;
}

interface OnboardingFlowProps {
  onComplete: (profile: LearningProfile) => void;
  onSkip: () => void;
}

const INTERESTS = [
  "Photography",
  "Videography",
  "Video Editing",
  "Audio Production",
  "Digital Marketing",
  "Social Media Management",
  "Content Creation",
  "Graphic Design",
  "Web Development",
  "Animation",
  "Podcasting",
  "Live Streaming",
];

const GOALS = [
  "Start a career in media",
  "Improve current skills",
  "Build a portfolio",
  "Learn for personal interest",
  "Start my own business",
  "Get certified",
  "Network with professionals",
];

export default function OnboardingFlow({
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<LearningProfile>({
    interests: [],
    skillLevel: "beginner",
    learningStyle: "visual",
    goals: [],
    timeCommitment: 5,
    experience: "",
    careerGoals: "",
  });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("student");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const searchParams = useSearchParams();

  // Detect user role from URL params or API
  useEffect(() => {
    const roleFromParams = searchParams.get("role");
    if (roleFromParams) {
      setUserRole(roleFromParams.toLowerCase());
    } else {
      // Fetch user role from API if not in params
      fetchUserRole();
    }
  }, [searchParams]);

  const fetchUserRole = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/user/profile");
      const result = await response.json();
      if (result.success && result.user) {
        setUserRole(result.user.role.toLowerCase());
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
    }
  };

  // Role-based onboarding steps
  const getStepsForRole = (role: string): OnboardingStep[] => {
    const baseSteps = [
      {
        id: "welcome",
        title: `Welcome to KM Media Training!`,
        description: `Let's personalize your ${
          role === "instructor" ? "teaching" : "learning"
        } experience`,
        component: "welcome",
        required: false,
        completed: false,
      },
    ];

    if (role === "student") {
      return [
        ...baseSteps,
        {
          id: "interests",
          title: "What interests you?",
          description: "Select the areas you'd like to learn about",
          component: "interests",
          required: true,
          completed: profile.interests.length > 0,
        },
        {
          id: "experience",
          title: "Your Experience Level",
          description: "Help us understand your current skill level",
          component: "experience",
          required: true,
          completed: profile.experience !== "",
        },
        {
          id: "goals",
          title: "Learning Goals",
          description: "What do you want to achieve?",
          component: "goals",
          required: true,
          completed: profile.goals.length > 0,
        },
        {
          id: "preferences",
          title: "Learning Preferences",
          description: "How do you learn best?",
          component: "preferences",
          required: true,
          completed:
            profile.learningStyle !== "visual" || profile.timeCommitment > 0,
        },
        {
          id: "career",
          title: "Career Goals",
          description: "Tell us about your career aspirations",
          component: "career",
          required: false,
          completed: profile.careerGoals !== "",
        },
        {
          id: "tutorial",
          title: "Platform Tour",
          description: "Let's show you around the student dashboard",
          component: "tutorial",
          required: false,
          completed: false,
        },
      ];
    } else if (role === "instructor") {
      return [
        ...baseSteps,
        {
          id: "expertise",
          title: "Your Expertise",
          description: "Tell us about your teaching background",
          component: "expertise",
          required: true,
          completed: profile.experience !== "",
        },
        {
          id: "teaching-goals",
          title: "Teaching Goals",
          description: "What do you want to achieve as an instructor?",
          component: "teaching-goals",
          required: true,
          completed: profile.goals.length > 0,
        },
        {
          id: "course-interests",
          title: "Course Topics",
          description: "What subjects would you like to teach?",
          component: "course-interests",
          required: true,
          completed: profile.interests.length > 0,
        },
        {
          id: "tutorial",
          title: "Platform Tour",
          description: "Let's show you around the instructor dashboard",
          component: "tutorial",
          required: false,
          completed: false,
        },
      ];
    }

    return baseSteps;
  };

  const steps = getStepsForRole(userRole);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save learning profile to backend
      const response = await makeAuthenticatedRequest(
        "/api/user/learning-profile",
        {
          method: "PUT",
          body: JSON.stringify({
            ...profile,
            onboardingCompleted: true,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Learning profile saved successfully");
        onComplete(profile);
      } else {
        console.error("Failed to save profile:", result.message);
        onComplete(profile);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      onComplete(profile);
    } finally {
      setLoading(false);
    }
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    const maxSteps = getTutorialSteps().length;
    if (tutorialStep < maxSteps - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      handleComplete();
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    handleComplete();
  };

  const getTutorialSteps = () => {
    if (userRole === "student") {
      return [
        {
          title: "Welcome to Your Dashboard",
          description:
            "This is your personal learning hub where you can track your progress and access courses.",
          highlight: "dashboard-overview",
        },
        {
          title: "Course Catalog",
          description:
            "Browse and enroll in courses that match your interests and skill level.",
          highlight: "course-catalog",
        },
        {
          title: "Progress Tracking",
          description:
            "Monitor your learning progress and see upcoming deadlines.",
          highlight: "progress-section",
        },
        {
          title: "Profile & Settings",
          description:
            "Customize your learning experience and manage your account settings.",
          highlight: "profile-menu",
        },
      ];
    } else if (userRole === "instructor") {
      return [
        {
          title: "Instructor Dashboard",
          description:
            "Your teaching command center with student analytics and course management tools.",
          highlight: "instructor-dashboard",
        },
        {
          title: "Course Creation",
          description:
            "Create and manage your courses with our intuitive course builder.",
          highlight: "course-creation",
        },
        {
          title: "Student Management",
          description:
            "Track student progress, grade assignments, and communicate with your class.",
          highlight: "student-management",
        },
        {
          title: "Analytics & Insights",
          description:
            "Get detailed insights into student performance and course effectiveness.",
          highlight: "analytics-section",
        },
      ];
    }
    return [];
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleGoal = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-4xl">🎓</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to KM Media Training!
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're excited to have you join our community of media
                professionals. Let's personalize your learning journey to help
                you achieve your goals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  Expert Instructors
                </h3>
                <p className="text-sm text-gray-600">
                  Learn from industry professionals
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  Certified Programs
                </h3>
                <p className="text-sm text-gray-600">
                  Earn recognized certifications
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-900">Career Support</h3>
                <p className="text-sm text-gray-600">
                  Get help launching your career
                </p>
              </div>
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What interests you?
              </h2>
              <p className="text-gray-600">
                Select all the areas you'd like to learn about. This helps us
                recommend the right courses for you.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    profile.interests.includes(interest)
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="font-medium">{interest}</div>
                </button>
              ))}
            </div>
            {profile.interests.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {profile.interests.length} interest
                  {profile.interests.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Experience Level
              </h2>
              <p className="text-gray-600">
                Help us understand your current skill level to recommend
                appropriate courses.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select
                  value={profile.skillLevel}
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced"
                  ) => setProfile((prev) => ({ ...prev, skillLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      Beginner - New to media
                    </SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate - Some experience
                    </SelectItem>
                    <SelectItem value="advanced">
                      Advanced - Professional experience
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">
                  Tell us about your experience
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your current experience with media, photography, video editing, etc..."
                  value={profile.experience}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case "goals":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Learning Goals
              </h2>
              <p className="text-gray-600">
                What do you want to achieve through our courses?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    profile.goals.includes(goal)
                      ? "border-green-500 bg-green-50 text-green-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="font-medium">{goal}</div>
                </button>
              ))}
            </div>
            {profile.goals.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {profile.goals.length} goal
                  {profile.goals.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Learning Preferences
              </h2>
              <p className="text-gray-600">
                Help us customize your learning experience.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="learningStyle">How do you learn best?</Label>
                <Select
                  value={profile.learningStyle}
                  onValueChange={(
                    value: "visual" | "auditory" | "kinesthetic" | "reading"
                  ) =>
                    setProfile((prev) => ({ ...prev, learningStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">
                      Visual - Videos, images, demonstrations
                    </SelectItem>
                    <SelectItem value="auditory">
                      Auditory - Audio lectures, discussions
                    </SelectItem>
                    <SelectItem value="kinesthetic">
                      Hands-on - Practice, projects, exercises
                    </SelectItem>
                    <SelectItem value="reading">
                      Reading - Text materials, articles
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeCommitment">
                  How many hours per week can you dedicate to learning?
                </Label>
                <Select
                  value={profile.timeCommitment.toString()}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      timeCommitment: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">1-2 hours</SelectItem>
                    <SelectItem value="5">3-5 hours</SelectItem>
                    <SelectItem value="10">6-10 hours</SelectItem>
                    <SelectItem value="15">11-15 hours</SelectItem>
                    <SelectItem value="20">16+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "career":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Career Goals
              </h2>
              <p className="text-gray-600">
                Tell us about your career aspirations to help us guide your
                learning path.
              </p>
            </div>
            <div>
              <Label htmlFor="careerGoals">Career Goals</Label>
              <Textarea
                id="careerGoals"
                placeholder="What kind of career are you looking to build? Any specific roles or industries you're interested in?"
                value={profile.careerGoals}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    careerGoals: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
        );

      case "expertise":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Teaching Expertise
              </h2>
              <p className="text-gray-600">
                Help us understand your background and qualifications as an
                instructor.
              </p>
            </div>
            <div>
              <Label htmlFor="expertise">
                Teaching Experience & Qualifications
              </Label>
              <Textarea
                id="expertise"
                placeholder="Describe your teaching experience, professional background, certifications, and areas of expertise..."
                value={profile.experience}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                rows={5}
              />
            </div>
          </div>
        );

      case "teaching-goals":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Teaching Goals
              </h2>
              <p className="text-gray-600">
                What do you hope to achieve as an instructor on our platform?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Share my expertise with students",
                "Build a teaching career",
                "Create comprehensive courses",
                "Help students achieve their goals",
                "Develop my teaching skills",
                "Generate additional income",
                "Build a professional network",
                "Make a positive impact",
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    profile.goals.includes(goal)
                      ? "border-green-500 bg-green-50 text-green-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="font-medium">{goal}</div>
                </button>
              ))}
            </div>
            {profile.goals.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {profile.goals.length} goal
                  {profile.goals.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        );

      case "course-interests":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Course Topics
              </h2>
              <p className="text-gray-600">
                What subjects would you like to teach? Select all that apply.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    profile.interests.includes(interest)
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="font-medium">{interest}</div>
                </button>
              ))}
            </div>
            {profile.interests.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {profile.interests.length} topic
                  {profile.interests.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        );

      case "tutorial":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready for a Quick Tour?
              </h2>
              <p className="text-gray-600">
                We'll show you around the {userRole} dashboard to help you get
                started quickly.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Take the Tour
                </h3>
                <p className="text-sm text-gray-600">
                  Interactive walkthrough of key features and navigation
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Skip for Now
                </h3>
                <p className="text-sm text-gray-600">
                  Jump straight to your dashboard and explore on your own
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step.required) return true;
    return step.completed;
  };

  // Tutorial overlay component
  const TutorialOverlay = () => {
    const tutorialSteps = getTutorialSteps();
    const currentTutorialStep = tutorialSteps[tutorialStep];

    if (!showTutorial || !currentTutorialStep) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {currentTutorialStep.title}
            </h3>
            <p className="text-gray-600">{currentTutorialStep.description}</p>
          </div>

          <div className="mb-4">
            <Progress
              value={((tutorialStep + 1) / tutorialSteps.length) * 100}
              className="h-2"
            />
            <p className="text-sm text-gray-600 text-center mt-2">
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={skipTutorial}>
              Skip Tour
            </Button>
            <Button onClick={nextTutorialStep}>
              {tutorialStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {steps[currentStep].title}
            </DialogTitle>
            <div className="w-full">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600 text-center mt-2">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </DialogHeader>

          <div className="py-6">{renderStep()}</div>

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onSkip} disabled={loading}>
                Skip for now
              </Button>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>

            {steps[currentStep].component === "tutorial" ? (
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={skipTutorial}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  Skip Tour
                </Button>
                <Button
                  onClick={startTutorial}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  Start Tour
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : currentStep === steps.length - 1 ? (
                  "Complete Setup"
                ) : (
                  "Next"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TutorialOverlay />
    </>
  );
}
