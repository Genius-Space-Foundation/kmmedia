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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Filter,
  Search,
  Download,
  Mail,
  Clock,
  User,
  BookOpen,
  DollarSign,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckSquare,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/api-utils";
import ManagementHeader from "../shared/ManagementHeader";
import BulkActionsModal from "../shared/BulkActionsModal";

interface Application {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    name: string;
    email: string;
    image?: string;
    profileImage?: string;
    phones?: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
    applicationFee: number;
    instructor: {
      name: string;
      email: string;
    };
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  documents: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentReference?: string;
}

interface ApplicationManagementProps {
  onRefresh?: () => void;
}

export default function ApplicationManagement({
  onRefresh,
}: ApplicationManagementProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");
      const data = await safeJsonParse(response, {
        success: false,
        data: [],
      });

      if (data.success) {
        // Handle both pagination format and direct array format
        const rawApps = data.data?.applications || (Array.isArray(data.data) ? data.data : []);
        
        // Map API response to UI model
        const apps = rawApps.map((app: any) => {
          // Find any successful payment, otherwise use the most recent one (which is first due to API sorting)
          const successfulPayment = app.payments?.find((p: any) => p.status === "COMPLETED");
          const latestPayment = app.payments?.[0]; // API returns most recent first
          
          return {
            ...app,
            appliedAt: app.submittedAt || app.createdAt,
            // Prioritize seeing a successful payment, regardless of subsequent failed attempts (redundant checks etc)
            paymentStatus: successfulPayment?.status || latestPayment?.status || "PENDING",
            paymentReference: successfulPayment?.reference || latestPayment?.reference,
          };
        });
        
        setApplications(apps);
      } else {
        console.error("API returned error:", data.message);
        toast.error(data.message || "Failed to fetch applications");
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "APPROVE" | "REJECT" | "UNDER_REVIEW",
    comment?: string
  ) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status:
            action === "APPROVE"
              ? "APPROVED"
              : action === "REJECT"
              ? "REJECTED"
              : action,
          reviewNotes: comment,
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(`Application ${action.toLowerCase()}d successfully`);
        fetchApplications();
        setShowDetails(false);
        if (onRefresh) onRefresh();
      } else {

        let errorMessage = "Failed to update application";
        try {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            errorMessage = data.message || errorMessage;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: string, comment: string) => {
    if (selectedApplications.length === 0) {
      toast.error("Please select applications to process");
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/admin/applications/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action,
          reviewNotes: comment,
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(
          `Bulk action completed for ${selectedApplications.length} applications`
        );
        setSelectedApplications([]);
        setShowBulkActions(false);
        fetchApplications();
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

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    const filteredApplications = getFilteredApplications();
    const safeFilteredApplications = Array.isArray(filteredApplications)
      ? filteredApplications
      : [];
    if (selectedApplications.length === safeFilteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(safeFilteredApplications.map((app) => app.id));
    }
  };

  const getFilteredApplications = () => {
    // Ensure applications is always an array
    let filtered = Array.isArray(applications) ? applications : [];

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredApplications = getFilteredApplications();

  // Safety check to ensure filteredApplications is always an array
  const safeFilteredApplications = Array.isArray(filteredApplications)
    ? filteredApplications
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <ManagementHeader
        title="Application Management"
        description="Review and manage course applications"
        selectedCount={selectedApplications.length}
        onBulkAction={() => setShowBulkActions(true)}
        onRefresh={fetchApplications}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Applications ({safeFilteredApplications.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedApplications.length ===
                    safeFilteredApplications.length &&
                  safeFilteredApplications.length > 0
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
          ) : safeFilteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeFilteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={selectedApplications.includes(
                            application.id
                          )}
                          onCheckedChange={() =>
                            handleSelectApplication(application.id)
                          }
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.user.image || application.user.profileImage} />
                          <AvatarFallback>
                            {application.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {application.user.name}
                            </h3>
                            <Badge
                              className={getStatusColor(application.status)}
                            >
                              {application.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              className={getPaymentStatusColor(
                                application.paymentStatus
                              )}
                            >
                              Payment: {application.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Mail className="h-4 w-4 inline mr-1" />
                            {application.user.email}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <BookOpen className="h-4 w-4 inline mr-1" />
                            Course: {application.course.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <User className="h-4 w-4 inline mr-1" />
                            Instructor: {application.course.instructor.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <DollarSign className="h-4 w-4 inline mr-1" />
                            Application Fee: GH₵
                            {application.course.applicationFee.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Applied:{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </p>
                          {application.documents.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              <FileText className="h-4 w-4 inline mr-1" />
                              {application.documents.length} document(s)
                              uploaded
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {application.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApplicationAction(
                                  application.id,
                                  "APPROVE"
                                )
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
                                handleApplicationAction(
                                  application.id,
                                  "REJECT"
                                )
                              }
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
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

      {/* Application Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedApplication.user.image || selectedApplication.user.profileImage} />
                      <AvatarFallback>
                        {selectedApplication.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {selectedApplication.user.name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedApplication.user.email}
                      </p>
                      {selectedApplication.user.phone && (
                        <p className="text-gray-600">
                          {selectedApplication.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Course:</strong>{" "}
                      {selectedApplication.course.title}
                    </p>
                    <p>
                      <strong>Instructor:</strong>{" "}
                      {selectedApplication.course.instructor.name}
                    </p>
                    <p>
                      <strong>Course Price:</strong> GH₵
                      {selectedApplication.course.price.toLocaleString()}
                    </p>
                    <p>
                      <strong>Application Fee:</strong> GH₵
                      {selectedApplication.course.applicationFee.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              {selectedApplication.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedApplication.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{doc.name}</span>
                            <Badge variant="outline">{doc.type}</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Actions */}
              {selectedApplication.status === "PENDING" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="review-comment">Review Comments</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Add your review comments..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleApplicationAction(
                            selectedApplication.id,
                            "APPROVE"
                          )
                        }
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleApplicationAction(
                            selectedApplication.id,
                            "REJECT"
                          )
                        }
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleApplicationAction(
                            selectedApplication.id,
                            "UNDER_REVIEW"
                          )
                        }
                        disabled={processing}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Mark Under Review
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
        selectedCount={selectedApplications.length}
        loading={processing}
        actions={[
          { value: "APPROVE", label: "Approve All" },
          { value: "REJECT", label: "Reject All" },
          { value: "UNDER_REVIEW", label: "Mark Under Review" },
        ]}
        commentPlaceholder="Add comments for all selected applications..."
      />
    </div>
  );
}
