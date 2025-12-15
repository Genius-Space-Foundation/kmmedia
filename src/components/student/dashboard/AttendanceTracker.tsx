"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  courseName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  notes?: string;
}

interface AttendanceTrackerProps {
  attendanceRate: number;
  totalClasses: number;
  attendedClasses: number;
  history?: AttendanceRecord[];
}

export default function AttendanceTracker({
  attendanceRate = 0,
  totalClasses = 0,
  attendedClasses = 0,
  history = [],
}: AttendanceTrackerProps) {
  
  const displayHistory: AttendanceRecord[] = history;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "text-green-600 bg-green-50 border-green-200";
      case "ABSENT": return "text-red-600 bg-red-50 border-red-200";
      case "LATE": return "text-orange-600 bg-orange-50 border-orange-200";
      case "EXCUSED": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT": return <CheckCircle className="h-4 w-4" />;
      case "ABSENT": return <XCircle className="h-4 w-4" />;
      case "LATE": return <Clock className="h-4 w-4" />;
      case "EXCUSED": return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border border-neutral-200 shadow-sm rounded-xl overflow-hidden h-full">
      <CardHeader className="bg-white border-b border-neutral-100 pb-4">
        <CardTitle className="text-lg font-bold text-neutral-900 flex items-center justify-between">
          <span>Attendance Tracker</span>
          <span className={`text-sm px-2 py-1 rounded-full ${attendanceRate >= 90 ? 'bg-green-100 text-green-700' : attendanceRate >= 75 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
            {attendanceRate}% Rate
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Overall Attendance</span>
            <span>{attendedClasses}/{totalClasses} Classes</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
          {attendanceRate < 80 && (
            <div className="flex items-start gap-2 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Warning: Your attendance is below 80%. Please contact your instructor.</span>
            </div>
          )}
        </div>

        {/* Recent History */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Recent History</h3>
          <div className="space-y-3">
            {displayHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{record.courseName}</p>
                    <p className="text-xs text-neutral-500">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(record.status)}`}>
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full py-2 text-sm text-brand-primary font-medium hover:text-brand-secondary transition-colors">
            View Full Attendance Report
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
