"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Medal,
  Crown,
  Zap,
  BookOpen,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "engagement" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedDate: string;
  points: number;
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
}

interface LearningStreak {
  current: number;
  longest: number;
  lastActivity: string;
}

interface LearningStats {
  totalHours: number;
  coursesCompleted: number;
  averageScore: number;
  skillsLearned: string[];
  weeklyGoal: {
    target: number;
    current: number;
    unit: "hours" | "lessons" | "assignments";
  };
}

interface AchievementProgressTrackingProps {
  achievements: Achievement[];
  learningStreak: LearningStreak;
  learningStats: LearningStats;
  onViewAchievement: (achievementId: string) => void;
  onSetGoal: () => void;
}

export default function AchievementProgressTracking({
  achievements,
  learningStreak,
  learningStats,
  onViewAchievement,
  onSetGoal,
}: AchievementProgressTrackingProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "learning" | "engagement" | "milestone" | "special"
  >("all");

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "rare":
        return "bg-blue-600";
      case "epic":
        return "bg-purple-600";
      case "legendary":
        return "bg-yellow-600";
      default:
        return "bg-gray-500";
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors = {
      common: "bg-gray-100 text-gray-800",
      rare: "bg-blue-100 text-blue-800",
      epic: "bg-purple-100 text-purple-800",
      legendary: "bg-yellow-100 text-yellow-800",
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "learning":
        return <BookOpen className="h-4 w-4" />;
      case "engagement":
        return <Zap className="h-4 w-4" />;
      case "milestone":
        return <Target className="h-4 w-4" />;
      case "special":
        return <Crown className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const filteredAchievements = achievements.filter(
    (achievement) =>
      selectedCategory === "all" || achievement.category === selectedCategory
  );

  const totalPoints = achievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0
  );
  const recentAchievements = achievements
    .sort(
      (a, b) =>
        new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime()
    )
    .slice(0, 3);

  const getStreakMessage = () => {
    if (learningStreak.current === 0) {
      return "Start your learning streak today!";
    }
    if (learningStreak.current === 1) {
      return "Great start! Keep it going tomorrow.";
    }
    if (learningStreak.current < 7) {
      return `${learningStreak.current} days strong! You're building momentum.`;
    }
    if (learningStreak.current < 30) {
      return `Amazing ${learningStreak.current}-day streak! You're on fire! 🔥`;
    }
    return `Incredible ${learningStreak.current}-day streak! You're a learning legend! 🏆`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-purple-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Achievements & Progress
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Track your learning journey and celebrate milestones
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {totalPoints}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {learningStats.totalHours}
                </p>
                <p className="text-sm text-gray-600">Hours Learned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {learningStats.coursesCompleted}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {learningStats.averageScore}%
                </p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.length}
                </p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Streak */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span>Learning Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {learningStreak.current}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {learningStreak.current} Day
                {learningStreak.current !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{getStreakMessage()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-medium">
                  {learningStreak.current} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Longest Streak</span>
                <span className="font-medium">
                  {learningStreak.longest} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-medium">
                  {learningStreak.lastActivity}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Weekly Goal</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onSetGoal}>
                Update Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-lg font-bold">
                  {Math.round(
                    (learningStats.weeklyGoal.current /
                      learningStats.weeklyGoal.target) *
                      100
                  )}
                  %
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {learningStats.weeklyGoal.current} /{" "}
                {learningStats.weeklyGoal.target}{" "}
                {learningStats.weeklyGoal.unit}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {learningStats.weeklyGoal.current >=
                learningStats.weeklyGoal.target
                  ? "Goal achieved! Great work! 🎉"
                  : `${
                      learningStats.weeklyGoal.target -
                      learningStats.weeklyGoal.current
                    } ${learningStats.weeklyGoal.unit} to go`}
              </p>
            </div>

            <Progress
              value={
                (learningStats.weeklyGoal.current /
                  learningStats.weeklyGoal.target) *
                100
              }
              className="h-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="h-5 w-5 text-yellow-600" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => onViewAchievement(achievement.id)}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(
                        achievement.rarity
                      )} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <span className="text-white text-xl">
                        {achievement.icon}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge className={getRarityBadge(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <span>All Achievements</span>
            </CardTitle>
            <div className="flex space-x-1">
              {["all", "learning", "engagement", "milestone", "special"].map(
                (category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category as any)}
                    className="capitalize"
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1 hidden sm:inline">{category}</span>
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => onViewAchievement(achievement.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 ${getRarityColor(
                        achievement.rarity
                      )} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white text-xl">
                        {achievement.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getRarityBadge(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-800">
                            {getCategoryIcon(achievement.category)}
                            <span className="ml-1 capitalize">
                              {achievement.category}
                            </span>
                          </Badge>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">
                          +{achievement.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Earned{" "}
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>

                      {achievement.progress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress.current} /{" "}
                              {achievement.progress.total}{" "}
                              {achievement.progress.unit}
                            </span>
                          </div>
                          <Progress
                            value={
                              (achievement.progress.current /
                                achievement.progress.total) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {selectedCategory === "all" ? "" : selectedCategory}{" "}
                achievements yet
              </h3>
              <p className="text-gray-600 mb-4">
                Keep learning to unlock amazing achievements!
              </p>
              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                >
                  View All Achievements
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
