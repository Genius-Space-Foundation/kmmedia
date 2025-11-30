"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: Error;
  className?: string;
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  children,
  actions,
  loading = false,
  error,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {subtitle && (
                <CardDescription className="mt-1">{subtitle}</CardDescription>
              )}
            </div>
          </div>
          {actions && !loading && !error && (
            <div className="flex-shrink-0 ml-4">{actions}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <span className="ml-3 text-sm text-brand-text-secondary">
              Loading...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">
                Error loading content
              </p>
              <p className="text-sm text-red-700 mt-1">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
