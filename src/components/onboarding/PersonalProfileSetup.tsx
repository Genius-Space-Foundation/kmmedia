"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Upload, 
  X,
  ChevronRight,
  Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

// Schema for Personal Profile
const personalProfileSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  address: z.string().min(5, "Please enter a valid address").optional().or(z.literal("")),
  dateOfBirth: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    return age >= 13;
  }, "You must be at least 13 years old").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
});

type PersonalProfileData = z.infer<typeof personalProfileSchema>;

interface PersonalProfileSetupProps {
  onComplete: (data: any) => void;
  onSkip: () => void;
  initialData?: any;
}

export default function PersonalProfileSetup({
  onComplete,
  onSkip,
  initialData = {},
}: PersonalProfileSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalProfileData>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues: {
      phone: initialData.phone || "",
      address: initialData.address || "",
      dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      gender: initialData.gender || undefined,
    },
  });

  const genderValue = watch("gender");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: PersonalProfileData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        avatar: avatarPreview,
      };

      const response = await makeAuthenticatedRequest(
        "/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        onComplete(result.user);
      } else {
        console.error("Failed to save profile:", result.message);
        // Continue anyway to not block user
        onComplete(payload);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      onComplete(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Personalize Your Profile</h2>
        <p className="text-gray-500 mt-2">Let's get to know you better. This information helps us tailor your experience.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${avatarPreview ? 'border-brand-primary' : 'border-gray-200'} shadow-xl transition-all duration-300 group-hover:border-brand-secondary`}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-secondary transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>

            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors transform -translate-y-1/2 translate-x-1/2"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-gray-400">Allowed *.jpeg, *.jpg, *.png, *.gif (Max 5MB)</p>
        </div>

        <div className="space-y-5">
          {/* Gender Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Gender</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["male", "female", "other", "prefer_not_to_say"].map((option) => (
                <div
                  key={option}
                  onClick={() => setValue("gender", option as any)}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex items-center justify-center text-sm font-medium transition-all ${
                    genderValue === option
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm"
                      : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                  }`}
                >
                  {option === "prefer_not_to_say" ? "Prefer not to say" : option.charAt(0).toUpperCase() + option.slice(1)}
                  {genderValue === option && <Check className="w-3 h-3 ml-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                  {...register("phone")}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <div className="relative">
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl block"
                  {...register("dateOfBirth")}
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>}
            </div>
          </div>

          {/* Location/Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Location / Address (Optional)</Label>
            <div className="relative">
              <Input
                id="address"
                placeholder="City, Region, or Street Address"
                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                {...register("address")}
              />
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-900"
            disabled={isLoading}
          >
            Skip for now
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg shadow-brand-primary/25 hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Saving...</span>
            ) : (
              <span className="flex items-center gap-2">
                Continue <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
