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
import { Progress } from "@/components/ui/progress";
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
import { Checkbox } from "@/components/ui/checkbox";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
}

interface ApplicationData {
  courseId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
  };
  education: {
    highestDegree: string;
    institution: string;
    yearCompleted: string;
    fieldOfStudy: string;
    gpa?: string;
  };
  workExperience: {
    hasExperience: boolean;
    currentJob?: string;
    company?: string;
    experience?: string;
    skills?: string;
  };
  motivation: {
    reasonForApplying: string;
    careerGoals: string;
    expectations: string;
    additionalInfo?: string;
  };
  documents: File[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  termsAccepted: boolean;
}

interface ApplicationWizardProps {
  courseId: string;
  courseTitle: string;
  onComplete: (applicationData: ApplicationData) => void;
  onCancel: () => void;
}

export default function ApplicationWizard({
  courseId,
  courseTitle,
  onComplete,
  onCancel,
}: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    courseId,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "",
    },
    education: {
      highestDegree: "",
      institution: "",
      yearCompleted: "",
      fieldOfStudy: "",
      gpa: "",
    },
    workExperience: {
      hasExperience: false,
      currentJob: "",
      company: "",
      experience: "",
      skills: "",
    },
    motivation: {
      reasonForApplying: "",
      careerGoals: "",
      expectations: "",
      additionalInfo: "",
    },
    documents: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
    termsAccepted: false,
  });

  const steps: ApplicationStep[] = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Tell us about yourself",
      component: "personal",
      required: true,
      completed: false,
    },
    {
      id: "education",
      title: "Educational Background",
      description: "Your academic qualifications",
      component: "education",
      required: true,
      completed: false,
    },
    {
      id: "experience",
      title: "Work Experience",
      description: "Your professional background",
      component: "experience",
      required: false,
      completed: false,
    },
    {
      id: "motivation",
      title: "Motivation & Goals",
      description: "Why do you want to join this course?",
      component: "motivation",
      required: true,
      completed: false,
    },
    {
      id: "documents",
      title: "Documents",
      description: "Upload required documents",
      component: "documents",
      required: true,
      completed: false,
    },
    {
      id: "emergency",
      title: "Emergency Contact",
      description: "Emergency contact information",
      component: "emergency",
      required: true,
      completed: false,
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Review your application",
      component: "review",
      required: true,
      completed: false,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep > 0 && currentStep < steps.length - 1) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentStep, applicationData]);

  const saveDraft = async () => {
    try {
      await makeAuthenticatedRequest("/api/student/applications/draft", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          step: currentStep,
          data: applicationData,
        }),
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const updateStepCompletion = () => {
    const updatedSteps = steps.map((step, index) => {
      let completed = false;

      switch (step.component) {
        case "personal":
          completed =
            applicationData.personalInfo.fullName !== "" &&
            applicationData.personalInfo.email !== "" &&
            applicationData.personalInfo.phone !== "" &&
            applicationData.personalInfo.address !== "" &&
            applicationData.personalInfo.gender !== "";
          break;
        case "education":
          completed =
            applicationData.education.highestDegree !== "" &&
            applicationData.education.institution !== "" &&
            applicationData.education.yearCompleted !== "" &&
            applicationData.education.fieldOfStudy !== "";
          break;
        case "experience":
          completed = true; // Optional step
          break;
        case "motivation":
          completed =
            applicationData.motivation.reasonForApplying !== "" &&
            applicationData.motivation.careerGoals !== "" &&
            applicationData.motivation.expectations !== "";
          break;
        case "documents":
          completed = applicationData.documents.length > 0;
          break;
        case "emergency":
          completed =
            applicationData.emergencyContact.name !== "" &&
            applicationData.emergencyContact.relationship !== "" &&
            applicationData.emergencyContact.phone !== "";
          break;
        case "review":
          completed = applicationData.termsAccepted;
          break;
      }

      return { ...step, completed };
    });

    return updatedSteps;
  };

  const updatedSteps = updateStepCompletion();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await saveDraft();
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // For now, we'll submit without file uploads
      // In a real implementation, you'd upload files first and get URLs
      const submissionData = {
        courseId: applicationData.courseId,
        personalInfo: applicationData.personalInfo,
        education: applicationData.education,
        motivation: {
          reasonForApplying: applicationData.motivation.reasonForApplying,
          careerGoals: applicationData.motivation.careerGoals,
          expectations: applicationData.motivation.expectations,
        },
        documents: [], // File URLs would go here after upload
      };

      const response = await makeAuthenticatedRequest(
        "/api/student/applications",
        {
          method: "POST",
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();

      if (result.success) {
        onComplete(applicationData);
      } else {
        alert(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("An error occurred while submitting your application");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setApplicationData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeDocument = (index: number) => {
    setApplicationData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const renderStep = () => {
    const step = updatedSteps[currentStep];

    switch (step.component) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">
                Please provide your basic personal details
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={applicationData.personalInfo.fullName}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        fullName: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={applicationData.personalInfo.email}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        email: e.target.value,
                      },
                    }))
                  }
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={applicationData.personalInfo.phone}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={applicationData.personalInfo.dateOfBirth}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        dateOfBirth: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={applicationData.personalInfo.gender}
                  onValueChange={(value) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        gender: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={applicationData.personalInfo.address}
                onChange={(e) =>
                  setApplicationData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      address: e.target.value,
                    },
                  }))
                }
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
          </div>
        );

      case "education":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Educational Background
              </h2>
              <p className="text-gray-600">
                Tell us about your educational qualifications
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="highestDegree">Highest Degree *</Label>
                <Select
                  value={applicationData.education.highestDegree}
                  onValueChange={(value) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        highestDegree: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select highest degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No formal education</SelectItem>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                <Input
                  id="fieldOfStudy"
                  value={applicationData.education.fieldOfStudy}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        fieldOfStudy: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., Computer Science, Media Studies"
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={applicationData.education.institution}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        institution: e.target.value,
                      },
                    }))
                  }
                  placeholder="University/College name"
                />
              </div>
              <div>
                <Label htmlFor="yearCompleted">Year Completed *</Label>
                <Input
                  id="yearCompleted"
                  type="number"
                  value={applicationData.education.yearCompleted}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        yearCompleted: e.target.value,
                      },
                    }))
                  }
                  placeholder="2020"
                  min="1950"
                  max="2024"
                />
              </div>
              <div>
                <Label htmlFor="gpa">GPA (Optional)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.1"
                  value={applicationData.education.gpa}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        gpa: e.target.value,
                      },
                    }))
                  }
                  placeholder="3.5"
                  min="0"
                  max="4"
                />
              </div>
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Work Experience
              </h2>
              <p className="text-gray-600">
                Tell us about your professional background (Optional)
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasExperience"
                  checked={applicationData.workExperience.hasExperience}
                  onCheckedChange={(checked) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      workExperience: {
                        ...prev.workExperience,
                        hasExperience: checked as boolean,
                      },
                    }))
                  }
                />
                <Label htmlFor="hasExperience">
                  I have professional work experience
                </Label>
              </div>

              {applicationData.workExperience.hasExperience && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentJob">Current/Last Job Title</Label>
                      <Input
                        id="currentJob"
                        value={applicationData.workExperience.currentJob}
                        onChange={(e) =>
                          setApplicationData((prev) => ({
                            ...prev,
                            workExperience: {
                              ...prev.workExperience,
                              currentJob: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., Graphic Designer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        value={applicationData.workExperience.company}
                        onChange={(e) =>
                          setApplicationData((prev) => ({
                            ...prev,
                            workExperience: {
                              ...prev.workExperience,
                              company: e.target.value,
                            },
                          }))
                        }
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Description</Label>
                    <Textarea
                      id="experience"
                      value={applicationData.workExperience.experience}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          workExperience: {
                            ...prev.workExperience,
                            experience: e.target.value,
                          },
                        }))
                      }
                      placeholder="Describe your work experience and key responsibilities"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Relevant Skills</Label>
                    <Textarea
                      id="skills"
                      value={applicationData.workExperience.skills}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          workExperience: {
                            ...prev.workExperience,
                            skills: e.target.value,
                          },
                        }))
                      }
                      placeholder="List your relevant skills and tools you're familiar with"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case "motivation":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Motivation & Goals
              </h2>
              <p className="text-gray-600">
                Help us understand why you want to join this course
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reasonForApplying">
                  Why do you want to apply for this course? *
                </Label>
                <Textarea
                  id="reasonForApplying"
                  value={applicationData.motivation.reasonForApplying}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      motivation: {
                        ...prev.motivation,
                        reasonForApplying: e.target.value,
                      },
                    }))
                  }
                  placeholder="Explain your interest in this specific course and what draws you to it"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="careerGoals">
                  What are your career goals? *
                </Label>
                <Textarea
                  id="careerGoals"
                  value={applicationData.motivation.careerGoals}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      motivation: {
                        ...prev.motivation,
                        careerGoals: e.target.value,
                      },
                    }))
                  }
                  placeholder="Describe your short-term and long-term career aspirations"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="expectations">
                  What do you expect to gain from this course? *
                </Label>
                <Textarea
                  id="expectations"
                  value={applicationData.motivation.expectations}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      motivation: {
                        ...prev.motivation,
                        expectations: e.target.value,
                      },
                    }))
                  }
                  placeholder="What specific skills, knowledge, or outcomes do you hope to achieve?"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="additionalInfo">
                  Additional Information (Optional)
                </Label>
                <Textarea
                  id="additionalInfo"
                  value={applicationData.motivation.additionalInfo}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      motivation: {
                        ...prev.motivation,
                        additionalInfo: e.target.value,
                      },
                    }))
                  }
                  placeholder="Any other information you'd like to share"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Required Documents
              </h2>
              <p className="text-gray-600">
                Please upload the following documents
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Required Documents:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• CV/Resume (PDF format)</li>
                <li>• Educational certificates (PDF/Image)</li>
                <li>• Passport photo (JPG/PNG)</li>
                <li>• National ID or Passport (PDF/Image)</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="documents">Upload Documents</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG. Max size: 10MB per file.
              </p>
            </div>

            {applicationData.documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Uploaded Documents:</h3>
                {applicationData.documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "emergency":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Emergency Contact
              </h2>
              <p className="text-gray-600">
                Please provide emergency contact information
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyName">Full Name *</Label>
                <Input
                  id="emergencyName"
                  value={applicationData.emergencyContact.name}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="Emergency contact full name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelationship">Relationship *</Label>
                <Select
                  value={applicationData.emergencyContact.relationship}
                  onValueChange={(value) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        relationship: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone Number *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={applicationData.emergencyContact.phone}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail">Email (Optional)</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={applicationData.emergencyContact.email}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        email: e.target.value,
                      },
                    }))
                  }
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review Your Application
              </h2>
              <p className="text-gray-600">
                Please review your application before submitting
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{courseTitle}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Name:</strong>{" "}
                    {applicationData.personalInfo.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {applicationData.personalInfo.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {applicationData.personalInfo.phone}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {applicationData.personalInfo.address}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Degree:</strong>{" "}
                    {applicationData.education.highestDegree}
                  </p>
                  <p>
                    <strong>Field:</strong>{" "}
                    {applicationData.education.fieldOfStudy}
                  </p>
                  <p>
                    <strong>Institution:</strong>{" "}
                    {applicationData.education.institution}
                  </p>
                  <p>
                    <strong>Year:</strong>{" "}
                    {applicationData.education.yearCompleted}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Uploaded:</strong>{" "}
                    {applicationData.documents.length} file(s)
                  </p>
                  <div className="mt-2 space-y-1">
                    {applicationData.documents.map((file, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {file.name}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={applicationData.termsAccepted}
                  onCheckedChange={(checked) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      termsAccepted: checked as boolean,
                    }))
                  }
                />
                <div>
                  <Label htmlFor="termsAccepted" className="font-medium">
                    I agree to the terms and conditions
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    By submitting this application, I confirm that all
                    information provided is accurate and I understand the course
                    requirements and payment terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = updatedSteps[currentStep];
    if (!step.required) return true;
    return step.completed;
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {updatedSteps[currentStep].title}
          </DialogTitle>
          <div className="w-full">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">{renderStep()}</div>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {saving && (
              <span className="text-sm text-gray-500">Saving draft...</span>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : currentStep === steps.length - 1 ? (
                "Submit Application"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
