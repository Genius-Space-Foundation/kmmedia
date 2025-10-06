"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CourseWizardData {
  basicInfo: {
    title: string;
    description: string;
    category: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    language: string;
    duration: number;
    tags: string[];
  };
  pricing: {
    price: number;
    applicationFee: number;
    installmentPlans: any[];
  };
  content: {
    prerequisites: string[];
    learningObjectives: string[];
    curriculum: any[];
  };
  media: {
    thumbnail: string;
    videoIntro: string;
    gallery: string[];
  };
}

interface CourseCreationWizardProps {
  onClose: () => void;
  onSubmit: (data: CourseWizardData) => void;
}

export default function CourseCreationWizard({
  onClose,
  onSubmit,
}: CourseCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState<CourseWizardData>({
    basicInfo: {
      title: "",
      description: "",
      category: "",
      difficulty: "BEGINNER",
      language: "English",
      duration: 0,
      tags: [],
    },
    pricing: {
      price: 0,
      applicationFee: 0,
      installmentPlans: [],
    },
    content: {
      prerequisites: [],
      learningObjectives: [],
      curriculum: [],
    },
    media: {
      thumbnail: "",
      videoIntro: "",
      gallery: [],
    },
  });

  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(wizardData);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setWizardData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          prerequisites: [
            ...prev.content.prerequisites,
            newPrerequisite.trim(),
          ],
        },
      }));
      setNewPrerequisite("");
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setWizardData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          learningObjectives: [
            ...prev.content.learningObjectives,
            newObjective.trim(),
          ],
        },
      }));
      setNewObjective("");
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setWizardData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          tags: [...prev.basicInfo.tags, newTag.trim()],
        },
      }));
      setNewTag("");
    }
  };

  const removePrerequisite = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        prerequisites: prev.content.prerequisites.filter((_, i) => i !== index),
      },
    }));
  };

  const removeObjective = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        learningObjectives: prev.content.learningObjectives.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const removeTag = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        tags: prev.basicInfo.tags.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Step {step} of 4:{" "}
          {step === 1
            ? "Basic Information"
            : step === 2
            ? "Pricing & Plans"
            : step === 3
            ? "Content & Curriculum"
            : "Media & Final Review"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={wizardData.basicInfo.title}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, title: e.target.value },
                    }))
                  }
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={wizardData.basicInfo.category}
                  onValueChange={(value) =>
                    setWizardData((prev) => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, category: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FILM_PRODUCTION">
                      Film Production
                    </SelectItem>
                    <SelectItem value="CINEMATOGRAPHY">
                      Cinematography
                    </SelectItem>
                    <SelectItem value="EDITING">Editing</SelectItem>
                    <SelectItem value="SOUND_DESIGN">Sound Design</SelectItem>
                    <SelectItem value="SCREENWRITING">Screenwriting</SelectItem>
                    <SelectItem value="DIRECTING">Directing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                value={wizardData.basicInfo.description}
                onChange={(e) =>
                  setWizardData((prev) => ({
                    ...prev,
                    basicInfo: {
                      ...prev.basicInfo,
                      description: e.target.value,
                    },
                  }))
                }
                placeholder="Describe what students will learn in this course"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={wizardData.basicInfo.difficulty}
                  onValueChange={(
                    value: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
                  ) =>
                    setWizardData((prev) => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, difficulty: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={wizardData.basicInfo.language}
                  onValueChange={(value) =>
                    setWizardData((prev) => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, language: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={wizardData.basicInfo.duration || ""}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      basicInfo: {
                        ...prev.basicInfo,
                        duration: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="e.g., 40"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {wizardData.basicInfo.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(index)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Plans */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Course Price (GH₵)</Label>
                <Input
                  id="price"
                  type="number"
                  value={wizardData.pricing.price || ""}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        price: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="e.g., 50000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="applicationFee">Application Fee (GH₵)</Label>
                <Input
                  id="applicationFee"
                  type="number"
                  value={wizardData.pricing.applicationFee || ""}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        applicationFee: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="e.g., 5000"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Installment Plans</Label>
              <div className="space-y-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Standard Plan</h4>
                  <p className="text-sm text-gray-600">Full payment upfront</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">3-Month Plan</h4>
                  <p className="text-sm text-gray-600">
                    3 equal monthly payments
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">6-Month Plan</h4>
                  <p className="text-sm text-gray-600">
                    6 equal monthly payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Content & Curriculum */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label>Prerequisites</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add a prerequisite"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addPrerequisite())
                  }
                />
                <Button
                  type="button"
                  onClick={addPrerequisite}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {wizardData.content.prerequisites.map((prereq, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>{prereq}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePrerequisite(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Learning Objectives</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add a learning objective"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addObjective())
                  }
                />
                <Button type="button" onClick={addObjective} variant="outline">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {wizardData.content.learningObjectives.map(
                  (objective, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span>{objective}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeObjective(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Media & Final Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="thumbnail">Course Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={wizardData.media.thumbnail}
                onChange={(e) =>
                  setWizardData((prev) => ({
                    ...prev,
                    media: { ...prev.media, thumbnail: e.target.value },
                  }))
                }
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div>
              <Label htmlFor="videoIntro">Intro Video URL</Label>
              <Input
                id="videoIntro"
                value={wizardData.media.videoIntro}
                onChange={(e) =>
                  setWizardData((prev) => ({
                    ...prev,
                    media: { ...prev.media, videoIntro: e.target.value },
                  }))
                }
                placeholder="https://example.com/intro-video.mp4"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Course Summary</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Title:</strong> {wizardData.basicInfo.title}
                </p>
                <p>
                  <strong>Category:</strong> {wizardData.basicInfo.category}
                </p>
                <p>
                  <strong>Difficulty:</strong> {wizardData.basicInfo.difficulty}
                </p>
                <p>
                  <strong>Price:</strong> GH₵
                  {wizardData.pricing.price?.toLocaleString()}
                </p>
                <p>
                  <strong>Application Fee:</strong> GH₵
                  {wizardData.pricing.applicationFee?.toLocaleString()}
                </p>
                <p>
                  <strong>Prerequisites:</strong>{" "}
                  {wizardData.content.prerequisites.length} items
                </p>
                <p>
                  <strong>Learning Objectives:</strong>{" "}
                  {wizardData.content.learningObjectives.length} items
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? onClose : handlePrev}
          >
            {step === 1 ? "Cancel" : "Previous"}
          </Button>
          <div className="flex space-x-2">
            {step < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit}>
                Create Course
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
