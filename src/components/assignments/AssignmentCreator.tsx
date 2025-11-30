"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, Eye, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { InstructorFileAttachment } from "./InstructorFileAttachment";
import { AssignmentPreview } from "./AssignmentPreview";

// Validation schema based on assignment service
const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  instructions: z
    .string()
    .max(10000, "Instructions must be less than 10000 characters")
    .optional(),
  dueDate: z
    .date()
    .refine((date) => !date || date > new Date(), "Due date must be in the future"),
  maxFileSize: z
    .number()
    .min(1, "Minimum file size is 1MB")
    .max(500, "Maximum file size is 500MB")
    .default(50),
  allowedFormats: z
    .array(z.enum(["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "png"]))
    .min(1, "At least one file format must be allowed"),
  maxFiles: z
    .number()
    .min(1, "Must allow at least 1 file")
    .max(10, "Cannot allow more than 10 files")
    .default(5),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z
    .number()
    .min(0, "Late penalty cannot be negative")
    .max(100, "Late penalty cannot exceed 100%")
    .optional(),
  totalPoints: z
    .number()
    .min(1, "Assignment must be worth at least 1 point")
    .max(1000, "Assignment cannot be worth more than 1000 points")
    .default(100),
  courseId: z.string().min(1, "Course is required"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentCreatorProps {
  courseId?: string;
  courses?: Array<{ id: string; title: string }>;
  onSave?: (
    data: AssignmentFormData & { attachments?: UploadedFile[] }
  ) => Promise<void>;
  onPublish?: (
    data: AssignmentFormData & { attachments?: UploadedFile[] }
  ) => Promise<void>;
  initialData?: Partial<AssignmentFormData>;
  isEditing?: boolean;
}

const FILE_FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF Documents" },
  { value: "doc", label: "Word Documents (.doc)" },
  { value: "docx", label: "Word Documents (.docx)" },
  { value: "jpg", label: "JPEG Images" },
  { value: "png", label: "PNG Images" },
  { value: "mp4", label: "MP4 Videos" },
  { value: "mov", label: "MOV Videos" },
  { value: "avi", label: "AVI Videos" },
];

export function AssignmentCreator({
  courseId,
  courses = [],
  onSave,
  onPublish,
  initialData,
  isEditing = false,
}: AssignmentCreatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      courseId: courseId || "",
      maxFileSize: 50,
      maxFiles: 5,
      totalPoints: 100,
      allowLateSubmission: false,
      allowedFormats: ["pdf", "doc", "docx"],
      ...initialData,
    },
  });

  const watchedValues = watch();
  const allowLateSubmission = watch("allowLateSubmission");

  const handleSave = async (data: AssignmentFormData) => {
    if (!onSave) return;

    setIsLoading(true);
    try {
      await onSave({ ...data, attachments });
    } catch (error) {
      console.error("Error saving assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = async () => {
    if (!onPublish) return;

    setIsLoading(true);
    try {
      await onPublish({ ...watchedValues, attachments });
      setShowPreview(false);
    } catch (error) {
      console.error("Error publishing assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    const currentFormats = watchedValues.allowedFormats || [];
    let newFormats;

    if (checked) {
      newFormats = [...currentFormats, format];
    } else {
      newFormats = currentFormats.filter((f) => f !== format);
    }

    setValue("allowedFormats", newFormats as any);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Assignment" : "Create New Assignment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter assignment title"
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {!courseId && (
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course *</Label>
                  <Select
                    value={watchedValues.courseId}
                    onValueChange={(value) => setValue("courseId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-sm text-red-600">
                      {errors.courseId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Provide a clear description of the assignment"
                rows={4}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Detailed Instructions</Label>
              <Textarea
                id="instructions"
                {...register("instructions")}
                placeholder="Provide detailed instructions for students (optional)"
                rows={6}
                aria-invalid={!!errors.instructions}
              />
              {errors.instructions && (
                <p className="text-sm text-red-600">
                  {errors.instructions.message}
                </p>
              )}
              <p className="text-sm text-gray-500">
                You can include formatting, requirements, grading criteria, etc.
              </p>
            </div>

            {/* Due Date and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedValues.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.dueDate ? (
                        format(new Date(watchedValues.dueDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedValues.dueDate}
                      onSelect={(date) => setValue("dueDate", date!)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-sm text-red-600">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints">Total Points *</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  {...register("totalPoints", { valueAsNumber: true })}
                  min="1"
                  max="1000"
                  aria-invalid={!!errors.totalPoints}
                />
                {errors.totalPoints && (
                  <p className="text-sm text-red-600">
                    {errors.totalPoints.message}
                  </p>
                )}
              </div>
            </div>

            {/* File Submission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  File Submission Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Allowed File Formats */}
                <div className="space-y-3">
                  <Label>Allowed File Formats *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FILE_FORMAT_OPTIONS.map((format) => (
                      <div
                        key={format.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={format.value}
                          checked={watchedValues.allowedFormats?.includes(
                            format.value as any
                          )}
                          onCheckedChange={(checked) =>
                            handleFormatChange(format.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={format.value} className="text-sm">
                          {format.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.allowedFormats && (
                    <p className="text-sm text-red-600">
                      {errors.allowedFormats.message}
                    </p>
                  )}
                </div>

                {/* File Size and Count Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB) *</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      {...register("maxFileSize", { valueAsNumber: true })}
                      min="1"
                      max="500"
                      aria-invalid={!!errors.maxFileSize}
                    />
                    {errors.maxFileSize && (
                      <p className="text-sm text-red-600">
                        {errors.maxFileSize.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxFiles">Max Number of Files *</Label>
                    <Input
                      id="maxFiles"
                      type="number"
                      {...register("maxFiles", { valueAsNumber: true })}
                      min="1"
                      max="10"
                      aria-invalid={!!errors.maxFiles}
                    />
                    {errors.maxFiles && (
                      <p className="text-sm text-red-600">
                        {errors.maxFiles.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Late Submission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Late Submission Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowLateSubmission"
                    checked={allowLateSubmission}
                    onCheckedChange={(checked) =>
                      setValue("allowLateSubmission", checked)
                    }
                  />
                  <Label htmlFor="allowLateSubmission">
                    Allow late submissions
                  </Label>
                </div>

                {allowLateSubmission && (
                  <div className="space-y-2">
                    <Label htmlFor="latePenalty">
                      Late Penalty (% per day) *
                    </Label>
                    <Input
                      id="latePenalty"
                      type="number"
                      {...register("latePenalty", { valueAsNumber: true })}
                      min="0"
                      max="100"
                      placeholder="e.g., 10 for 10% per day"
                      aria-invalid={!!errors.latePenalty}
                    />
                    {errors.latePenalty && (
                      <p className="text-sm text-red-600">
                        {errors.latePenalty.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Percentage of points deducted per day after the due date
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor File Attachments */}
            <InstructorFileAttachment
              files={attachments}
              onFilesChange={setAttachments}
              maxFiles={10}
              maxFileSize={50}
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={isLoading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Assignment"
                  : "Save Assignment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Assignment Preview Dialog */}
      <AssignmentPreview
        data={{
          ...watchedValues,
          attachments,
        }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={handlePublish}
        onEdit={() => setShowPreview(false)}
        isPublishing={isLoading}
        courseName={courses.find((c) => c.id === watchedValues.courseId)?.title}
      />
    </div>
  );
}
