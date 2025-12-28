"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  ArrowLeft,
  PieChart,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  id: string;
  date: string;
  courseName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  notes?: string;
}

interface AttendanceSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  checkInCount: number;
  attendanceRate: number;
}

interface AttendanceReportProps {
  data: {
    records: AttendanceRecord[];
    summary: AttendanceSummary[];
    overallRate: number;
    totalCheckIns: number;
  };
  onBack: () => void;
}

export default function AttendanceReport({ data, onBack }: AttendanceReportProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "text-green-600 bg-green-50 border-green-100";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold font-inter text-neutral-900 leading-tight">Attendance Report</h2>
            <p className="text-neutral-500 text-sm">Comprehensive overview of your presence and engagement</p>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                <p className="text-[10px] uppercase tracking-wider font-bold text-brand-primary">Overall Presence</p>
                <p className="text-xl font-bold text-neutral-900">{data.overallRate}%</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white overflow-hidden">
          <CardHeader className="border-b border-neutral-50 bg-neutral-50/30">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-primary" />
              Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {data.summary.map((item) => (
                <div key={item.courseId} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-neutral-800">{item.courseTitle}</h4>
                      <p className="text-xs text-neutral-500">{item.completedLessons} of {item.totalLessons} lessons completed</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${item.attendanceRate >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.attendanceRate}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.attendanceRate} className="h-2 bg-neutral-100" />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">
                    <span>{item.checkInCount} Daily Check-ins</span>
                    <span>Target: 75%</span>
                  </div>
                </div>
              ))}
              {data.summary.length === 0 && (
                <div className="py-12 text-center">
                    <PieChart className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium">No course attendance data available yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Stats */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-brand-primary text-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Calendar className="h-10 w-10 text-white" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{data.totalCheckIns}</h3>
                    <p className="text-white/80 text-sm font-medium">Total Check-ins</p>
                </div>
                <div className="w-full pt-4 border-t border-white/20">
                    <p className="text-xs text-white/70 italic">Consistent attendance leads to better academic outcomes.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Key Metric</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Retention Score</p>
                        <p className="text-lg font-bold text-neutral-900">High</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Table */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-neutral-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-primary" />
            Detailed History
          </CardTitle>
          <CardDescription>Log of all presence confirmations and lesson activities</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {data.records.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 flex flex-col">
                        <span className="font-bold text-sm text-neutral-900">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] text-neutral-400 capitalize">{new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-sm text-neutral-700">
                            <BookOpen className="h-3 w-3 text-brand-primary" />
                            {record.courseName}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs truncate">
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))}
                {data.records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 font-medium">
                      No attendance records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
