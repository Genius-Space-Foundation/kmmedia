"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
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
  // documents: File[]; // Removed documents
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
  applicationFee: number;
  onComplete: (
    applicationData: ApplicationData,
    result?: { success: boolean; data?: unknown; message?: string }
  ) => void;
  onCancel: () => void;
}

export default function ApplicationWizard({
  courseId,
  courseTitle,
  applicationFee,
  onComplete,
  onCancel,
}: ApplicationWizardProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
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
    // documents: [],
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

    /*
    {
      id: "emergency",
      title: "Emergency Contact",
      description: "Emergency contact information",
      component: "emergency",
      required: true,
      completed: false,
    },
    */
    {
       // Step 5: Review & Pay
      id: "review",
      title: "Review & Pay",
      description: "Application Fee & Submission",
      component: "review",
      required: true,
      completed: false,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Fetch and prefill user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (userDataLoaded) return; // Only fetch once

      try {
        // Try to get data from session first for immediate feedback
        if (session?.user) {
          const user = session.user;
          setApplicationData((prev) => ({
            ...prev,
            personalInfo: {
              fullName: user.name || prev.personalInfo.fullName,
              email: user.email || prev.personalInfo.email,
              phone: prev.personalInfo.phone, // Phone might not be in session
              address: prev.personalInfo.address, // Address might not be in session
              dateOfBirth: prev.personalInfo.dateOfBirth, // DOB might not be in session
              gender: prev.personalInfo.gender,
            },
          }));
        }

        // Fetch full profile data from API to get complete information
        const response = await fetch("/api/user/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            const userData = result.user;
            setApplicationData((prev) => ({
              ...prev,
              personalInfo: {
                fullName: userData.name || prev.personalInfo.fullName,
                email: userData.email || prev.personalInfo.email,
                phone: userData.phone || prev.personalInfo.phone,
                address: userData.address || prev.personalInfo.address,
                dateOfBirth:
                  userData.dateOfBirth || prev.personalInfo.dateOfBirth,
                gender: prev.personalInfo.gender, // Gender not typically in profile
              },
            }));
          }
        }
        setUserDataLoaded(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Don't block the form if profile fetch fails
        setUserDataLoaded(true);
      }
    };

    // Check URL for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setIsFeePaid(true);
      // Wait for data to load then verify active step
      // The current step initialization might need adjustment if we reload on payment success
    }

    // Only fetch if we have a session or if session is still loading
    if (session || !session) {
      fetchUserData();
    }
  }, [session, userDataLoaded]);

  // Handle Pay Application Fee
  const handlePayFee = async () => {
    setIsInitializingPayment(true);
    setPaymentError("");
    try {
      // Save draft first
      await saveDraft();

      // Initialize payment
      const response = await makeAuthenticatedRequest("/api/payments/initialize", {
        method: "POST",
        body: JSON.stringify({
          type: "APPLICATION_FEE",
          amount: applicationFee, // Use prop
          courseId: courseId, 
          callbackUrl: `${window.location.origin}${window.location.pathname}?payment=success`
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Redirect to Paystack
         const authUrl = result.data.authorizationUrl || result.data.authorization_url;
         if (authUrl) {
           window.location.href = authUrl;
         } else {
            setPaymentError("Failed to get payment URL");
         }
      } else {
        setPaymentError(result.message || "Payment initialization failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("An error occurred while initializing payment");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep > 0 && currentStep < steps.length - 1) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        /*
        case "emergency":
          completed =
            applicationData.emergencyContact.name !== "" &&
            applicationData.emergencyContact.relationship !== "" &&
            applicationData.emergencyContact.phone !== "";
          break;
        */
        case "review":
           // Complete if fee is paid OR fee is 0
          completed = applicationData.termsAccepted && (isFeePaid || applicationFee === 0);
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
      // Check payment before submit
       if (!isFeePaid && applicationFee > 0) {
           // Should show error or redirect to pay
           alert("Please pay the application fee to submit.");
           return;
       }
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
        personalInfo: {
          fullName: applicationData.personalInfo.fullName,
          email: applicationData.personalInfo.email,
          phone: applicationData.personalInfo.phone,
          address: applicationData.personalInfo.address,
          dateOfBirth: applicationData.personalInfo.dateOfBirth || undefined,
          gender: applicationData.personalInfo.gender || undefined,
        },
        education: {
          highestDegree: applicationData.education.highestDegree,
          institution: applicationData.education.institution,
          yearCompleted: applicationData.education.yearCompleted,
          fieldOfStudy: applicationData.education.fieldOfStudy || undefined,
        },
        motivation: {
          reasonForApplying: applicationData.motivation.reasonForApplying,
          careerGoals: applicationData.motivation.careerGoals,
          expectations: applicationData.motivation.expectations,
          additionalInfo:
            applicationData.motivation.additionalInfo || undefined,
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

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        const text = await response.text();
        console.error("Response text:", text);
        alert("Server error: Invalid response format");
        return;
      }

      if (!response.ok) {
        // Handle validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors
            .map((err: { path?: (string | number)[]; message?: string }) => {
              const path = err.path?.join(".") || "field";
              return `${path}: ${err.message || "Invalid value"}`;
            })
            .join("\n");
          alert(`Validation errors:\n${errorMessages}`);
        } else if (
          result.errorMessages &&
          Array.isArray(result.errorMessages)
        ) {
          alert(`Validation errors:\n${result.errorMessages.join("\n")}`);
        } else {
          alert(result.message || "Failed to submit application");
        }
        return;
      }

      if (result.success) {
        onComplete(applicationData, result);
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

  /*
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
  */

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
                    <SelectItem value="bachelor">
                      Bachelor&apos;s Degree
                    </SelectItem>
                    <SelectItem value="master">Master&apos;s Degree</SelectItem>
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
                Review & Payment
              </h2>
              <p className="text-gray-600">
                Please review your application and pay the application fee.
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fee Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Application Fee</span>
                        <span className="font-bold text-lg">
                            {new Intl.NumberFormat("en-GH", {
                                style: "currency",
                                currency: "GHS",
                            }).format(applicationFee || 0)}
                        </span>
                    </div>
                    {isFeePaid ? (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4" />
                             Payment Verified
                        </div>
                    ) : (
                        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Payment Pending
                        </div>
                    )}
                </CardContent>
              </Card>

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

               {paymentError && (
                 <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{paymentError}</span>
                 </div>
              )}
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
              onClick={
                  currentStep === steps.length - 1
                    ? (!isFeePaid && applicationFee > 0 ? handlePayFee : handleNext)
                    : handleNext
              }
              disabled={
                  loading || isInitializingPayment ||
                  (currentStep === steps.length - 1 && !isFeePaid && applicationFee > 0
                    ? !applicationData.termsAccepted
                    : !canProceed())
              }
              className="min-w-[120px]"
            >
              {loading || isInitializingPayment ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isInitializingPayment ? "Processing..." : "Submitting..."}</span>
                </div>
              ) : currentStep === steps.length - 1 ? (
                 !isFeePaid && applicationFee > 0 ? (
                    <>
                       <CreditCard className="h-4 w-4 mr-2" />
                       Pay & Submit
                    </>
                 ) : (
                    "Submit Application"
                 )
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
