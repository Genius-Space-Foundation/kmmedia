"use client";

import { useState, useEffect } from "react";
import PersonalizedOverview from "./PersonalizedOverview";
import MobilePersonalizedOverview from "./MobilePersonalizedOverview";
import { getCurrentBreakpoint } from "@/lib/mobile-utils";

interface ResponsivePersonalizedOverviewProps {
  user: any;
  enrollments: any[];
  upcomingDeadlines: any[];
  recentActivity: any[];
  achievements: any[];
  learningStreak?: any;
  learningStats?: any;
  onContinueCourse: (courseId: string) => void;
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
}

export default function ResponsivePersonalizedOverview(
  props: ResponsivePersonalizedOverviewProps
) {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const breakpoint = getCurrentBreakpoint();
      setIsMobileView(breakpoint === "xs" || breakpoint === "sm");
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Use mobile view for small screens (< 768px)
  if (isMobileView) {
    return <MobilePersonalizedOverview {...props} />;
  }

  // Use desktop view for larger screens
  return <PersonalizedOverview {...props} />;
}
