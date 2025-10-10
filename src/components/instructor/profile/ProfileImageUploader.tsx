"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import InstructorAvatar from "./InstructorAvatar";

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  uploading?: boolean;
  type?: "profile" | "cover";
}

export default function ProfileImageUploader({
  currentImage,
  onImageSelect,
  onImageRemove,
  uploading = false,
  type = "profile",
}: ProfileImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call parent handler
    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (type === "profile") {
    return (
      <div className="flex items-center gap-6">
        {/* Current Image Preview */}
        <div className="relative">
          <InstructorAvatar
            src={preview || currentImage}
            size="2xl"
            showBorder
          />
          {preview && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <Label className="text-sm font-medium mb-2 block">
            Profile Picture
          </Label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {preview ? "Change Photo" : "Upload Photo"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemove}
                disabled={uploading}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or WebP. Max size 5MB. Recommended 400x400px
          </p>
        </div>
      </div>
    );
  }

  // Cover Image Upload
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Cover Image</Label>
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview || currentImage ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={preview || currentImage || ""}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop your image here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700"
                  disabled={uploading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG or WebP. Max 5MB. Recommended 1200x400px
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
}
