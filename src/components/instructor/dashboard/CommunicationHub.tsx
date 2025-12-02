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
import IntegratedMessagingCenter from "./IntegratedMessagingCenter";
import {
  MessageSquare,
  Megaphone,
  Video,
  Users,
  Mail,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
} from "lucide-react";

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

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  category: string;
  isPinned: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: "Welcome" | "Reminder" | "Grade" | "General";
  lastUsed: string;
}

interface CommunicationStats {
  totalAnnouncements: number;
  unreadMessages: number;
  upcomingSessions: number;
  totalRecipients: number;
}

export default function CommunicationHub() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    totalAnnouncements: 0,
    unreadMessages: 0,
    upcomingSessions: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    courseId: "",
    isScheduled: false,
    scheduledFor: "",
    recipients: [] as string[],
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
      if (typeof window === "undefined") return;

      setLoading(true);

      const [announcementsRes, messagesRes] = await Promise.all([
        fetch("/api/instructor/announcements", { credentials: "include" }),
        fetch("/api/instructor/messages", { credentials: "include" }),
      ]);

      const announcementsData = await announcementsRes.json();
      const messagesData = await messagesRes.json();

      if (announcementsData.success) {
        setAnnouncements(announcementsData.data.announcements);
      }

      if (messagesData.success) {
        // Calculate stats from messages
        const unreadCount = messagesData.data.messages.filter(
          (m: any) => !m.isRead && m.recipientId === "current-user-id" // Ideally get current user ID
        ).length;
        
        setStats(prev => ({
          ...prev,
          totalAnnouncements: announcementsData.data.pagination?.total || 0,
          unreadMessages: unreadCount,
        }));
      }
      
      // Mock other data for now until endpoints exist
      setLiveSessions([]);
      setForumTopics([]);
      setEmailTemplates([]);

    } catch (error) {
      console.error("Error fetching communication data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/instructor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
        credentials: "include",
      });
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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/instructor/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
        credentials: "include",
      });
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

  // Handlers for IntegratedMessagingCenter
  const handleSendMessage = (message: any) => console.log("Send", message);
  const handleMarkAsRead = (id: string) => console.log("Read", id);
  const handleArchiveMessage = (id: string) => console.log("Archive", id);
  const handleDeleteMessage = (id: string) => console.log("Delete", id);
  const handleStartVideoCall = (id: string) => console.log("Call", id);

  if (loading) {
    return <div className="p-8 text-center">Loading communication hub...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalAnnouncements}
                </p>
                <p className="text-sm text-blue-700">Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.unreadMessages}
                </p>
                <p className="text-sm text-orange-700">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.upcomingSessions}
                </p>
                <p className="text-sm text-purple-700">Live Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {stats.totalRecipients}
                </p>
                <p className="text-sm text-green-700">Total Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Communication Hub</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAnnouncementForm(true)} className="bg-brand-primary text-white">
            <Plus className="h-4 w-4 mr-2" /> New Announcement
          </Button>
          <Button variant="outline" onClick={() => setShowSessionForm(true)}>
            <Video className="h-4 w-4 mr-2" /> Schedule Session
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="messages"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="announcements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Announcements
          </TabsTrigger>
          <TabsTrigger 
            value="forum"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Forum
          </TabsTrigger>
          <TabsTrigger 
            value="sessions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Live Sessions
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <IntegratedMessagingCenter
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            onArchiveMessage={handleArchiveMessage}
            onDeleteMessage={handleDeleteMessage}
            onStartVideoCall={handleStartVideoCall}
          />
        </TabsContent>

        <TabsContent value="announcements" className="mt-6 space-y-6">
          <div className="flex space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription>
                        {announcement.courseTitle || "All Students"} • {new Date(announcement.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={announcement.isPublished ? "default" : "secondary"}>
                        {announcement.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {announcement.isScheduled && <Badge variant="outline">Scheduled</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Read by {announcement.readCount} of {announcement.totalRecipients} students</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Duplicate</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forum" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <Input placeholder="Search topics..." className="max-w-md" />
            <Button variant="outline">New Topic</Button>
          </div>
          <div className="grid gap-4">
            {forumTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{topic.title}</h3>
                          {topic.isPinned && <Badge variant="secondary">Pinned</Badge>}
                          <Badge variant="outline">{topic.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Started by {topic.author} • Last active {new Date(topic.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{topic.replies}</p>
                        <p className="text-xs">Replies</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{topic.views}</p>
                        <p className="text-xs">Views</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 space-y-6">
          <div className="grid gap-4">
            {liveSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg h-fit">
                        <Video className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{session.title}</h3>
                        <p className="text-gray-600 mb-2">{session.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledFor).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(session.scheduledFor).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.currentParticipants}/{session.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button>Join Session</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{template.category}</Badge>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="mt-2">{template.name}</CardTitle>
                  <CardDescription>Subject: {template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">{template.content}</p>
                  <Button variant="outline" className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-gray-50">
              <div className="text-center">
                <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold">Create Template</h3>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showAnnouncementForm} onOpenChange={setShowAnnouncementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea 
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                rows={5}
                required 
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="schedule"
                checked={newAnnouncement.isScheduled}
                onCheckedChange={(c) => setNewAnnouncement({...newAnnouncement, isScheduled: c as boolean})}
              />
              <Label htmlFor="schedule">Schedule for later</Label>
            </div>
            {newAnnouncement.isScheduled && (
              <div>
                <Label>Date & Time</Label>
                <Input 
                  type="datetime-local"
                  value={newAnnouncement.scheduledFor}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, scheduledFor: e.target.value})}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
              <Button type="submit">Post Announcement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Live Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={newSession.title}
                onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>Date & Time</Label>
              <Input 
                type="datetime-local"
                value={newSession.scheduledFor}
                onChange={(e) => setNewSession({...newSession, scheduledFor: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input 
                type="number"
                value={newSession.duration}
                onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                required 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSessionForm(false)}>Cancel</Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
