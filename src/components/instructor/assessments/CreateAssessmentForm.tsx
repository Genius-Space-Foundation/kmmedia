"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import QuestionEditor, { Question } from "./QuestionEditor";
import {
  FileText,
  BookOpen,
  Award,
  Clock,
  RotateCcw,
  Calendar,
  Target,
  Plus,
  Save,
} from "lucide-react";

interface CreateAssessmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  courses: Array<{ id: string; title: string }>;
  initialData?: any; // Assessment data for editing
}

export default function CreateAssessmentForm({
  open,
  onOpenChange,
  onSuccess,
  courses,
  initialData,
}: CreateAssessmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "QUIZ" as const,
    courseId: "",
    totalPoints: 100,
    passingScore: 70,
    timeLimit: 60,
    attempts: 1,
    dueDate: "",
    questions: [] as Question[],
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData && open) {
      setNewAssessment({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "QUIZ",
        courseId: initialData.courseId || "",
        totalPoints: initialData.totalPoints || 100,
        passingScore: initialData.passingScore || 70,
        timeLimit: initialData.timeLimit || 60,
        attempts: initialData.attempts || 1,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : "",
        questions: initialData.questions || [],
      });
      
      if (initialData.attachments && Array.isArray(initialData.attachments)) {
        const existingFiles: UploadedFile[] = initialData.attachments.map((url: string, index: number) => ({
          id: `existing-${index}`,
          file: null as any,
          name: url.split('/').pop() || `File ${index + 1}`,
          size: 0,
          type: "unknown",
          url: url,
          uploadProgress: 100,
          status: "completed" as const
        }));
        setFiles(existingFiles);
      }
    } else if (!initialData && open) {
      // Reset form when opening in create mode
      setNewAssessment({
        title: "",
        description: "",
        type: "QUIZ" as const,
        courseId: "",
        totalPoints: 100,
        passingScore: 70,
        timeLimit: 60,
        attempts: 1,
        dueDate: "",
        questions: [] as Question[],
      });
      setFiles([]);
    }
  }, [initialData, open]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that we have at least one question
    if (newAssessment.questions.length === 0) {
      alert("Please add at least one question to the assessment");
      return;
    }

    // Validate that courseId is selected
    if (!newAssessment.courseId) {
      alert("Please select a course for this assessment");
      return;
    }

    try {
      setLoading(true);
      
      
      // Prepare the payload
      // In a real implementation, we would upload files first and get URLs
      // For now, we'll just log the files
      console.log("Files to upload:", files);

      const url = initialData 
        ? `/api/instructor/assessments/${initialData.id}` 
        : "/api/instructor/assessments";
        
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...newAssessment,
            dueDate: newAssessment.dueDate ? new Date(newAssessment.dueDate).toISOString() : undefined,
            // Add file URLs here if backend supports it
            attachments: files.map(f => f.url).filter(Boolean) 
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        alert(`Assessment ${initialData ? "updated" : "created"} successfully!`);
        onOpenChange(false);
        // Reset form only if creating
        if (!initialData) {
          setNewAssessment({
            title: "",
            description: "",
            type: "QUIZ" as const,
            courseId: "",
            totalPoints: 100,
            passingScore: 70,
            timeLimit: 60,
            attempts: 1,
            dueDate: "",
            questions: [] as Question[],
          });
          setFiles([]);
        }
        onSuccess();
      } else {
        alert(`Error: ${data.message || `Failed to ${initialData ? "update" : "create"} assessment`}`);
      }
    } catch (error) {
      console.error(`Error ${initialData ? "updating" : "creating"} assessment:`, error);
      alert(`An error occurred while ${initialData ? "updating" : "creating"} the assessment`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (filesToUpload: File[]): Promise<string[]> => {
    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.success) {
        return data.data; // Array of URLs
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-neutral-50">
        <DialogHeader className="border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Create New Assessment
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500 mt-1">
                Design a comprehensive assessment for your students
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreateAssessment} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand-primary rounded-full"></div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="md:col-span-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  Assessment Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={newAssessment.title}
                  onChange={(e) =>
                    setNewAssessment({ ...newAssessment, title: e.target.value })
                  }
                  placeholder="e.g., Mid-term Examination - Web Development"
                  className="h-12 text-base border-neutral-300 focus:border-brand-primary focus:ring-brand-primary"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="course"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Course{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newAssessment.courseId}
                  onValueChange={(value) =>
                    setNewAssessment({ ...newAssessment, courseId: value })
                  }
                >
                  <SelectTrigger className="h-12 border-neutral-300 focus:border-brand-primary">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-200 shadow-lg max-h-[300px] overflow-y-auto">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="type"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Assessment Type
                </Label>
                <Select
                  value={newAssessment.type}
                  onValueChange={(value: any) =>
                    setNewAssessment({ ...newAssessment, type: value })
                  }
                >
                  <SelectTrigger className="h-12 border-neutral-300 focus:border-brand-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                    <SelectItem value="QUIZ">📝 Quiz</SelectItem>
                    <SelectItem value="EXAM">📚 Exam</SelectItem>
                    <SelectItem value="ASSIGNMENT">✍️ Assignment</SelectItem>
                    <SelectItem value="PROJECT">🎯 Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-neutral-700 mb-2"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Provide clear instructions and expectations for this assessment..."
                  rows={4}
                  className="border-neutral-300 focus:border-brand-primary focus:ring-brand-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Grading & Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Grading & Settings
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <Label
                  htmlFor="points"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-amber-500" /> Total Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={newAssessment.totalPoints}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      totalPoints: parseInt(e.target.value),
                    })
                  }
                  className="h-11 border-neutral-300 focus:border-brand-primary"
                />
              </div>

              <div>
                <Label
                  htmlFor="passing"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <Target className="w-4 h-4 text-green-500" /> Passing %
                </Label>
                <Input
                  id="passing"
                  type="number"
                  value={newAssessment.passingScore}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                  className="h-11 border-neutral-300 focus:border-brand-primary"
                />
              </div>

              <div>
                <Label
                  htmlFor="time"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-blue-500" /> Time (mins)
                </Label>
                <Input
                  id="time"
                  type="number"
                  value={newAssessment.timeLimit}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  className="h-11 border-neutral-300 focus:border-brand-primary"
                />
              </div>

              <div>
                <Label
                  htmlFor="attempts"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-purple-500" /> Attempts
                </Label>
                <Input
                  id="attempts"
                  type="number"
                  value={newAssessment.attempts}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      attempts: parseInt(e.target.value),
                    })
                  }
                  className="h-11 border-neutral-300 focus:border-brand-primary"
                />
              </div>

              <div className="col-span-2">
                <Label
                  htmlFor="dueDate"
                  className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-red-500" /> Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newAssessment.dueDate}
                  onChange={(e) =>
                    setNewAssessment({ ...newAssessment, dueDate: e.target.value })
                  }
                  className="h-11 border-neutral-300 focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Attachments & Resources
              </h3>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <FileUpload 
                onFilesChange={setFiles}
                onUpload={handleFileUpload}
                maxFiles={5}
                maxSize={10}
                accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                label="Upload Assignment Materials"
                description="Upload instructions, reference materials, or templates for students."
              />
            </div>
          </div>

          <Separator />

          <QuestionEditor
            questions={newAssessment.questions}
            onChange={(questions) =>
              setNewAssessment({ ...newAssessment, questions })
            }
          />

          <Separator />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 h-11 shadow-lg shadow-brand-primary/20"
            >
              {loading ? (
                initialData ? "Updating..." : "Creating..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {initialData ? "Update Assessment" : "Create Assessment"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
