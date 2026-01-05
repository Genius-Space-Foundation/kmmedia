"use client";

import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, Eye, Upload, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { InstructorFileAttachment } from "./InstructorFileAttachment";
import { AssignmentPreview } from "./AssignmentPreview";

interface FormErrorProps {
  message: string;
  className?: string;
  id?: string;
}

/**
 * FormError component displays consistent error messages with icon and styling
 * 
 * @param {string} message - Error message to display
 * @param {string} [className] - Additional CSS classes
 * @param {string} [id] - HTML ID attribute for accessibility
 * @returns {JSX.Element} Error message component
 */
const FormError = React.memo(({ message, className, id }: FormErrorProps) => (
  <p 
    id={id}
    className={cn("text-sm text-red-600 flex items-center gap-1", className)}
  >
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
  </p>
));

FormError.displayName = 'FormError';

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
    .optional()
    .transform((val) => val?.trim() || undefined),
  dueDate: z
    .date({
      required_error: "Due date is required",
      invalid_type_error: "Please select a valid date"
    })
    .refine((date) => date > new Date(), "Due date must be in the future"),
  maxFileSize: z
    .number({
      required_error: "Max file size is required",
      invalid_type_error: "File size must be a number"
    })
    .min(1, "Minimum file size is 1MB")
    .max(500, "Maximum file size is 500MB")
    .default(50),
  allowedFormats: z
    .array(z.enum(["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "png"]))
    .min(1, "At least one file format must be allowed"),
  maxFiles: z
    .number({
      required_error: "Max files is required",
      invalid_type_error: "Max files must be a number"
    })
    .min(1, "Must allow at least 1 file")
    .max(10, "Cannot allow more than 10 files")
    .default(5),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z
    .number({
      invalid_type_error: "Late penalty must be a number"
    })
    .min(0, "Late penalty cannot be negative")
    .max(100, "Late penalty cannot exceed 100%")
    .optional(),
  totalPoints: z
    .number({
      required_error: "Points value is required",
      invalid_type_error: "Points must be a number"
    })
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
  className?: string;
  disabled?: boolean;
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

/**
 * AssignmentCreator component provides a comprehensive form for creating and editing assignments
 * with validation, file attachment system, and preview functionality.
 * 
 * @param {string} [courseId] - Pre-selected course ID (optional)
 * @param {Array<{id: string, title: string}>} [courses=[]] - Available courses to select from
 * @param {Function} [onSave] - Handler called when saving assignment data
 * @param {Function} [onPublish] - Handler called when publishing assignment
 * @param {Partial<AssignmentFormData>} [initialData] - Initial form data for editing existing assignments
 * @param {boolean} [isEditing=false] - Whether the form is in edit mode
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [disabled=false] - Whether the form is disabled
 * @returns {JSX.Element} Assignment creation form component
 */
export function AssignmentCreator({
  courseId,
  courses = [],
  onSave,
  onPublish,
  initialData,
  isEditing = false,
  className,
  disabled = false,
}: AssignmentCreatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const finalDisabled = disabled || isLoading;

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
  
  // Memoize course selection for performance
  const selectedCourse = React.useMemo(() => {
    return courses.find((c) => c.id === watchedValues.courseId)?.title;
  }, [courses, watchedValues.courseId]);

  const handleSave = async (data: AssignmentFormData) => {
    if (!onSave || finalDisabled) return;

    setIsLoading(true);
    try {
      await onSave({ ...data, attachments });
    } catch (error) {
      console.error("Error saving assignment:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = async () => {
    if (!onPublish || finalDisabled) return;

    setIsLoading(true);
    try {
      await onPublish({ ...watchedValues, attachments });
      setShowPreview(false);
    } catch (error) {
      console.error("Error publishing assignment:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = useCallback((format: string, checked: boolean) => {
    const currentFormats = watchedValues.allowedFormats || [];
    let newFormats;

    if (checked) {
      newFormats = [...currentFormats, format];
    } else {
      newFormats = currentFormats.filter((f) => f !== format);
    }

    setValue("allowedFormats", newFormats as any);
  }, [watchedValues.allowedFormats, setValue]);

  // Helper components for form sections
  const BasicInfoSection = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" asChild>
          <h2>Basic Information</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter assignment title"
              aria-invalid={!!errors.title}
              disabled={finalDisabled}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <FormError message={errors.title.message} id="title-error" />
            )}
          </div>

          {!courseId && (
            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select
                value={watchedValues.courseId}
                onValueChange={(value) => setValue("courseId", value)}
                disabled={finalDisabled}
                aria-invalid={!!errors.courseId}
                aria-describedby={errors.courseId ? "courseId-error" : undefined}
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
                <FormError message={errors.courseId.message} id="courseId-error" />
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Provide a clear description of the assignment"
            rows={4}
            aria-invalid={!!errors.description}
            disabled={finalDisabled}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && (
            <FormError message={errors.description.message} id="description-error" />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Detailed Instructions</Label>
          <Textarea
            id="instructions"
            {...register("instructions")}
            placeholder="Provide detailed instructions for students (optional)"
            rows={6}
            aria-invalid={!!errors.instructions}
            disabled={finalDisabled}
            aria-describedby={errors.instructions ? "instructions-error" : undefined}
          />
          {errors.instructions && (
            <FormError message={errors.instructions.message} id="instructions-error" />
          )}
          <p className="text-sm text-gray-500">
            You can include formatting, requirements, grading criteria, etc.
          </p>
        </div>
      </CardContent>
    </Card>
  ), [register, errors, watchedValues.courseId, setValue, courseId, courses, finalDisabled]);

  const DueDateAndPointsSection = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" asChild>
          <h2>Due Date & Points</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Controller
              name="dueDate"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <DatePicker
                  id="dueDate"
                  value={value ? new Date(value) : undefined}
                  onChange={onChange}
                  disabled={finalDisabled}
                  minDate={new Date()}
                  label="Due Date *"
                  error={errors.dueDate?.message}
                  {...field}
                />
              )}
            />
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
              disabled={finalDisabled}
              aria-describedby={errors.totalPoints ? "totalPoints-error" : undefined}
            />
            {errors.totalPoints && (
              <FormError message={errors.totalPoints.message} id="totalPoints-error" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [control, register, errors, finalDisabled]);

  const FileSubmissionSettingsSection = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" asChild>
          <h2>File Submission Settings</h2>
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
                  disabled={finalDisabled}
                />
                <Label htmlFor={format.value} className="text-sm">
                  {format.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.allowedFormats && (
            <FormError message={errors.allowedFormats.message} id="allowedFormats-error" />
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
              disabled={finalDisabled}
              aria-describedby={errors.maxFileSize ? "maxFileSize-error" : undefined}
            />
            {errors.maxFileSize && (
              <FormError message={errors.maxFileSize.message} id="maxFileSize-error" />
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
              disabled={finalDisabled}
              aria-describedby={errors.maxFiles ? "maxFiles-error" : undefined}
            />
            {errors.maxFiles && (
              <FormError message={errors.maxFiles.message} id="maxFiles-error" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [watchedValues.allowedFormats, handleFormatChange, register, errors, finalDisabled]);

  const LateSubmissionSettingsSection = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" asChild>
          <h2>Late Submission Policy</h2>
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
            disabled={finalDisabled}
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
              disabled={finalDisabled}
              aria-describedby={errors.latePenalty ? "latePenalty-error" : undefined}
            />
            {errors.latePenalty && (
              <FormError message={errors.latePenalty.message} id="latePenalty-error" />
            )}
            <p className="text-sm text-gray-500">
              Percentage of points deducted per day after the due date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  ), [allowLateSubmission, setValue, register, errors, finalDisabled]);

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Assignment" : "Create New Assignment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6" noValidate>
            <BasicInfoSection />
            <DueDateAndPointsSection />
            <FileSubmissionSettingsSection />
            <LateSubmissionSettingsSection />

            <InstructorFileAttachment
              files={attachments}
              onFilesChange={setAttachments}
              maxFiles={10}
              maxFileSize={50}
              disabled={finalDisabled}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={finalDisabled}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button type="submit" disabled={finalDisabled}>
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
        courseName={selectedCourse}
      />
    </div>
  );
}
