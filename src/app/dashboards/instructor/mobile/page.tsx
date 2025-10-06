"use client";
import { useState } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import MobileInstructorDashboard from "@/components/instructor/dashboard/MobileInstructorDashboard";
import MobileCourseManagement from "@/components/instructor/dashboard/MobileCourseManagement";
import MobileStudentAnalytics from "@/components/instructor/dashboard/MobileStudentAnalytics";

export default function MobileInstructorPage() {
  const [currentPage, setCurrentPage] = useState("overview");

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <MobileInstructorDashboard />;
      case "courses":
        return <MobileCourseManagement />;
      case "students":
        return <MobileStudentAnalytics />;
      case "assessments":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Assessments</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">
                Assessment management coming soon...
              </p>
            </div>
          </div>
        );
      case "communication":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Communication</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">Communication hub coming soon...</p>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">Advanced analytics coming soon...</p>
            </div>
          </div>
        );
      default:
        return <MobileInstructorDashboard />;
    }
  };

  return (
    <MobileLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MobileLayout>
  );
}

