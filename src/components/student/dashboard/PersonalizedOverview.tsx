"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
} from "lucide-react";
import UpcomingAssignmentsWidget from "./UpcomingAssignmentsWidget";
import RecentGradesWidget from "./RecentGradesWidget";
import ClassScheduleWidget from "./ClassScheduleWidget";
import AttendanceTracker from "./AttendanceTracker";
import AnnouncementsWidget from "./AnnouncementsWidget";

interface PersonalizedOverviewProps {
  user: any;
  enrollments: any[];
  upcomingDeadlines: any[];
  achievements: any[];
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
  onViewAssessmentDetails?: (assessment: any) => void;
  onViewClassDetails?: (classSession: any) => void;
}

export default function PersonalizedOverview({
  user,
  enrollments,
  upcomingDeadlines,
  achievements,
  onViewDeadlines,
  onViewAchievements,
  onViewAssessmentDetails,
  onViewClassDetails,
}: PersonalizedOverviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPersonalizedMessage = () => {
    const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
    const completedCourses = enrollments.filter(
      (e) => e.status === "COMPLETED"
    );

    if (activeEnrollments.length === 0) {
      return "Ready to start your learning journey? Explore our course catalog!";
    }

    if (upcomingDeadlines.length > 0) {
      return `You have ${upcomingDeadlines.length} upcoming deadline${
        upcomingDeadlines.length > 1 ? "s" : ""
      }. Stay on track!`;
    }

    if (completedCourses.length > 0) {
      return `Great progress! You've completed ${
        completedCourses.length
      } course${completedCourses.length > 1 ? "s" : ""}. Keep it up!`;
    }

    return "Continue your learning journey. You're doing great!";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-white border border-neutral-200 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {getPersonalizedMessage()}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentTime.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <span className="text-brand-primary text-3xl">🎓</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hybrid Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Row 1: Schedule & Attendance */}
        {/* Row 1: Schedule & Attendance */}
        <div className="lg:col-span-2">
          <ClassScheduleWidget onViewClassDetails={onViewClassDetails} />
        </div>
        <div className="lg:col-span-1">
          <AttendanceTracker 
            attendanceRate={0} 
            totalClasses={0} 
            attendedClasses={0} 
          />
        </div>

        {/* Row 2: Assignments & Announcements */}
        <div className="lg:col-span-2">
          <UpcomingAssignmentsWidget 
            deadlines={upcomingDeadlines} 
            onViewDeadlines={onViewDeadlines}
            onViewAssessmentDetails={onViewAssessmentDetails}
          />
        </div>
        <div className="lg:col-span-1">
          <AnnouncementsWidget announcements={[]} />
        </div>

        {/* Row 3: Grades */}
        <div className="lg:col-span-3">
          <RecentGradesWidget enrollments={enrollments} />
        </div>
      </div>
    </div>
  );
}
