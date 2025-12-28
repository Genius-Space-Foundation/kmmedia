"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Clock, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  enrolledCourses?: { id: string; title: string }[];
  onCheckIn?: (courseId: string, notes?: string) => Promise<void>;
  onViewFullReport?: () => void;
}

export default function AttendanceTracker({
  attendanceRate = 0,
  totalClasses = 0,
  attendedClasses = 0,
  history = [],
  enrolledCourses = [],
  onCheckIn,
  onViewFullReport,
}: AttendanceTrackerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  // Auto-select course if only one is available
  useEffect(() => {
    if (enrolledCourses.length === 1 && !selectedCourseId) {
      setSelectedCourseId(enrolledCourses[0].id);
    }
  }, [enrolledCourses, selectedCourseId]);


  const handleCheckIn = async () => {
    const courseToCheckIn = selectedCourseId || (enrolledCourses.length === 1 ? enrolledCourses[0].id : "");
    if (!courseToCheckIn || !onCheckIn) return;
    setIsSubmitting(true);
    try {
      await onCheckIn(courseToCheckIn, notes);
      setNotes("");
      if (enrolledCourses.length > 1) {
        setSelectedCourseId("");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        {/* Attendance Statistics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Overall Attendance (Lessons)</span>
            <span>{attendedClasses}/{totalClasses} Completed</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
        </div>

        {/* Check-in Section */}
        <div className="bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 space-y-3">
          <div className="flex items-center gap-2 text-brand-primary mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-wider">
              {enrolledCourses.length <= 1 ? "Daily Check-in" : "Quick Check-in"}
            </span>
          </div>
          
          <div className="space-y-3">
            {enrolledCourses.length > 1 && (
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {(enrolledCourses || []).filter(c => c && c.id).map((course, index) => (
                    <SelectItem key={`${course.id}-${index}`} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {enrolledCourses.length === 1 && (
              <div className="text-sm font-medium text-neutral-700 bg-white p-2 rounded border border-neutral-100">
                Course: <span className="text-brand-primary">{enrolledCourses[0].title}</span>
              </div>
            )}

            {enrolledCourses.length === 0 && (
              <div className="text-xs text-neutral-500 italic">
                No active enrollments for check-in.
              </div>
            )}

            {enrolledCourses.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="relative group">
                  <Input 
                    placeholder="Add a note (optional)..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white border-neutral-200 focus:ring-brand-primary h-11 pl-10"
                  />
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                
                <Button 
                  onClick={handleCheckIn} 
                  className="w-full h-12 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] group disabled:opacity-50 disabled:grayscale border-b-4 border-brand-secondary active:border-b-0"
                  disabled={(!selectedCourseId && enrolledCourses.length !== 1) || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">Verifying Identity...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5 group-hover:scale-125 transition-transform duration-300" />
                      <span>{enrolledCourses.length === 1 ? "Confirm Daily Presence" : "Mark Attendance Now"}</span>
                    </div>
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-neutral-400 uppercase tracking-widest font-medium">
                  Secure Identity verification enabled
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Recent History</h3>
          <div className="space-y-3">
            {(displayHistory || []).map((record, index) => (
              <div key={record.id || index} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
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
          <button 
            onClick={onViewFullReport}
            className="w-full py-2 text-sm text-brand-primary font-medium hover:text-brand-secondary transition-colors"
          >
            View Full Attendance Report
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
