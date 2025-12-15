"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";

interface ClassSession {
  id: string;
  title: string;
  courseTitle: string;
  startTime: Date;
  endTime: Date;
  location: string;
  instructor: string;
  type: "LECTURE" | "LAB" | "WORKSHOP" | "STUDIO";
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
}

interface ClassScheduleWidgetProps {
  classes?: ClassSession[];
  onViewClassDetails?: (classSession: any) => void;
}

export default function ClassScheduleWidget({ classes = [], onViewClassDetails }: ClassScheduleWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const displayClasses = classes;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + i);
    return date;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "LECTURE": return "bg-blue-100 text-blue-800 border-blue-200";
      case "LAB": return "bg-purple-100 text-purple-800 border-purple-200";
      case "WORKSHOP": return "bg-orange-100 text-orange-800 border-orange-200";
      case "STUDIO": return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleViewDetails = (session: ClassSession) => {
    if (onViewClassDetails) {
      // Map to the format expected by UpcomingClassDetailModal
      onViewClassDetails({
        id: session.id,
        title: session.title,
        courseName: session.courseTitle,
        date: session.startTime.toISOString().split('T')[0],
        startTime: session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60),
        type: "HYBRID", // Default mapping
        instructor: {
          id: "inst-1",
          name: session.instructor,
          photo: "/images/avatars/instructor.jpg",
          bio: "Experienced instructor with over 10 years of teaching experience."
        },
        location: session.location,
        status: session.status,
        agenda: [
          "Introduction and Attendance",
          "Core Concepts Review",
          "Practical Demonstration",
          "Student Practice Session",
          "Q&A and Wrap-up"
        ],
        materials: [
          {
            id: "m1",
            name: "Class Slides",
            type: "PDF",
            url: "#",
            downloadable: true
          },
          {
            id: "m2",
            name: "Reference Guide",
            type: "DOCUMENT",
            url: "#",
            downloadable: true
          }
        ]
      });
    }
  };

  return (
    <Card className="border border-neutral-200 shadow-sm rounded-xl overflow-hidden h-full">
      <CardHeader className="bg-white border-b border-neutral-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <CardTitle className="text-lg font-bold text-neutral-900">
              Class Schedule
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevWeek} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-neutral-600 min-w-[100px] text-center">
              {weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" onClick={nextWeek} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Week Grid */}
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`p-3 text-center border-r border-neutral-100 last:border-r-0 ${isToday ? 'bg-brand-primary/5' : ''}`}>
                <div className="text-xs text-neutral-500 font-medium mb-1">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className={`text-sm font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-brand-primary text-white' : 'text-neutral-900'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Classes List */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Upcoming Classes</h3>
          {displayClasses.map((session) => (
            <div key={session.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-neutral-200 hover:border-brand-primary/50 hover:shadow-md transition-all bg-white group">
              {/* Time Column */}
              <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-neutral-100 pr-4">
                <span className="text-lg font-bold text-neutral-900">
                  {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-neutral-500">
                  {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Details Column */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-sm text-neutral-600">{session.courseTitle}</p>
                  </div>
                  <Badge className={getTypeColor(session.type)}>
                    {session.type}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{session.instructor}</span>
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex items-center justify-end">
                <Button 
                  className="bg-brand-primary hover:bg-brand-secondary text-white w-full sm:w-auto"
                  onClick={() => handleViewDetails(session)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
          
          {displayClasses.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No classes scheduled for this period.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
