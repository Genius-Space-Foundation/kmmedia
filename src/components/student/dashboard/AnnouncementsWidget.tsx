"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertCircle, Info, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "URGENT" | "INFO" | "EVENT";
  date: string;
  author: string;
}

export default function AnnouncementsWidget() {
  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Class Cancelled - Photography Basics",
      message: "Due to studio renovation, today's class is cancelled. Makeup session scheduled for Dec 2nd.",
      type: "URGENT",
      date: "2 hours ago",
      author: "Admin Office"
    },
    {
      id: "2",
      title: "Guest Speaker: Jane Smith",
      message: "Join us next week for a special workshop with renowned photographer Jane Smith.",
      type: "EVENT",
      date: "Yesterday",
      author: "Department Head"
    },
    {
      id: "3",
      title: "Assignment Deadline Extended",
      message: "The deadline for the Lighting Project has been extended by 24 hours.",
      type: "INFO",
      date: "2 days ago",
      author: "John Doe"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "URGENT": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "EVENT": return <Calendar className="h-5 w-5 text-brand-primary" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "URGENT": return "bg-red-50 border-red-100";
      case "EVENT": return "bg-brand-primary/5 border-brand-primary/10";
      default: return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <Card className="border border-neutral-200 shadow-sm rounded-xl overflow-hidden h-full">
      <CardHeader className="bg-white border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-primary" />
          <CardTitle className="text-lg font-bold text-neutral-900">
            Announcements
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-100">
          {announcements.map((item) => (
            <div key={item.id} className={`p-4 hover:bg-neutral-50 transition-colors ${item.type === 'URGENT' ? 'bg-red-50/30' : ''}`}>
              <div className="flex gap-3">
                <div className={`mt-1 p-2 rounded-full h-fit ${getBgColor(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${item.type === 'URGENT' ? 'text-red-700' : 'text-neutral-900'}`}>
                      {item.title}
                    </h4>
                    <span className="text-xs text-neutral-400 whitespace-nowrap ml-2">{item.date}</span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-xs text-neutral-400 pt-1">
                    Posted by {item.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-neutral-100 bg-neutral-50">
          <button className="w-full text-center text-xs font-medium text-neutral-500 hover:text-brand-primary transition-colors">
            View All Announcements
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
