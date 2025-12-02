"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Users,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  Archive,
  Trash2,
  Flag,
  Reply,
  Forward,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "student" | "instructor" | "admin";
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "student" | "instructor" | "admin";
  };
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: "question" | "feedback" | "technical" | "general" | "assignment";
  course?: {
    id: string;
    title: string;
  };
  attachments: Attachment[];
  thread: Message[];
  tags: string[];
  status: "new" | "in_progress" | "resolved" | "archived";
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  course?: {
    id: string;
    title: string;
  };
}

interface IntegratedMessagingCenterProps {
  onSendMessage: (message: Partial<Message>) => void;
  onMarkAsRead: (messageId: string) => void;
  onArchiveMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onStartVideoCall: (participantId: string) => void;
}

export default function IntegratedMessagingCenter({
  onSendMessage,
  onMarkAsRead,
  onArchiveMessage,
  onDeleteMessage,
  onStartVideoCall,
}: IntegratedMessagingCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"inbox" | "conversations">(
    "conversations"
  );
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
    priority: "medium" as const,
    category: "general" as const,
  });
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchConversations();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/instructor/messages", { credentials: "include" });
      const data = await response.json();

      if (data.success) {
        // Transform API data to match component interface
        const transformedMessages = data.data.messages.map((msg: any) => ({
          id: msg.id,
          sender: {
            id: msg.sender.id,
            name: msg.sender.name,
            email: msg.sender.email,
            avatar: msg.sender.profile?.avatar,
            role: "student", // Defaulting for now, backend should provide
          },
          recipient: {
            id: msg.recipient.id,
            name: msg.recipient.name,
            email: msg.recipient.email,
            avatar: msg.recipient.profile?.avatar,
            role: "instructor",
          },
          subject: msg.subject,
          content: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.isRead || false,
          priority: msg.priority?.toLowerCase() || "medium",
          category: "general", // Default
          attachments: [],
          thread: [],
          tags: [],
          status: msg.status?.toLowerCase() || "new",
        }));
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockConversations: Conversation[] = [
        {
          id: "conv1",
          participants: [
            {
              id: "s1",
              name: "Sarah Johnson",
              avatar: "/avatars/sarah.jpg",
              role: "student",
            },
          ],
          lastMessage: {
            id: "1",
            sender: {
              id: "s1",
              name: "Sarah Johnson",
              email: "sarah.j@email.com",
              avatar: "/avatars/sarah.jpg",
              role: "student",
            },
            recipient: {
              id: "i1",
              name: "John Instructor",
              email: "john@instructor.com",
              avatar: "/avatars/john.jpg",
              role: "instructor",
            },
            subject: "Question about Assignment 3",
            content:
              "Hi Professor, I'm having trouble understanding the lighting setup...",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            priority: "medium",
            category: "question",
            attachments: [],
            thread: [],
            tags: [],
            status: "new",
          },
          unreadCount: 1,
          isGroup: false,
          course: {
            id: "c1",
            title: "Digital Photography Basics",
          },
        },
        {
          id: "conv2",
          participants: [
            {
              id: "s2",
              name: "Michael Chen",
              avatar: "/avatars/michael.jpg",
              role: "student",
            },
          ],
          lastMessage: {
            id: "2",
            sender: {
              id: "s2",
              name: "Michael Chen",
              email: "m.chen@email.com",
              avatar: "/avatars/michael.jpg",
              role: "student",
            },
            recipient: {
              id: "i1",
              name: "John Instructor",
              email: "john@instructor.com",
              avatar: "/avatars/john.jpg",
              role: "instructor",
            },
            subject: "Technical Issue with Video Upload",
            content: "I'm unable to upload my video assignment...",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            priority: "high",
            category: "technical",
            attachments: [],
            thread: [],
            tags: [],
            status: "new",
          },
          unreadCount: 1,
          isGroup: false,
          course: {
            id: "c2",
            title: "Video Production Mastery",
          },
        },
      ];

      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-neutral-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-neutral-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "question":
        return "❓";
      case "feedback":
        return "💬";
      case "technical":
        return "🔧";
      case "assignment":
        return "📝";
      case "general":
        return "📄";
      default:
        return "📄";
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffTime = now.getTime() - messageTime.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || message.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || message.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const urgentCount = messages.filter(
    (m) => m.priority === "urgent" && !m.isRead
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {messages.length}
                </p>
                <p className="text-sm text-blue-700">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {unreadCount}
                </p>
                <p className="text-sm text-orange-700">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Flag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">{urgentCount}</p>
                <p className="text-sm text-red-700">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {messages.filter((m) => m.status === "resolved").length}
                </p>
                <p className="text-sm text-green-700">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations/Messages List */}
        <Card className="lg:col-span-1 bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Messages</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "conversations" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("conversations")}
                >
                  Conversations
                </Button>
                <Button
                  variant={viewMode === "inbox" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("inbox")}
                >
                  Inbox
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex space-x-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="question">Questions</option>
                    <option value="feedback">Feedback</option>
                    <option value="technical">Technical</option>
                    <option value="assignment">Assignment</option>
                    <option value="general">General</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Message List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {viewMode === "conversations"
                  ? conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedConversation?.id === conversation.id
                            ? "bg-blue-50 border-neutral-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={conversation.participants[0]?.avatar}
                            />
                            <AvatarFallback>
                              {conversation.participants[0]?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {conversation.participants[0]?.name}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-brand-primary text-white text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {conversation.lastMessage.subject}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getTimeSince(conversation.lastMessage.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  : filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          !message.isRead
                            ? "bg-blue-50 border-neutral-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => onMarkAsRead(message.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>
                              {message.sender.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">
                                {message.sender.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">
                                  {getCategoryIcon(message.category)}
                                </span>
                                <Badge
                                  className={getPriorityColor(message.priority)}
                                >
                                  {message.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm font-medium truncate">
                              {message.subject}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">
                                {getTimeSince(message.timestamp)}
                              </p>
                              {message.attachments.length > 0 && (
                                <Paperclip className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>

              <Button
                onClick={() => setShowCompose(true)}
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Message Detail/Compose */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {showCompose
                  ? "Compose Message"
                  : selectedConversation
                  ? "Conversation"
                  : "Select a message"}
              </CardTitle>
              {selectedConversation && !showCompose && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onStartVideoCall(selectedConversation.participants[0].id)
                    }
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showCompose ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient
                    </label>
                    <Input
                      placeholder="Enter student name or email"
                      value={newMessage.recipient}
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          recipient: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newMessage.priority}
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    placeholder="Enter subject"
                    value={newMessage.subject}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, subject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={8}
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCompose(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        onSendMessage(newMessage);
                        setShowCompose(false);
                        setNewMessage({
                          recipient: "",
                          subject: "",
                          content: "",
                          priority: "medium",
                          category: "general",
                        });
                      }}
                      className="bg-brand-primary hover:bg-brand-primary/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedConversation ? (
              <div className="space-y-4">
                {/* Conversation Header */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={selectedConversation.participants[0]?.avatar}
                    />
                    <AvatarFallback>
                      {selectedConversation.participants[0]?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.participants[0]?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.participants[0]?.role}
                    </p>
                    {selectedConversation.course && (
                      <p className="text-xs text-blue-600">
                        {selectedConversation.course.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={selectedConversation.lastMessage.sender.avatar}
                        />
                        <AvatarFallback>
                          {selectedConversation.lastMessage.sender.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">
                            {selectedConversation.lastMessage.sender.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeSince(
                              selectedConversation.lastMessage.timestamp
                            )}
                          </p>
                        </div>
                        <h4 className="font-semibold mb-2">
                          {selectedConversation.lastMessage.subject}
                        </h4>
                        <p className="text-sm text-gray-700">
                          {selectedConversation.lastMessage.content}
                        </p>

                        {selectedConversation.lastMessage.attachments.length >
                          0 && (
                          <div className="mt-3 space-y-2">
                            {selectedConversation.lastMessage.attachments.map(
                              (attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-2 p-2 bg-white rounded border"
                                >
                                  <Paperclip className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {attachment.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.size)})
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply Box */}
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Type your reply..."
                    rows={3}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                    </Button>
                    <Button
                      size="sm"
                      className="bg-brand-primary hover:bg-brand-primary/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
