"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Mail,
  Calendar,
  User,
  DollarSign,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CheckSquare,
  X,
  Plus,
  FileText,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/api-utils";
import ManagementHeader from "../shared/ManagementHeader";
import BulkActionsModal from "../shared/BulkActionsModal";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  approvalComments?: string;
  price: number;
  applicationFee: number;
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  _count: {
    applications: number;
    enrollments: number;
  };
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
}

interface CourseManagementProps {
  onRefresh?: () => void;
}

export default function CourseManagement({ onRefresh }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });

      if (data.success) {
        setCourses(Array.isArray(data.data?.courses) ? data.data.courses : []);
      } else {
        console.error("API returned error:", data.message);
        toast.error(data.message || "Failed to fetch courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAction = async (
    courseId: string,
    action: "APPROVE" | "REJECT" | "PUBLISH" | "UNPUBLISH",
    comments?: string
  ) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comments,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(`Course ${action.toLowerCase()}d successfully`);
        fetchCourses();
        setShowDetails(false);
        if (onRefresh) onRefresh();
      } else {
        const errorData = await safeJsonParse(response, {
          message: "Unknown error",
        });
        console.error("Course update failed:", errorData);
        toast.error(
          (errorData.message || "Failed to update course") + 
          (errorData.error ? `: ${errorData.error}` : "")
        );
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: string, comment: string) => {
    if (selectedCourses.length === 0) {
      toast.error("Please select courses to process");
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/admin/courses/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseIds: selectedCourses,
          action,
          comments: comment,
        }),
      });

      if (response.ok) {
        toast.success(
          `Bulk action completed for ${selectedCourses.length} courses`
        );
        setSelectedCourses([]);
        setShowBulkActions(false);
        fetchCourses();
        if (onRefresh) onRefresh();
      } else {
        const error = await safeJsonParse(response, {
          message: "Failed to process bulk action",
        });
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Error processing bulk action:", error);
      toast.error("Failed to process bulk action");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    const filteredCourses = getFilteredCourses();
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map((course) => course.id));
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((course) => course.status === filterStatus);
    }

    if (filterCategory !== "ALL") {
      filtered = filtered.filter(
        (course) => course.category === filterCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCourses = getFilteredCourses();

  const courseStats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    pending: courses.filter((c) => c.status === "PENDING_APPROVAL").length,
    draft: courses.filter((c) => c.status === "DRAFT").length,
    rejected: courses.filter((c) => c.status === "REJECTED").length,
    totalRevenue: courses.reduce(
      (sum, course) => sum + course._count.enrollments * course.price,
      0
    ),
  };

  const categories = [...new Set(courses.map((course) => course.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <ManagementHeader
        title="Course Management"
        description="Manage and approve course submissions"
        selectedCount={selectedCourses.length}
        onBulkAction={() => setShowBulkActions(true)}
        onRefresh={fetchCourses}
        additionalButtons={
          <Button onClick={() => setShowCreateCourse(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{courseStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{courseStats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{courseStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  GH₵{courseStats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">
                  Pending Approval
                </SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Courses ({filteredCourses.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedCourses.length === filteredCourses.length &&
                  filteredCourses.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No courses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={() => handleSelectCourse(course.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {course.title}
                            </h3>
                            <Badge className={getStatusColor(course.status)}>
                              {course.status.replace("_", " ")}
                            </Badge>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{course.instructor.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{course.duration} hours</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>GH₵{course.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {course._count.enrollments} enrollments
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>
                                {course._count.applications} applications
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Created:{" "}
                                {new Date(
                                  course.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {course.tags && course.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {course.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {course.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{course.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit course
                            toast.info("Edit course functionality coming soon");
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {course.status === "PENDING_APPROVAL" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleCourseAction(course.id, "APPROVE")
                              }
                              disabled={processing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCourseAction(course.id, "REJECT")
                              }
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {course.status === "APPROVED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleCourseAction(course.id, "PUBLISH")
                            }
                            disabled={processing}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        {course.status === "PUBLISHED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCourseAction(course.id, "UNPUBLISH")
                            }
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Unpublish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedCourse.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {selectedCourse.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedCourse.status)}>
                        {selectedCourse.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getLevelColor(selectedCourse.level)}>
                        {selectedCourse.level}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <p className="text-gray-600">
                          {selectedCourse.category}
                        </p>
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <p className="text-gray-600">
                          {selectedCourse.duration} hours
                        </p>
                      </div>
                      <div>
                        <Label>Course Price</Label>
                        <p className="text-gray-600">
                          GH₵{selectedCourse.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Application Fee</Label>
                        <p className="text-gray-600">
                          GH₵{selectedCourse.applicationFee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Instructor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedCourse.instructor.avatar} />
                      <AvatarFallback>
                        {selectedCourse.instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {selectedCourse.instructor.name}
                      </h4>
                      <p className="text-gray-600">
                        {selectedCourse.instructor.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Course Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedCourse._count.enrollments}
                      </p>
                      <p className="text-sm text-gray-600">Enrollments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedCourse._count.applications}
                      </p>
                      <p className="text-sm text-gray-600">Applications</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        GH₵
                        {(
                          selectedCourse._count.enrollments *
                          selectedCourse.price
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              {selectedCourse.requirements &&
                selectedCourse.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedCourse.requirements.map((req, index) => (
                          <li key={index} className="text-gray-600">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {selectedCourse.objectives &&
                selectedCourse.objectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedCourse.objectives.map((obj, index) => (
                          <li key={index} className="text-gray-600">
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Course Actions */}
              {selectedCourse.status === "PENDING_APPROVAL" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="approval-comments">
                        Approval Comments
                      </Label>
                      <Textarea
                        id="approval-comments"
                        placeholder="Add your approval comments..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleCourseAction(selectedCourse.id, "APPROVE")
                        }
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Course
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleCourseAction(selectedCourse.id, "REJECT")
                        }
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        onConfirm={handleBulkAction}
        selectedCount={selectedCourses.length}
        loading={processing}
        actions={[
          { value: "APPROVE", label: "Approve All" },
          { value: "REJECT", label: "Reject All" },
          { value: "PUBLISH", label: "Publish All" },
          { value: "UNPUBLISH", label: "Unpublish All" },
        ]}
        commentPlaceholder="Add comments for bulk action (optional)..."
      />
    </div>
  );
}
