"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BaseWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
  children?: React.ReactNode;
}

export default function BaseWidget({
  title,
  value,
  subtitle,
  trend,
  icon,
  actions,
  className = "",
  children,
}: BaseWidgetProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0)
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.value < 0)
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-600";
    if (trend.value < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card
      className={`bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">
                {title}
              </CardTitle>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          </div>
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      {(trend || subtitle) && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      {children}
    </Card>
  );
}


