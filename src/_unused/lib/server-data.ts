// Server-side data fetching utilities for dashboard components
// This provides mock data for server-side rendering to avoid hydration mismatches

export const mockDashboardData = {
  stats: {
    totalCourses: 0,
    activeStudents: 0,
    pendingAssessments: 0,
    recentAnnouncements: 0,
    totalRevenue: 0,
    completionRate: 0,
  },
  activities: [],
  deadlines: [],
  students: [],
  courses: [],
  assessments: [],
  announcements: [],
  messages: [],
  liveSessions: [],
  communicationStats: {
    totalAnnouncements: 0,
    unreadMessages: 0,
    upcomingSessions: 0,
    totalRecipients: 0,
  },
  studentMetrics: {
    totalStudents: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    averageEngagement: 0,
    completionRate: 0,
  },
  gradingQueue: {
    pendingSubmissions: 0,
    averageGradingTime: 0,
    overdueSubmissions: 0,
  },
};

export function getServerSideMockData(endpoint: string) {
  // Return appropriate mock data based on the endpoint
  switch (endpoint) {
    case "/api/instructor/stats":
      return { success: true, data: mockDashboardData.stats };
    case "/api/instructor/activity":
      return { success: true, data: mockDashboardData.activities };
    case "/api/instructor/deadlines":
      return { success: true, data: mockDashboardData.deadlines };
    case "/api/instructor/students":
      return {
        success: true,
        data: {
          students: mockDashboardData.students,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/courses":
      return {
        success: true,
        data: {
          courses: mockDashboardData.courses,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/assessments":
      return {
        success: true,
        data: {
          assessments: mockDashboardData.assessments,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/announcements":
      return {
        success: true,
        data: {
          announcements: mockDashboardData.announcements,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/messages":
      return {
        success: true,
        data: {
          messages: mockDashboardData.messages,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/live-sessions":
      return {
        success: true,
        data: {
          sessions: mockDashboardData.liveSessions,
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };
    case "/api/instructor/communication-stats":
      return { success: true, data: mockDashboardData.communicationStats };
    case "/api/instructor/student-metrics":
      return { success: true, data: mockDashboardData.studentMetrics };
    case "/api/instructor/assessments/grading-queue":
      return { success: true, data: mockDashboardData.gradingQueue };
    default:
      return { success: true, data: [] };
  }
}

