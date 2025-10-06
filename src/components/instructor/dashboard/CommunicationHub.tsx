"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  courseTitle?: string;
  isScheduled: boolean;
  scheduledFor?: string;
  isPublished: boolean;
  createdAt: string;
  recipients: string[];
  readCount: number;
  totalRecipients: number;
}

interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  attachments?: string[];
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  scheduledFor: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  meetingUrl?: string;
  recordingUrl?: string;
}

interface CommunicationStats {
  totalAnnouncements: number;
  unreadMessages: number;
  upcomingSessions: number;
  totalRecipients: number;
}

export default function CommunicationHub() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    totalAnnouncements: 0,
    unreadMessages: 0,
    upcomingSessions: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    courseId: "",
    isScheduled: false,
    scheduledFor: "",
    recipients: [] as string[],
  });

  // Message form
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    priority: "MEDIUM" as const,
  });

  // Live session form
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledFor: "",
    duration: 60,
    maxParticipants: 50,
  });

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  const fetchCommunicationData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [announcementsRes, messagesRes, sessionsRes, statsRes] =
        await Promise.all([
          makeAuthenticatedRequest("/api/instructor/announcements"),
          makeAuthenticatedRequest("/api/instructor/messages"),
          makeAuthenticatedRequest("/api/instructor/live-sessions"),
          makeAuthenticatedRequest("/api/instructor/communication-stats"),
        ]);

      const [announcementsData, messagesData, sessionsData, statsData] =
        await Promise.all([
          announcementsRes.json(),
          messagesRes.json(),
          sessionsRes.json(),
          statsRes.json(),
        ]);

      if (announcementsData.success) {
        const announcementsArray = Array.isArray(announcementsData.data)
          ? announcementsData.data
          : announcementsData.data?.announcements || [];
        setAnnouncements(announcementsArray);
      }
      if (messagesData.success) {
        const messagesArray = Array.isArray(messagesData.data)
          ? messagesData.data
          : messagesData.data?.messages || [];
        setMessages(messagesArray);
      }
      if (sessionsData.success) {
        const sessionsArray = Array.isArray(sessionsData.data)
          ? sessionsData.data
          : sessionsData.data?.sessions || [];
        setLiveSessions(sessionsArray);
      }
      if (statsData.success) setStats(statsData.data || {});
    } catch (error) {
      console.error("Error fetching communication data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/announcements",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnnouncement),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnnouncements([data.data, ...announcements]);
        setShowAnnouncementForm(false);
        setNewAnnouncement({
          title: "",
          content: "",
          courseId: "",
          isScheduled: false,
          scheduledFor: "",
          recipients: [],
        });
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages([data.data, ...messages]);
        setShowMessageForm(false);
        setNewMessage({
          to: "",
          subject: "",
          content: "",
          priority: "MEDIUM",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/live-sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSession),
        }
      );
      const data = await response.json();
      if (data.success) {
        setLiveSessions([data.data, ...liveSessions]);
        setShowSessionForm(false);
        setNewSession({
          title: "",
          description: "",
          courseId: "",
          scheduledFor: "",
          duration: 60,
          maxParticipants: 50,
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/messages/${messageId}/read`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(
          messages.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "LIVE":
        return "bg-green-100 text-green-800";
      case "ENDED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAnnouncements = (
    Array.isArray(announcements) ? announcements : []
  ).filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = (Array.isArray(messages) ? messages : []).filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessions = (
    Array.isArray(liveSessions) ? liveSessions : []
  ).filter(
    (session) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Communication Hub</h2>
        <div className="flex space-x-2">
          <Dialog
            open={showAnnouncementForm}
            onOpenChange={setShowAnnouncementForm}
          >
            <DialogTrigger asChild>
              <Button>Send Announcement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseId">Course (Optional)</Label>
                    <Select
                      value={newAnnouncement.courseId}
                      onValueChange={(value) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          courseId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Students</SelectItem>
                        {/* Add course options here */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isScheduled"
                      checked={newAnnouncement.isScheduled}
                      onCheckedChange={(checked) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          isScheduled: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="isScheduled">Schedule for later</Label>
                  </div>
                </div>
                {newAnnouncement.isScheduled && (
                  <div>
                    <Label htmlFor="scheduledFor">Scheduled For</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={newAnnouncement.scheduledFor}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          scheduledFor: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAnnouncementForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send Announcement</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={showMessageForm} onOpenChange={setShowMessageForm}>
            <DialogTrigger asChild>
              <Button variant="outline">Send Message</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={newMessage.to}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, to: e.target.value })
                    }
                    placeholder="Student email or name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newMessage.priority}
                    onValueChange={(value) =>
                      setNewMessage({ ...newMessage, priority: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMessageForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send Message</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Announcements
            </CardTitle>
            <span className="text-2xl">📢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Sent this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <span className="text-2xl">🎥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Live sessions scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recipients
            </CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients}</div>
            <p className="text-xs text-muted-foreground">
              Across all communications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription>
                        {announcement.courseTitle || "All Students"} •{" "}
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          announcement.isPublished ? "default" : "secondary"
                        }
                      >
                        {announcement.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {announcement.isScheduled && (
                        <Badge variant="outline">Scheduled</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {announcement.content}
                  </p>

                  <div className="flex justify-between text-sm">
                    <span>
                      Read by {announcement.readCount} of{" "}
                      {announcement.totalRecipients}
                    </span>
                    <span>
                      {Math.round(
                        (announcement.readCount /
                          announcement.totalRecipients) *
                          100
                      )}
                      % read rate
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Messages</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card
                key={message.id}
                className={`hover:shadow-md transition-shadow ${
                  !message.isRead ? "border-blue-200 bg-blue-50" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {message.subject}
                      </CardTitle>
                      <CardDescription>
                        From: {message.fromName} •{" "}
                        {new Date(message.sentAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      {!message.isRead && <Badge variant="default">New</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {message.content}
                  </p>

                  <div className="flex space-x-2">
                    {!message.isRead && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      Forward
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
              <DialogTrigger asChild>
                <Button>Schedule Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Live Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTitle">Title</Label>
                    <Input
                      id="sessionTitle"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionDescription">Description</Label>
                    <Textarea
                      id="sessionDescription"
                      value={newSession.description}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduledFor">Scheduled For</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={newSession.scheduledFor}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            scheduledFor: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newSession.duration || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue =
                            value === "" ? 0 : parseInt(value, 10);
                          setNewSession({
                            ...newSession,
                            duration: isNaN(numValue) ? 0 : numValue,
                          });
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newSession.maxParticipants || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value, 10);
                        setNewSession({
                          ...newSession,
                          maxParticipants: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSessionForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Schedule Session</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>{session.courseTitle}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Scheduled:</span>
                      <p className="text-muted-foreground">
                        {new Date(session.scheduledFor).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">
                        {session.duration} minutes
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Participants:</span>
                      <p className="text-muted-foreground">
                        {session.currentParticipants}/{session.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="text-muted-foreground">{session.status}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {session.status === "SCHEDULED" && (
                      <Button size="sm" className="flex-1">
                        Start Session
                      </Button>
                    )}
                    {session.status === "LIVE" && (
                      <Button size="sm" variant="outline" className="flex-1">
                        Join Session
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
