
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
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Applications
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(applications) ? applications.length : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Course applications submitted
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-xl">📄</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Card */}
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Courses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(enrollments) ? enrollments.length : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently enrolled</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-xl">🎓</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Courses Card */}
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-600/5"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Available Courses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(courses) ? courses.length : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ready to enroll</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-xl">📚</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Average Progress
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(enrollments) && enrollments.length > 0
                  ? Math.round(
                      enrollments.reduce(
                        (acc, e) => acc + (e.progress || 0),
                        0
                      ) / enrollments.length
                    )
                  : 0}
                <span className="text-lg text-gray-500">%</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Overall completion</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
