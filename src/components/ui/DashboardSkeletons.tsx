"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MetricCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-gray-100 overflow-hidden">
      <CardContent className="pt-6 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-8 w-16 bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-4 w-32 bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 bg-gray-100" />
          <Skeleton className="h-4 w-64 bg-gray-100" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full flex flex-col justify-end gap-2 pb-2">
          {/* Mock Chart Area */}
          <div className="flex items-end justify-between h-64 px-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton 
                key={i} 
                className={`w-[8%] bg-gray-100 rounded-t-lg`} 
                style={{ height: `${Math.floor(Math.random() * 80) + 20}%` }}
              />
            ))}
          </div>
          {/* Axis labels */}
          <div className="flex justify-between px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-3 w-10 bg-gray-100" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSkeletons() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-gray-100" />
          <Skeleton className="h-4 w-48 bg-gray-100" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 bg-gray-100 rounded-xl" />
          <Skeleton className="h-10 w-40 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 bg-gray-100" />
              <Skeleton className="h-4 w-32 bg-gray-100" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full space-y-8 pt-4">
             <Skeleton className="h-20 w-20 rounded-full bg-gray-100" />
             <div className="w-full space-y-4">
               <Skeleton className="h-4 w-full bg-gray-100" />
               <Skeleton className="h-2 w-full bg-gray-100 rounded-full" />
               <div className="grid grid-cols-2 gap-4 mt-8">
                 <Skeleton className="h-12 w-full bg-gray-50 rounded-xl" />
                 <Skeleton className="h-12 w-full bg-gray-50 rounded-xl" />
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-0 shadow-lg bg-gray-50 overflow-hidden">
          <Skeleton className="h-48 w-full rounded-none bg-gray-200" />
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 bg-gray-200" />
              <Skeleton className="h-4 w-12 bg-gray-200" />
            </div>
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
              <Skeleton className="h-4 w-32 bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StudentCourseSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4 bg-gray-100" />
          <Skeleton className="h-4 w-full bg-gray-100" />
          <Skeleton className="h-4 w-5/6 bg-gray-100" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-6 w-24 bg-gray-100 rounded-full" />
            <Skeleton className="h-6 w-24 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="w-full md:w-64 space-y-4">
          <Skeleton className="h-32 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full bg-gray-50 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full bg-gray-50 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full bg-gray-50 rounded-xl" />
            <Skeleton className="h-40 w-full bg-gray-50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
