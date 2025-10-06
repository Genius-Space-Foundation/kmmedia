"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export default function ChartWidget({
  title,
  subtitle,
  children,
  className = "",
  onRefresh,
  onExport,
  loading = false,
}: ChartWidgetProps) {
  const actions = [];
  if (onRefresh) actions.push({ label: "Refresh", onClick: onRefresh });
  if (onExport) actions.push({ label: "Export", onClick: onExport });

  return (
    <Card
      className={`bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions.length > 0 && (
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
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}


