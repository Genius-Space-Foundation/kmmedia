import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StudentOverviewProps {
  user: any;
  stats: {
    coursesInProgress: number;
    coursesCompleted: number;
    averageScore: number;
    totalHours: number;
  };
  upcomingDeadlines: any[];
  recentActivity: any[];
  learningStreak: {
    current: number;
    longest: number;
    lastActivity: string;
  };
}

export default function StudentOverview({
  user,
  stats,
  upcomingDeadlines,
  recentActivity,
  learningStreak,
}: StudentOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            You're on a {learningStreak?.current || 0}-day learning streak. Keep it up!
          </p>
        </div>
        <Link href="/courses">
          <Button className="rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Courses in Progress"
          value={stats?.coursesInProgress || 0}
          icon="📚"
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Completed Courses"
          value={stats?.coursesCompleted || 0}
          icon="🎓"
          color="bg-green-50 text-green-600"
        />
        <StatsCard
          title="Average Score"
          value={`${stats?.averageScore || 0}%`}
          icon="📊"
          color="bg-purple-50 text-purple-600"
        />
        <StatsCard
          title="Learning Hours"
          value={stats?.totalHours || 0}
          icon="⏱️"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-brand-neutral-50 rounded-xl p-6 text-center">
                <p className="text-gray-500 mb-4">Select a course to continue learning</p>
                <Link href="/dashboards/student?tab=courses">
                  <Button variant="outline" className="rounded-xl">
                    View My Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-xl">
                        {activity.icon || "📝"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingDeadlines?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-red-900 text-sm">{deadline.title}</h4>
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded-lg text-red-600 shadow-sm">
                          {new Date(deadline.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">{deadline.course?.title}</p>
                      <Button size="sm" className="w-full rounded-lg bg-white text-red-600 hover:bg-red-50 border border-red-200">
                        View Assignment
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines 🎉</p>
              )}
            </CardContent>
          </Card>

          {/* Learning Streak */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-brand-primary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-5xl mb-3">🔥</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {learningStreak?.current || 0} Days
                </h3>
                <p className="text-gray-600 text-sm mb-2">Current Streak</p>
                <p className="text-xs text-gray-500">
                  Longest: {learningStreak?.longest || 0} days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
}) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
