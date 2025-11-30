import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScheduleEvent {
  id: string;
  title: string;
  course: {
    id: string;
    title: string;
  };
  type: "LIVE_CLASS" | "DEADLINE" | "EXAM" | "OFFICE_HOURS";
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
}

interface StudentScheduleProps {
  events: ScheduleEvent[];
  onJoinClass: (eventId: string) => void;
}

export default function StudentSchedule({ events, onJoinClass }: StudentScheduleProps) {
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const upcomingEvents = events
    .filter(e => new Date(e.startTime) >= today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "LIVE_CLASS": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DEADLINE": return "bg-red-100 text-red-800 border-red-200";
      case "EXAM": return "bg-purple-100 text-purple-800 border-purple-200";
      case "OFFICE_HOURS": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "LIVE_CLASS": return "🎥";
      case "DEADLINE": return "📅";
      case "EXAM": return "📝";
      case "OFFICE_HOURS": return "👨‍🏫";
      default: return "📌";
    }
  };

  const isEventLive = (event: ScheduleEvent) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Schedule & Calendar</h2>
        <p className="text-gray-600 mt-1">Manage your classes and deadlines</p>
      </div>

      {/* Week View */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-900">
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === today.toDateString();
              const dayEvents = events.filter(e => 
                new Date(e.startTime).toDateString() === day.toDateString()
              );

              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl ${isToday ? 'bg-brand-primary text-white' : 'bg-gray-50'}`}
                >
                  <div className="text-center">
                    <p className={`text-xs font-medium ${isToday ? 'text-white' : 'text-gray-500'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </p>
                    {dayEvents.length > 0 && (
                      <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${isToday ? 'bg-white' : 'bg-brand-primary'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-900">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const isLive = isEventLive(event);
                return (
                  <div 
                    key={event.id} 
                    className={`p-4 rounded-xl border-2 ${isLive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <Badge className={`${getEventTypeColor(event.type)} border`}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                          {isLive && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              🔴 LIVE NOW
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.course.title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span>
                            📅 {new Date(event.startTime).toLocaleDateString()}
                          </span>
                          <span>
                            ⏰ {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {event.isOnline ? (
                            <span>🌐 Online</span>
                          ) : event.location && (
                            <span>📍 {event.location}</span>
                          )}
                        </div>
                      </div>
                      {event.type === "LIVE_CLASS" && event.meetingLink && (
                        <Button 
                          onClick={() => onJoinClass(event.id)}
                          className={`rounded-xl ${isLive ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-brand-primary hover:bg-brand-primary/90'} text-white`}
                        >
                          {isLive ? '🎥 Join Now' : 'View Details'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg">No upcoming events</p>
              <p className="text-sm text-gray-400 mt-1">Your schedule is clear!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" className="rounded-xl h-auto py-4">
          <div className="text-center">
            <div className="text-2xl mb-1">📥</div>
            <p className="font-semibold">Export Schedule</p>
            <p className="text-xs text-gray-500">Download as iCal</p>
          </div>
        </Button>
        <Button variant="outline" className="rounded-xl h-auto py-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🔔</div>
            <p className="font-semibold">Set Reminders</p>
            <p className="text-xs text-gray-500">Get notified before events</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
