"use client";

import { useState, useEffect } from "react";
import ProfessionalInstructorDashboard from "@/app/dashboards/instructor/professional-instructor-dashboard";
import ProfessionalMobileInstructorDashboard from "@/app/dashboards/instructor/mobile/professional-mobile-dashboard";

export default function ResponsiveInstructorDashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isMobile) {
    return <ProfessionalMobileInstructorDashboard />;
  }

  return <ProfessionalInstructorDashboard />;
}
