"use client";

import BaseWidget from "./BaseWidget";
import { Users, BookOpen, DollarSign, Clock } from "lucide-react";

interface StatsWidgetProps {
  type: "users" | "courses" | "revenue" | "applications";
  value: number;
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  className?: string;
}

const widgetConfig = {
  users: {
    title: "Total Users",
    icon: <Users className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
  },
  courses: {
    title: "Total Courses",
    icon: <BookOpen className="h-5 w-5" />,
    color: "from-green-500 to-emerald-500",
  },
  revenue: {
    title: "Total Revenue",
    icon: <DollarSign className="h-5 w-5" />,
    color: "from-yellow-500 to-orange-500",
  },
  applications: {
    title: "Pending Applications",
    icon: <Clock className="h-5 w-5" />,
    color: "from-purple-500 to-pink-500",
  },
};

export default function StatsWidget({
  type,
  value,
  trend,
  subtitle,
  className,
}: StatsWidgetProps) {
  const config = widgetConfig[type];

  const formatValue = (val: number) => {
    if (type === "revenue") {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 0,
      }).format(val);
    }
    return val.toLocaleString();
  };

  return (
    <BaseWidget
      title={config.title}
      value={formatValue(value)}
      subtitle={subtitle}
      trend={trend}
      icon={config.icon}
      className={className}
    />
  );
}
