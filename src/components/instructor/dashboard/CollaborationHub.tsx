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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import {
  Users,
  UserPlus,
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Send,
  Video,
  Mic,
  Share2,
  Bell,
  Settings,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "INSTRUCTOR" | "ASSISTANT" | "REVIEWER" | "OBSERVER";
  permissions: string[];
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  joinedAt: string;
  lastActive: string;
}

interface CollaborationSession {
  id: string;
  title: string;
  type:
    | "LIVE_TEACHING"
    | "COLLABORATIVE_REVIEW"
    | "PLANNING_SESSION"
    | "PEER_REVIEW";
  participants: string[];
  scheduledFor: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  description: string;
  agenda: string[];
  recordingUrl?: string;
  notes?: string;
}

interface PeerReview {
  id: string;
  reviewer: string;
  reviewee: string;
  course: string;
  content: string;
  type: "COURSE_CONTENT" | "ASSESSMENT" | "LESSON_PLAN" | "RESOURCE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  rating: number;
  feedback: string;
  suggestions: string[];
  createdAt: string;
  dueDate: string;
}

interface CollaborationStats {
  totalTeamMembers: number;
  activeSessions: number;
  completedReviews: number;
  averageRating: number;
  collaborationHours: number;
}

export default function CollaborationHub() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("team");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "ASSISTANT",
    permissions: [] as string[],
  });
  const [newSession, setNewSession] = useState({
    title: "",
    type: "LIVE_TEACHING",
    participants: [] as string[],
    scheduledFor: "",
    duration: 60,
    description: "",
    agenda: [] as string[],
  });
  const [newReview, setNewReview] = useState({
    reviewee: "",
    course: "",
    content: "",
    type: "COURSE_CONTENT",
    dueDate: "",
  });

  useEffect(() => {
    fetchCollaborationData();
  }, []);

  const fetchCollaborationData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [teamResponse, sessionsResponse, reviewsResponse, statsResponse] =
        await Promise.all([
          makeAuthenticatedRequest("/api/instructor/collaboration/team"),
          makeAuthenticatedRequest("/api/instructor/collaboration/sessions"),
          makeAuthenticatedRequest("/api/instructor/collaboration/reviews"),
          makeAuthenticatedRequest("/api/instructor/collaboration/stats"),
        ]);

      if (teamResponse.success) setTeamMembers(teamResponse.data);
      if (sessionsResponse.success) setSessions(sessionsResponse.data);
      if (reviewsResponse.success) setPeerReviews(reviewsResponse.data);
      if (statsResponse.success) setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching collaboration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/collaboration/invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newInvite),
        }
      );

      if (response.success) {
        setShowInviteDialog(false);
        setNewInvite({ email: "", role: "ASSISTANT", permissions: [] });
        fetchCollaborationData();
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/collaboration/sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSession),
        }
      );

      if (response.success) {
        setShowSessionDialog(false);
        setNewSession({
          title: "",
          type: "LIVE_TEACHING",
          participants: [],
          scheduledFor: "",
          duration: 60,
          description: "",
          agenda: [],
        });
        fetchCollaborationData();
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/collaboration/reviews",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReview),
        }
      );

      if (response.success) {
        setShowReviewDialog(false);
        setNewReview({
          reviewee: "",
          course: "",
          content: "",
          type: "COURSE_CONTENT",
          dueDate: "",
        });
        fetchCollaborationData();
      }
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "INSTRUCTOR":
        return "bg-purple-100 text-purple-800";
      case "ASSISTANT":
        return "bg-blue-100 text-blue-800";
      case "REVIEWER":
        return "bg-green-100 text-green-800";
      case "OBSERVER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Collaboration Hub
          </CardTitle>
          <CardDescription>
            Manage team teaching, peer reviews, and collaborative sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Team Members
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalTeamMembers}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Sessions
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.activeSessions}
                      </p>
                    </div>
                    <Video className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed Reviews
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.completedReviews}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.averageRating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="team">Team Management</TabsTrigger>
              <TabsTrigger value="sessions">Collaboration Sessions</TabsTrigger>
              <TabsTrigger value="reviews">Peer Reviews</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Dialog
                  open={showInviteDialog}
                  onOpenChange={setShowInviteDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleInviteTeamMember}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newInvite.email}
                          onChange={(e) =>
                            setNewInvite((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newInvite.role}
                          onValueChange={(value) =>
                            setNewInvite((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASSISTANT">Assistant</SelectItem>
                            <SelectItem value="REVIEWER">Reviewer</SelectItem>
                            <SelectItem value="OBSERVER">Observer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Send Invitation
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Collaboration Sessions</h3>
                <Dialog
                  open={showSessionDialog}
                  onOpenChange={setShowSessionDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Collaboration Session</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Session Title</Label>
                        <Input
                          id="title"
                          value={newSession.title}
                          onChange={(e) =>
                            setNewSession((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Session Type</Label>
                        <Select
                          value={newSession.type}
                          onValueChange={(value) =>
                            setNewSession((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LIVE_TEACHING">
                              Live Teaching
                            </SelectItem>
                            <SelectItem value="COLLABORATIVE_REVIEW">
                              Collaborative Review
                            </SelectItem>
                            <SelectItem value="PLANNING_SESSION">
                              Planning Session
                            </SelectItem>
                            <SelectItem value="PEER_REVIEW">
                              Peer Review
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="scheduledFor">Scheduled For</Label>
                        <Input
                          id="scheduledFor"
                          type="datetime-local"
                          value={newSession.scheduledFor}
                          onChange={(e) =>
                            setNewSession((prev) => ({
                              ...prev,
                              scheduledFor: e.target.value,
                            }))
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
                            setNewSession((prev) => ({
                              ...prev,
                              duration: isNaN(numValue) ? 0 : numValue,
                            }));
                          }}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newSession.description}
                          onChange={(e) =>
                            setNewSession((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Schedule Session
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{session.title}</h4>
                          <Badge
                            className={getSessionStatusColor(session.status)}
                          >
                            {session.status}
                          </Badge>
                          <Badge variant="outline">{session.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {session.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(
                              session.scheduledFor
                            ).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {session.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.participants.length} participants
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === "SCHEDULED" && (
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Peer Reviews</h3>
                <Dialog
                  open={showReviewDialog}
                  onOpenChange={setShowReviewDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Request Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Peer Review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateReview} className="space-y-4">
                      <div>
                        <Label htmlFor="reviewee">Reviewer</Label>
                        <Select
                          value={newReview.reviewee}
                          onValueChange={(value) =>
                            setNewReview((prev) => ({
                              ...prev,
                              reviewee: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="content">Content to Review</Label>
                        <Textarea
                          id="content"
                          value={newReview.content}
                          onChange={(e) =>
                            setNewReview((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Review Type</Label>
                        <Select
                          value={newReview.type}
                          onValueChange={(value) =>
                            setNewReview((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COURSE_CONTENT">
                              Course Content
                            </SelectItem>
                            <SelectItem value="ASSESSMENT">
                              Assessment
                            </SelectItem>
                            <SelectItem value="LESSON_PLAN">
                              Lesson Plan
                            </SelectItem>
                            <SelectItem value="RESOURCE">Resource</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newReview.dueDate}
                          onChange={(e) =>
                            setNewReview((prev) => ({
                              ...prev,
                              dueDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Request Review
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {peerReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{review.content}</h4>
                          <Badge
                            className={getReviewStatusColor(review.status)}
                          >
                            {review.status}
                          </Badge>
                          <Badge variant="outline">{review.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Reviewer: {review.reviewer} | Course: {review.course}
                        </p>
                        {review.status === "COMPLETED" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Rating:
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Feedback:</p>
                              <p className="text-sm text-gray-600">
                                {review.feedback}
                              </p>
                            </div>
                            {review.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium">
                                  Suggestions:
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {review.suggestions.map((suggestion, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-3 w-3 mt-1 text-green-600" />
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {review.status === "PENDING" && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Settings</CardTitle>
                  <CardDescription>
                    Configure your collaboration preferences and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notifications">
                      Notification Preferences
                    </Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">
                          Email notifications for new reviews
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">
                          Reminders for upcoming sessions
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">
                          Weekly collaboration summary
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="permissions">
                      Default Permissions for New Members
                    </Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">View course content</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Participate in sessions</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Edit course content</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Manage assessments</span>
                      </label>
                    </div>
                  </div>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
