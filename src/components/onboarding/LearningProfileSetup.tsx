"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { makeAuthenticatedRequest } from "@/lib/token-utils";

const learningProfileSchema = z.object({
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  timeCommitment: z.number().min(1).max(40),
  experience: z
    .string()
    .min(10, "Please provide some details about your experience"),
  careerGoals: z.string().optional(),
});

type LearningProfileData = z.infer<typeof learningProfileSchema>;

interface LearningProfileSetupProps {
  onComplete: (profile: LearningProfileData, recommendations: any[]) => void;
  onSkip: () => void;
  initialData?: Partial<LearningProfileData>;
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
  "Journalism",
  "Broadcasting",
  "Film Production",
  "Documentary Making",
];

const GOALS = [
  "Start a career in media",
  "Improve current skills",
  "Build a portfolio",
  "Learn for personal interest",
  "Start my own business",
  "Get certified",
  "Network with professionals",
  "Change career paths",
  "Freelance opportunities",
  "Teaching others",
];

const LEARNING_STYLES = [
  {
    value: "visual",
    label: "Visual Learner",
    description: "Learn best through videos, images, and demonstrations",
    icon: "👁️",
  },
  {
    value: "auditory",
    label: "Auditory Learner",
    description: "Learn best through audio lectures and discussions",
    icon: "👂",
  },
  {
    value: "kinesthetic",
    label: "Hands-on Learner",
    description: "Learn best through practice, projects, and exercises",
    icon: "✋",
  },
  {
    value: "reading",
    label: "Reading/Writing Learner",
    description: "Learn best through text materials and written exercises",
    icon: "📚",
  },
];

export default function LearningProfileSetup({
  onComplete,
  onSkip,
  initialData = {},
}: LearningProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData.interests || []
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    initialData.goals || []
  );
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LearningProfileData>({
    resolver: zodResolver(learningProfileSchema),
    defaultValues: {
      skillLevel: initialData.skillLevel || "beginner",
      learningStyle: initialData.learningStyle || "visual",
      timeCommitment: initialData.timeCommitment || 5,
      experience: initialData.experience || "",
      careerGoals: initialData.careerGoals || "",
      interests: selectedInterests,
      goals: selectedGoals,
    },
  });

  const steps = [
    {
      title: "Your Interests",
      description: "What areas of media and technology interest you most?",
      component: "interests",
    },
    {
      title: "Experience Level",
      description: "Help us understand your current skill level",
      component: "experience",
    },
    {
      title: "Learning Goals",
      description: "What do you want to achieve through learning?",
      component: "goals",
    },
    {
      title: "Learning Preferences",
      description: "How do you learn best and how much time can you commit?",
      component: "preferences",
    },
    {
      title: "Career Aspirations",
      description: "Tell us about your career goals (optional)",
      component: "career",
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Update form values when selections change
  useEffect(() => {
    setValue("interests", selectedInterests);
    setValue("goals", selectedGoals);
  }, [selectedInterests, selectedGoals, setValue]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = async () => {
    // Validate current step
    const isValid = await trigger();
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: LearningProfileData) => {
    setIsLoading(true);
    try {
      const response = await makeAuthenticatedRequest(
        "/api/user/learning-profile",
        {
          method: "PUT",
          body: JSON.stringify({
            ...data,
            onboardingCompleted: true,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setRecommendations(result.recommendations || []);
        onComplete(data, result.recommendations || []);
      } else {
        console.error("Failed to save profile:", result.message);
        // Still call onComplete to not block the user
        onComplete(data, []);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      onComplete(data, []);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case "interests":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                    selectedInterests.includes(interest)
                      ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-sm">{interest}</div>
                </button>
              ))}
            </div>
            {selectedInterests.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {selectedInterests.length} interest
                  {selectedInterests.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {selectedInterests.slice(0, 5).map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                  {selectedInterests.length > 5 && (
                    <Badge variant="outline">
                      +{selectedInterests.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {errors.interests && (
              <p className="text-sm text-red-600 text-center">
                {errors.interests.message}
              </p>
            )}
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="skillLevel">Current Skill Level</Label>
                <Select
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced"
                  ) => setValue("skillLevel", value)}
                  defaultValue={watch("skillLevel")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center space-x-2">
                        <span>🌱</span>
                        <div>
                          <div className="font-medium">Beginner</div>
                          <div className="text-sm text-gray-500">
                            New to media and technology
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center space-x-2">
                        <span>🌿</span>
                        <div>
                          <div className="font-medium">Intermediate</div>
                          <div className="text-sm text-gray-500">
                            Some experience and knowledge
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center space-x-2">
                        <span>🌳</span>
                        <div>
                          <div className="font-medium">Advanced</div>
                          <div className="text-sm text-gray-500">
                            Professional experience
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.skillLevel && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.skillLevel.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="experience">
                  Tell us about your experience
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your current experience with media, technology, or related fields. Include any relevant projects, education, or work experience..."
                  {...register("experience")}
                  rows={4}
                  className="mt-1"
                />
                {errors.experience && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "goals":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                    selectedGoals.includes(goal)
                      ? "border-green-500 bg-green-50 text-green-900 shadow-md"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{goal}</div>
                </button>
              ))}
            </div>
            {selectedGoals.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {selectedGoals.length} goal
                  {selectedGoals.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {selectedGoals.slice(0, 3).map((goal) => (
                    <Badge
                      key={goal}
                      variant="secondary"
                      className="bg-green-100"
                    >
                      {goal}
                    </Badge>
                  ))}
                  {selectedGoals.length > 3 && (
                    <Badge variant="outline">
                      +{selectedGoals.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {errors.goals && (
              <p className="text-sm text-red-600 text-center">
                {errors.goals.message}
              </p>
            )}
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <Label>How do you learn best?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() =>
                      setValue("learningStyle", style.value as any)
                    }
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                      watch("learningStyle") === style.value
                        ? "border-purple-500 bg-purple-50 text-purple-900 shadow-md"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{style.icon}</span>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {style.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.learningStyle && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.learningStyle.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="timeCommitment">
                How many hours per week can you dedicate to learning?
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("timeCommitment", parseInt(value))
                }
                defaultValue={watch("timeCommitment")?.toString()}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">
                    1-2 hours (Light commitment)
                  </SelectItem>
                  <SelectItem value="5">
                    3-5 hours (Moderate commitment)
                  </SelectItem>
                  <SelectItem value="10">
                    6-10 hours (Serious commitment)
                  </SelectItem>
                  <SelectItem value="15">
                    11-15 hours (Intensive learning)
                  </SelectItem>
                  <SelectItem value="20">
                    16+ hours (Full-time focus)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.timeCommitment && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.timeCommitment.message}
                </p>
              )}
            </div>
          </div>
        );

      case "career":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="careerGoals">Career Goals (Optional)</Label>
              <Textarea
                id="careerGoals"
                placeholder="What kind of career are you looking to build? Any specific roles, industries, or companies you're interested in? This helps us provide more targeted recommendations."
                {...register("careerGoals")}
                rows={4}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">
                This information helps us recommend courses and opportunities
                that align with your career aspirations.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-neutral-900">{steps[currentStep].title}</h2>
        <p className="text-neutral-500 mt-2">{steps[currentStep].description}</p>
        
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-neutral-100" />
        </div>
      </div>

      <div className="space-y-8">
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-neutral-100">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={isLoading}
              className="text-neutral-500 hover:text-neutral-900"
            >
              Skip
            </Button>
            {currentStep > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={isLoading}
                className="text-neutral-500 hover:text-neutral-900"
              >
                Back
              </Button>
            )}
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-8 h-12 rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95 flex items-center gap-2 font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : currentStep === steps.length - 1 ? (
              <>Complete Setup <CheckCircle2 className="w-4 h-4" /></>
            ) : (
              <>Next Step <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
