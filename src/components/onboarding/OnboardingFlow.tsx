"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to KM Media Training!",
      description: "Let's personalize your learning experience",
      component: "welcome",
      required: false,
      completed: false,
    },
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
  ];

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

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step.required) return true;
    return step.completed;
  };

  return (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
