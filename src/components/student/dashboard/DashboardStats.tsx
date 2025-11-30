
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  applications: any[];
  enrollments: any[];
  courses: any[];
}

export default function DashboardStats({
  applications,
  enrollments,
  courses,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Applications Card */}
      <Card className="group bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                Applications
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {Array.isArray(applications) ? applications.length : 0}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Course applications submitted
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors duration-300">
              <span className="text-brand-primary text-xl">📄</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Card */}
      <Card className="group bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                Active Courses
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {Array.isArray(enrollments) ? enrollments.length : 0}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Currently enrolled</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
              <span className="text-success text-xl">🎓</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Courses Card */}
      <Card className="group bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                Available Courses
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {Array.isArray(courses) ? courses.length : 0}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Ready to enroll</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center group-hover:bg-info/20 transition-colors duration-300">
              <span className="text-info text-xl">📚</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card className="group bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                Average Progress
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {Array.isArray(enrollments) && enrollments.length > 0
                  ? Math.round(
                      enrollments.reduce(
                        (acc, e) => acc + (e.progress || 0),
                        0
                      ) / enrollments.length
                    )
                  : 0}
                <span className="text-lg text-neutral-500">%</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">Overall completion</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center group-hover:bg-warning/20 transition-colors duration-300">
              <span className="text-warning text-xl">📊</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
