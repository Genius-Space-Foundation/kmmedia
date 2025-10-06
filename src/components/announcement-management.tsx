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
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "GENERAL" | "COURSE_SPECIFIC" | "URGENT";
  targetAudience: "ALL_STUDENTS" | "COURSE_STUDENTS" | "SPECIFIC_STUDENTS";
  courseId?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  instructor: {
    name: string;
  };
  course?: {
    title: string;
  };
}

interface AnnouncementManagementProps {
  announcements: Announcement[];
  onCreateAnnouncement: (data: any) => void;
  onUpdateAnnouncement: (id: string, data: any) => void;
  onDeleteAnnouncement: (id: string) => void;
  onPublishAnnouncement: (id: string) => void;
}

export default function AnnouncementManagement({
  announcements,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onPublishAnnouncement,
}: AnnouncementManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [filter, setFilter] = useState({
    type: "ALL",
    status: "ALL",
    search: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "GENERAL" as const,
    targetAudience: "ALL_STUDENTS" as const,
    courseId: "",
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "COURSE_SPECIFIC":
        return "bg-blue-100 text-blue-800";
      case "GENERAL":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const handleCreateAnnouncement = () => {
    onCreateAnnouncement(newAnnouncement);
    setShowCreateDialog(false);
    setNewAnnouncement({
      title: "",
      content: "",
      type: "GENERAL",
      targetAudience: "ALL_STUDENTS",
      courseId: "",
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowEditDialog(true);
  };

  const handleUpdateAnnouncement = () => {
    if (selectedAnnouncement) {
      onUpdateAnnouncement(selectedAnnouncement.id, selectedAnnouncement);
      setShowEditDialog(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter.type !== "ALL" && announcement.type !== filter.type) {
      return false;
    }
    if (filter.status !== "ALL") {
      const isPublished = announcement.isPublished;
      if (filter.status === "PUBLISHED" && !isPublished) return false;
      if (filter.status === "DRAFT" && isPublished) return false;
    }
    if (
      filter.search &&
      !announcement.title.toLowerCase().includes(filter.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Announcement Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Announcement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Create and manage announcements for your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search announcements..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={filter.type}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="COURSE_SPECIFIC">
                    Course Specific
                  </SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-2">
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {announcement.content}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex space-x-2 mb-2">
                          <Badge className={getTypeColor(announcement.type)}>
                            {announcement.type.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={getStatusColor(announcement.isPublished)}
                          >
                            {announcement.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {announcement.course?.title || "All Students"}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          Edit
                        </Button>
                        {!announcement.isPublished && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onPublishAnnouncement(announcement.id)
                            }
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No announcements found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Announcement title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newAnnouncement.content}
                onChange={(e) =>
                  setNewAnnouncement((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Announcement content"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAnnouncement.type}
                  onValueChange={(value: any) =>
                    setNewAnnouncement((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="COURSE_SPECIFIC">
                      Course Specific
                    </SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select
                  value={newAnnouncement.targetAudience}
                  onValueChange={(value: any) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      targetAudience: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                    <SelectItem value="COURSE_STUDENTS">
                      Course Students
                    </SelectItem>
                    <SelectItem value="SPECIFIC_STUDENTS">
                      Specific Students
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newAnnouncement.targetAudience === "COURSE_STUDENTS" && (
              <div>
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={newAnnouncement.courseId}
                  onValueChange={(value) =>
                    setNewAnnouncement((prev) => ({ ...prev, courseId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course1">Course 1</SelectItem>
                    <SelectItem value="course2">Course 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                Create Announcement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedAnnouncement.title}
                  onChange={(e) =>
                    setSelectedAnnouncement((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={selectedAnnouncement.content}
                  onChange={(e) =>
                    setSelectedAnnouncement((prev) =>
                      prev ? { ...prev, content: e.target.value } : null
                    )
                  }
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={selectedAnnouncement.type}
                    onValueChange={(value: any) =>
                      setSelectedAnnouncement((prev) =>
                        prev ? { ...prev, type: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="COURSE_SPECIFIC">
                        Course Specific
                      </SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-targetAudience">Target Audience</Label>
                  <Select
                    value={selectedAnnouncement.targetAudience}
                    onValueChange={(value: any) =>
                      setSelectedAnnouncement((prev) =>
                        prev ? { ...prev, targetAudience: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                      <SelectItem value="COURSE_STUDENTS">
                        Course Students
                      </SelectItem>
                      <SelectItem value="SPECIFIC_STUDENTS">
                        Specific Students
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateAnnouncement}>
                  Update Announcement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
