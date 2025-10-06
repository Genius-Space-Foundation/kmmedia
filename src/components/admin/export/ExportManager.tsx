"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
} from "lucide-react";

interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  dateRange:
    | "last7days"
    | "last30days"
    | "last3months"
    | "last6months"
    | "custom";
  customStartDate?: string;
  customEndDate?: string;
  includeFields: string[];
}

interface ExportManagerProps {
  dataType: "users" | "courses" | "applications" | "payments" | "analytics";
  onExport: (options: ExportOptions) => Promise<void>;
  className?: string;
}

const exportFormats = [
  {
    value: "csv",
    label: "CSV",
    icon: FileText,
    description: "Comma-separated values",
  },
  {
    value: "excel",
    label: "Excel",
    icon: FileSpreadsheet,
    description: "Microsoft Excel format",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: FileText,
    description: "Portable Document Format",
  },
];

const dateRanges = [
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "last3months", label: "Last 3 months" },
  { value: "last6months", label: "Last 6 months" },
  { value: "custom", label: "Custom range" },
];

const fieldOptions = {
  users: [
    { value: "id", label: "User ID" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "status", label: "Status" },
    { value: "createdAt", label: "Created Date" },
    { value: "lastLogin", label: "Last Login" },
  ],
  courses: [
    { value: "id", label: "Course ID" },
    { value: "title", label: "Title" },
    { value: "instructor", label: "Instructor" },
    { value: "status", label: "Status" },
    { value: "price", label: "Price" },
    { value: "createdAt", label: "Created Date" },
    { value: "applications", label: "Applications Count" },
  ],
  applications: [
    { value: "id", label: "Application ID" },
    { value: "user", label: "Applicant" },
    { value: "course", label: "Course" },
    { value: "status", label: "Status" },
    { value: "submittedAt", label: "Submitted Date" },
    { value: "reviewedAt", label: "Reviewed Date" },
  ],
  payments: [
    { value: "id", label: "Payment ID" },
    { value: "user", label: "User" },
    { value: "amount", label: "Amount" },
    { value: "status", label: "Status" },
    { value: "type", label: "Type" },
    { value: "createdAt", label: "Created Date" },
    { value: "reference", label: "Reference" },
  ],
  analytics: [
    { value: "revenue", label: "Revenue Data" },
    { value: "users", label: "User Growth" },
    { value: "courses", label: "Course Statistics" },
    { value: "applications", label: "Application Trends" },
  ],
};

export default function ExportManager({
  dataType,
  onExport,
  className = "",
}: ExportManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: "last30days",
    includeFields: fieldOptions[dataType].map((field) => field.value),
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(exportOptions);
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (fieldValue: string) => {
    setExportOptions((prev) => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldValue)
        ? prev.includeFields.filter((f) => f !== fieldValue)
        : [...prev.includeFields, fieldValue],
    }));
  };

  const selectAllFields = () => {
    setExportOptions((prev) => ({
      ...prev,
      includeFields: fieldOptions[dataType].map((field) => field.value),
    }));
  };

  const clearAllFields = () => {
    setExportOptions((prev) => ({
      ...prev,
      includeFields: [],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>
              Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      exportOptions.format === format.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: format.value as any,
                      }))
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm">{format.label}</p>
                          <p className="text-xs text-gray-500">
                            {format.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <Select
              value={exportOptions.dateRange}
              onValueChange={(value) =>
                setExportOptions((prev) => ({
                  ...prev,
                  dateRange: value as any,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {exportOptions.dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    type="date"
                    value={exportOptions.customStartDate || ""}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        customStartDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={exportOptions.customEndDate || ""}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        customEndDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fields Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Fields</Label>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAllFields}>
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {fieldOptions[dataType].map((field) => (
                <div
                  key={field.value}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleField(field.value)}
                >
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFields.includes(field.value)}
                    onChange={() => toggleField(field.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{field.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Format:</span>
                  <Badge variant="secondary">
                    {
                      exportFormats.find(
                        (f) => f.value === exportOptions.format
                      )?.label
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date Range:</span>
                  <span className="text-sm font-medium">
                    {
                      dateRanges.find(
                        (r) => r.value === exportOptions.dateRange
                      )?.label
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fields:</span>
                  <span className="text-sm font-medium">
                    {exportOptions.includeFields.length} selected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || exportOptions.includeFields.length === 0}
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


