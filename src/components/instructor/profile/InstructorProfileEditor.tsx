"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Bell,
  Settings,
  ChevronLeft,
  Camera,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  MapPin,
  Building2,
  GraduationCap,
  Award,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Upload,
} from "lucide-react";
import ProfileImageUploader from "./ProfileImageUploader";
import InstructorAvatar from "./InstructorAvatar";
import { toast } from "sonner";

interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  title?: string;
  department?: string;
  specialization?: string[];
  qualifications?: string[];
  experience?: number;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  preferences?: {
    timezone?: string;
    language?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyReports?: boolean;
    studentMessages?: boolean;
  };
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Africa/Accra",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Portuguese",
];

const SPECIALIZATIONS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Digital Marketing",
  "Business Management",
  "Graphic Design",
  "Video Production",
  "Photography",
  "Music Production",
  "Writing & Content",
  "Other",
];

export default function InstructorProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileData, setProfileData] = useState<InstructorProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    bio: "",
    title: "",
    department: "",
    specialization: [],
    qualifications: [],
    experience: 0,
    location: "",
    socialLinks: {},
    preferences: {
      timezone: "UTC",
      language: "English",
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      studentMessages: true,
    },
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [newQualification, setNewQualification] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch(
        "/api/instructor/profile"
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.data);
          setSelectedSpecializations(data.data.specialization || []);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Upload images first if they exist
      let profileImageUrl = profileData.profileImage;
      let coverImageUrl = profileData.coverImage;

      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", profileImageFile);
        imageFormData.append("type", "profile");

        const uploadResponse = await fetch(
          "/api/instructor/profile/upload-image",
          {
            method: "POST",
            body: imageFormData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profileImageUrl = uploadData.data.url;
        }
      }

      if (coverImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", coverImageFile);
        imageFormData.append("type", "cover");

        const uploadResponse = await fetch(
          "/api/instructor/profile/upload-image",
          {
            method: "POST",
            body: imageFormData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          coverImageUrl = uploadData.data.url;
        }
      }

      // Update profile
      const response = await fetch(
        "/api/instructor/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...profileData,
            specialization: selectedSpecializations,
            profileImage: profileImageUrl,
            coverImage: coverImageUrl,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.data);
        setHasUnsavedChanges(false);
        toast.success("Profile updated successfully!", {
          description: "Your changes have been saved.",
        });
        setProfileImageFile(null);
        setCoverImageFile(null);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setProfileData((prev) => ({
        ...prev,
        qualifications: [
          ...(prev.qualifications || []),
          newQualification.trim(),
        ],
      }));
      setNewQualification("");
      setHasUnsavedChanges(true);
    }
  };

  const removeQualification = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index) || [],
    }));
    setHasUnsavedChanges(true);
  };

  const toggleSpecialization = (specialization: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specialization)
        ? prev.filter((s) => s !== specialization)
        : [...prev, specialization]
    );
    setHasUnsavedChanges(true);
  };

  const getProfileCompleteness = () => {
    let score = 0;
    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.bio,
      profileData.title,
      profileData.department,
      profileData.location,
      profileData.profileImage,
      selectedSpecializations.length > 0,
      (profileData.qualifications?.length || 0) > 0,
    ];

    score = (fields.filter(Boolean).length / fields.length) * 100;
    return Math.round(score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const completeness = getProfileCompleteness();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-neutral-900">
                  Profile Settings
                </h1>
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg">
                Manage your professional profile and preferences
              </p>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="mt-6 p-5 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Profile Completeness
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {completeness}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-500 rounded-full"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Complete your profile to unlock all features and improve
                visibility
              </p>
            )}
          </div>
        </div>

        {/* Cover Image Section */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="relative h-64 bg-brand-primary overflow-hidden">
              {profileData.coverImage && (
                <img
                  src={profileData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />

              {/* Profile Avatar Overlay */}
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <InstructorAvatar
                    name={profileData.name}
                    imageUrl={profileData.profileImage}
                    size="xl"
                    className="w-32 h-32 border-4 border-white shadow-2xl"
                  />
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          setProfileImageFile(file);
                          setHasUnsavedChanges(true);
                        }
                      };
                      input.click();
                    }}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:bg-white transition-all flex items-center gap-2 font-medium hover:scale-105"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setCoverImageFile(file);
                      setHasUnsavedChanges(true);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4" />
                Change Cover
              </button>
            </div>

            {/* Name & Title Under Cover */}
            <div className="pt-20 pb-6 px-8 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData.name || "Your Name"}
              </h2>
              <p className="text-gray-600 mt-1">
                {profileData.title || "Instructor"}
                {profileData.department && ` • ${profileData.department}`}
              </p>
              {profileData.location && (
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profileData.location}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-xl border border-gray-200 p-1 rounded-xl h-auto shadow-sm">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="professional"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg py-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6 mt-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone || ""}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="+1 (234) 567-8900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="location"
                        value={profileData.location || ""}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Accra, Ghana"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Tell students about yourself, your teaching philosophy, expertise, and what makes you passionate about teaching..."
                    rows={6}
                    maxLength={500}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-gray-500">
                      {profileData.bio?.length || 0}/500 characters
                    </p>
                    {(profileData.bio?.length || 0) > 400 && (
                      <p className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Approaching character limit
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-6 mt-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Professional Information
                    </CardTitle>
                    <CardDescription>
                      Showcase your credentials and expertise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Title, Department, Experience */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Professional Title
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="title"
                        value={profileData.title || ""}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Senior Instructor"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Department
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="department"
                        value={profileData.department || ""}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="experience"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profileData.experience || ""}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          experience: parseInt(e.target.value) || 0,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Areas of Specialization
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <div
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                          ${
                            selectedSpecializations.includes(spec)
                              ? "border-blue-600 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }
                        `}
                      >
                        <div
                          className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                            ${
                              selectedSpecializations.includes(spec)
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }
                          `}
                        >
                          {selectedSpecializations.includes(spec) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {spec}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedSpecializations.length > 0 && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      {selectedSpecializations.length} specialization
                      {selectedSpecializations.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                {/* Qualifications */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Qualifications & Certifications
                  </Label>
                  <div className="space-y-2">
                    {profileData.qualifications?.map((qualification, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-neutral-200 group hover:shadow-md transition-all"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="flex-1 font-medium text-gray-800">
                          {qualification}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQualification(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      placeholder="Add qualification (e.g., PhD in Computer Science)"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addQualification()
                      }
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      onClick={addQualification}
                      disabled={!newQualification.trim()}
                      className="h-12 px-6 bg-brand-primary hover:bg-brand-primary/90"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-6 mt-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Social Media & Links
                    </CardTitle>
                    <CardDescription>
                      Connect your social profiles to increase your reach
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedin"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={profileData.socialLinks?.linkedin || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          linkedin: e.target.value,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="twitter"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4 text-sky-500" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    value={profileData.socialLinks?.twitter || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          twitter: e.target.value,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://twitter.com/your-handle"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <Label
                    htmlFor="facebook"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4 text-blue-700" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={profileData.socialLinks?.facebook || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          facebook: e.target.value,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://facebook.com/your-page"
                  />
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <Label
                    htmlFor="youtube"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={profileData.socialLinks?.youtube || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          youtube: e.target.value,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://youtube.com/@your-channel"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-gray-600" />
                    Personal Website
                  </Label>
                  <Input
                    id="website"
                    value={profileData.socialLinks?.website || ""}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          website: e.target.value,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://your-website.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Settings className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Account Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your experience and notification settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Timezone and Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="timezone"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Timezone
                    </Label>
                    <Select
                      value={profileData.preferences?.timezone || "UTC"}
                      onValueChange={(value) => {
                        setProfileData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: value },
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Preferred Language
                    </Label>
                    <Select
                      value={profileData.preferences?.language || "English"}
                      onValueChange={(value) => {
                        setProfileData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: value },
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      Notification Preferences
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNotifications",
                        title: "Email Notifications",
                        description: "Receive important updates via email",
                      },
                      {
                        key: "pushNotifications",
                        title: "Push Notifications",
                        description:
                          "Get browser push notifications for real-time updates",
                      },
                      {
                        key: "weeklyReports",
                        title: "Weekly Reports",
                        description:
                          "Receive weekly summary of your courses and students",
                      },
                      {
                        key: "studentMessages",
                        title: "Student Messages",
                        description:
                          "Get notified when students send you messages",
                      },
                    ].map(({ key, title, description }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {description}
                          </p>
                        </div>
                        <Checkbox
                          checked={
                            profileData.preferences?.[
                              key as keyof typeof profileData.preferences
                            ] ?? true
                          }
                          onCheckedChange={(checked) => {
                            setProfileData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                [key]: checked as boolean,
                              },
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-5 h-5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Save Button */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-8 right-8 flex gap-3 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-gray-200 shadow-2xl animate-in slide-in-from-bottom-5">
            <Button
              variant="outline"
              onClick={() => {
                fetchProfile();
                setHasUnsavedChanges(false);
              }}
              className="h-12"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving || !profileData.name || !profileData.email}
              className="h-12 px-8 bg-brand-primary hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
