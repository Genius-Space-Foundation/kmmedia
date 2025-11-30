"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface ProfileCompletionIncentiveProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface ProfileCompletionData {
  completionPercentage: number;
  missingFields: string[];
  completedFields: string[];
  benefits: string[];
  recommendedActions: string[];
}

const COMPLETION_BENEFITS = [
  {
    threshold: 25,
    benefit: "Unlock basic course recommendations",
    icon: "🎯",
  },
  {
    threshold: 50,
    benefit: "Get personalized learning paths",
    icon: "🛤️",
  },
  {
    threshold: 75,
    benefit: "Access to exclusive content and early course previews",
    icon: "⭐",
  },
  {
    threshold: 100,
    benefit: "Premium support and career guidance",
    icon: "🏆",
  },
];

const FIELD_LABELS: Record<string, string> = {
  interests: "Learning Interests",
  skillLevel: "Skill Level",
  learningStyle: "Learning Style",
  goals: "Learning Goals",
  timeCommitment: "Time Commitment",
  experience: "Experience Description",
  careerGoals: "Career Goals",
  profileImage: "Profile Picture",
  bio: "Bio/About Me",
  location: "Location",
};

export default function ProfileCompletionIncentive({
  onComplete,
  onSkip,
}: ProfileCompletionIncentiveProps) {
  const [completionData, setCompletionData] =
    useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/user/profile-completion"
      );
      const result = await response.json();

      if (result.success) {
        setCompletionData(result.data);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextBenefit = (currentPercentage: number) => {
    return COMPLETION_BENEFITS.find(
      (benefit) => benefit.threshold > currentPercentage
    );
  };

  const getUnlockedBenefits = (currentPercentage: number) => {
    return COMPLETION_BENEFITS.filter(
      (benefit) => benefit.threshold <= currentPercentage
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading your profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!completionData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-gray-600">
            Unable to load profile completion data.
          </p>
          <Button onClick={onSkip} className="mt-4">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const nextBenefit = getNextBenefit(completionData.completionPercentage);
  const unlockedBenefits = getUnlockedBenefits(
    completionData.completionPercentage
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Unlock personalized features and better course recommendations by
          completing your profile
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${
                    2 *
                    Math.PI *
                    50 *
                    (1 - completionData.completionPercentage / 100)
                  }`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(completionData.completionPercentage)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Profile {Math.round(completionData.completionPercentage)}%
              Complete
            </h3>
            <p className="text-gray-600">
              {completionData.completedFields.length} of{" "}
              {completionData.completedFields.length +
                completionData.missingFields.length}{" "}
              sections completed
            </p>
          </div>
        </div>

        {/* Unlocked Benefits */}
        {unlockedBenefits.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              🎉 Unlocked Benefits
            </h4>
            <div className="space-y-2">
              {unlockedBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-green-800"
                >
                  <span>{benefit.icon}</span>
                  <span className="text-sm">{benefit.benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Benefit */}
        {nextBenefit && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Next Unlock</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-800">
                <span>{nextBenefit.icon}</span>
                <span className="text-sm">{nextBenefit.benefit}</span>
              </div>
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-300"
              >
                {nextBenefit.threshold}%
              </Badge>
            </div>
            <Progress
              value={
                (completionData.completionPercentage / nextBenefit.threshold) *
                100
              }
              className="mt-2 h-2"
            />
            <p className="text-xs text-blue-600 mt-1">
              {nextBenefit.threshold - completionData.completionPercentage}%
              more to unlock
            </p>
          </div>
        )}

        {/* Missing Fields */}
        {completionData.missingFields.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Complete These Sections
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completionData.missingFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {FIELD_LABELS[field] || field}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {completionData.recommendedActions.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">
              💡 Quick Wins
            </h4>
            <ul className="space-y-1">
              {completionData.recommendedActions.map((action, index) => (
                <li
                  key={index}
                  className="text-sm text-yellow-800 flex items-start space-x-2"
                >
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onSkip}>
            Maybe Later
          </Button>

          <div className="flex space-x-3">
            {completionData.completionPercentage < 100 && (
              <Button onClick={() => (window.location.href = "/profile/edit")}>
                Complete Profile
              </Button>
            )}
            <Button
              variant={
                completionData.completionPercentage >= 75
                  ? "default"
                  : "outline"
              }
              onClick={onComplete}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>

        {/* Completion Celebration */}
        {completionData.completionPercentage === 100 && (
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Profile Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              You've unlocked all profile benefits and will receive the best
              possible course recommendations.
            </p>
            <Button onClick={onComplete} size="lg">
              Explore Your Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
