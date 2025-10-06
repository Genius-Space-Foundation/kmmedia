import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  gradient = "from-blue-500 to-indigo-600",
}: StatCardProps) {
  const trendIcon =
    trend?.direction === "up"
      ? "📈"
      : trend?.direction === "down"
      ? "📉"
      : "➡️";
  const trendColor =
    trend?.direction === "up"
      ? "text-green-600"
      : trend?.direction === "down"
      ? "text-red-600"
      : "text-gray-600";

  return (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white hover:scale-105",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div
              className={cn(
                "w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                `bg-gradient-to-br ${gradient}`
              )}
            >
              <span className="text-white text-xl">{icon}</span>
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-medium text-gray-600">
              {title}
            </CardTitle>
            <div className="text-3xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center space-x-1 text-xs mt-2",
                  trendColor
                )}
              >
                <span>{trendIcon}</span>
                <span>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

// Predefined stat cards for common use cases
export function UserStatsCard({
  count,
  type = "users",
}: {
  count: number;
  type?: "users" | "students" | "instructors";
}) {
  const config = {
    users: {
      icon: "👥",
      title: "Total Users",
      gradient: "from-blue-500 to-indigo-600",
    },
    students: {
      icon: "🎓",
      title: "Students",
      gradient: "from-green-500 to-emerald-600",
    },
    instructors: {
      icon: "👨‍🏫",
      title: "Instructors",
      gradient: "from-purple-500 to-pink-600",
    },
  };

  return (
    <StatCard
      title={config[type].title}
      value={count}
      icon={config[type].icon}
      gradient={config[type].gradient}
    />
  );
}

export function CourseStatsCard({
  count,
  type = "total",
}: {
  count: number;
  type?: "total" | "active" | "pending";
}) {
  const config = {
    total: {
      icon: "📚",
      title: "Total Courses",
      gradient: "from-purple-500 to-pink-600",
    },
    active: {
      icon: "✅",
      title: "Active Courses",
      gradient: "from-green-500 to-emerald-600",
    },
    pending: {
      icon: "⏳",
      title: "Pending Approval",
      gradient: "from-yellow-500 to-orange-600",
    },
  };

  return (
    <StatCard
      title={config[type].title}
      value={count}
      icon={config[type].icon}
      gradient={config[type].gradient}
    />
  );
}

export function RevenueStatsCard({
  amount,
  currency = "₵",
}: {
  amount: number;
  currency?: string;
}) {
  return (
    <StatCard
      title="Total Revenue"
      value={`${currency}${amount.toLocaleString()}`}
      icon="💰"
      gradient="from-green-500 to-emerald-600"
    />
  );
}
