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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | "milestone"
    | "skill"
    | "engagement"
    | "completion"
    | "social"
    | "streak";
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: {
    type: string;
    target: number;
    current: number;
    description: string;
  }[];
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  achievements: number;
  streak: number;
}

interface UserStats {
  totalPoints: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  levelProgress: number;
  nextLevelPoints: number;
  rank: number;
  percentile: number;
}

interface AchievementSystemProps {
  userId: string;
}

const LEVELS = [
  { level: 1, points: 0, title: "Newcomer" },
  { level: 2, points: 100, title: "Explorer" },
  { level: 3, points: 250, title: "Learner" },
  { level: 4, points: 500, title: "Student" },
  { level: 5, points: 750, title: "Practitioner" },
  { level: 6, points: 1000, title: "Specialist" },
  { level: 7, points: 1500, title: "Expert" },
  { level: 8, points: 2000, title: "Master" },
  { level: 9, points: 3000, title: "Grandmaster" },
  { level: 10, points: 5000, title: "Legend" },
];

export default function AchievementSystem({ userId }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("achievements");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);

  useEffect(() => {
    fetchAchievementData();
  }, [userId]);

  const fetchAchievementData = async () => {
    try {
      const [achievementsRes, statsRes, leaderboardRes] = await Promise.all([
        makeAuthenticatedRequest(`/api/student/achievements/${userId}`),
        makeAuthenticatedRequest(`/api/student/stats/${userId}`),
        makeAuthenticatedRequest(`/api/student/leaderboard`),
      ]);

      const [achievementsData, statsData, leaderboardData] = await Promise.all([
        achievementsRes.json(),
        statsRes.json(),
        leaderboardRes.json(),
      ]);

      if (achievementsData.success) {
        setAchievements(achievementsData.data.achievements);
      }

      if (statsData.success) {
        setUserStats(statsData.data);
      }

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.data);
      }
    } catch (error) {
      console.error("Error fetching achievement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "⭐";
      case "rare":
        return "🌟";
      case "epic":
        return "💫";
      case "legendary":
        return "👑";
      default:
        return "⭐";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "milestone":
        return "🎯";
      case "skill":
        return "💪";
      case "engagement":
        return "💬";
      case "completion":
        return "✅";
      case "social":
        return "👥";
      case "streak":
        return "🔥";
      default:
        return "🏆";
    }
  };

  const getCurrentLevel = () => {
    if (!userStats) return LEVELS[0];
    return (
      LEVELS.find((level) => userStats.totalPoints >= level.points) || LEVELS[0]
    );
  };

  const getNextLevel = () => {
    const current = getCurrentLevel();
    return LEVELS.find((level) => level.level === current.level + 1);
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Achievement System...
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No achievement data available yet.</p>
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Achievement System
          </h2>
          <p className="text-gray-600">Track your progress and earn rewards</p>
        </div>
        <Button variant="outline" onClick={fetchAchievementData}>
          Refresh
        </Button>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⭐</span>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Points
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.totalPoints.toLocaleString()}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🏆</span>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Achievements
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.totalAchievements}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">🔥</span>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current Streak
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.currentStreak}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📊</span>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Level
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {currentLevel.level}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
          <CardDescription>
            Level {currentLevel.level} - {currentLevel.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {userStats.totalPoints.toLocaleString()} /{" "}
                {nextLevel ? nextLevel.points.toLocaleString() : "Max"} points
              </span>
              <span className="text-sm text-gray-600">
                {userStats.levelProgress}%
              </span>
            </div>
            <Progress value={userStats.levelProgress} className="h-3" />
            {nextLevel && (
              <p className="text-sm text-gray-600">
                {nextLevel.points - userStats.totalPoints} points to reach Level{" "}
                {nextLevel.level} - {nextLevel.title}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  achievement.isUnlocked
                    ? "border-2 border-green-200 bg-green-50"
                    : "border-2 border-gray-200 bg-gray-50"
                }`}
                onClick={() => handleAchievementClick(achievement)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">
                        {achievement.icon}
                      </span>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {getRarityIcon(achievement.rarity)} {achievement.rarity}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {achievement.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getCategoryIcon(achievement.category)}{" "}
                        {achievement.category}
                      </span>
                      <span className="text-sm font-bold text-yellow-600">
                        +{achievement.points} pts
                      </span>
                    </div>

                    {!achievement.isUnlocked && (
                      <div className="space-y-2">
                        <Progress
                          value={achievement.progress}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          {achievement.progress}% complete
                        </p>
                      </div>
                    )}

                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="text-xs text-green-600 font-medium">
                        ✅ Unlocked{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Learners</CardTitle>
              <CardDescription>
                See how you rank among other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.userId === userId
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {entry.rank <= 3
                          ? entry.rank === 1
                            ? "🥇"
                            : entry.rank === 2
                            ? "🥈"
                            : "🥉"
                          : entry.rank}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {entry.name} {entry.userId === userId && "(You)"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {entry.achievements} achievements • {entry.streak} day
                          streak
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements
                  .filter((a) => a.isUnlocked)
                  .sort(
                    (a, b) =>
                      new Date(b.unlockedAt!).getTime() -
                      new Date(a.unlockedAt!).getTime()
                  )
                  .slice(0, 10)
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">
                          {achievement.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Earned{" "}
                          {new Date(
                            achievement.unlockedAt!
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          +{achievement.points}
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {getRarityIcon(achievement.rarity)}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Dialog */}
      <Dialog
        open={showAchievementDialog}
        onOpenChange={setShowAchievementDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-3xl">
                  {selectedAchievement?.icon}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedAchievement?.title}
                </h2>
                <Badge
                  className={getRarityColor(
                    selectedAchievement?.rarity || "common"
                  )}
                >
                  {getRarityIcon(selectedAchievement?.rarity || "common")}{" "}
                  {selectedAchievement?.rarity}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedAchievement && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">
                  {selectedAchievement.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Requirements</h3>
                <div className="space-y-3">
                  {selectedAchievement.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{req.description}</p>
                        <p className="text-sm text-gray-600">
                          {req.current} / {req.target}
                        </p>
                      </div>
                      <Progress
                        value={(req.current / req.target) * 100}
                        className="w-24 h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedAchievement.isUnlocked
                    ? `Unlocked ${
                        selectedAchievement.unlockedAt
                          ? new Date(
                              selectedAchievement.unlockedAt
                            ).toLocaleDateString()
                          : ""
                      }`
                    : `${selectedAchievement.progress}% complete`}
                </div>
                <div className="text-lg font-bold text-yellow-600">
                  +{selectedAchievement.points} points
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


