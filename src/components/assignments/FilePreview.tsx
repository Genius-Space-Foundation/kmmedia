"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize,
  Minimize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentViewer } from "./DocumentViewer";

interface SubmissionFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
}

interface FilePreviewProps {
  file: SubmissionFile;
  className?: string;
}

export function FilePreview({ file, className = "" }: FilePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf") || type.includes("doc")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (
      type.includes("image") ||
      ["jpg", "jpeg", "png", "gif"].includes(type)
    ) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (
      type.includes("video") ||
      ["mp4", "mov", "avi", "webm"].includes(type)
    ) {
      return <Video className="h-5 w-5 text-purple-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(file.cloudinaryUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  const canPreview = () => {
    const type = file.fileType.toLowerCase();
    return (
      type.includes("pdf") ||
      type.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(type) ||
      type.includes("video") ||
      ["mp4", "mov", "avi", "webm"].includes(type)
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-3">
        {getFileIcon(file.fileType)}
        <div>
          <p className="font-medium text-sm">{file.originalName}</p>
          <p className="text-xs text-gray-500">
            {file.fileType.toUpperCase()} • {formatFileSize(file.fileSize)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {canPreview() && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getFileIcon(file.fileType)}
                  <span>{file.originalName}</span>
                  <Badge variant="outline">{file.fileType.toUpperCase()}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <FilePreviewContent file={file} />
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          Download
        </Button>
      </div>
    </div>
  );
}

// File Preview Content Component
interface FilePreviewContentProps {
  file: SubmissionFile;
}

function FilePreviewContent({ file }: FilePreviewContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fileType = file.fileType.toLowerCase();

  // PDF Preview
  if (fileType.includes("pdf")) {
    return (
      <PDFPreview
        file={file}
        onError={setError}
        onLoad={() => setLoading(false)}
      />
    );
  }

  // Image Preview
  if (
    fileType.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)
  ) {
    return (
      <ImagePreview
        file={file}
        onError={setError}
        onLoad={() => setLoading(false)}
      />
    );
  }

  // Video Preview
  if (
    fileType.includes("video") ||
    ["mp4", "mov", "avi", "webm"].includes(fileType)
  ) {
    return (
      <VideoPreview
        file={file}
        onError={setError}
        onLoad={() => setLoading(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Preview not available for this file type
        </p>
        <p className="text-sm text-gray-500 mt-2">
          You can download the file to view it
        </p>
      </div>
    </div>
  );
}

// PDF Preview Component
interface PDFPreviewProps {
  file: SubmissionFile;
  onError: (error: string) => void;
  onLoad: () => void;
}

function PDFPreview({ file, onError, onLoad }: PDFPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-white" : "h-96"
      }`}
    >
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>

      <iframe
        src={`${file.cloudinaryUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full border-0 rounded-lg"
        title={file.originalName}
        onError={() => onError("Failed to load PDF")}
      />
    </div>
  );
}

// Image Preview Component
interface ImagePreviewProps {
  file: SubmissionFile;
  onError: (error: string) => void;
  onLoad: () => void;
}

function ImagePreview({ file, onError, onLoad }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "h-96"
      }`}
    >
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleRotate}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center overflow-auto bg-gray-50">
        <img
          src={file.cloudinaryUrl}
          alt={file.originalName}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease-in-out",
          }}
          onLoad={onLoad}
          onError={() => onError("Failed to load image")}
        />
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

// Video Preview Component
interface VideoPreviewProps {
  file: SubmissionFile;
  onError: (error: string) => void;
  onLoad: () => void;
}

function VideoPreview({ file, onError, onLoad }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onLoad();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-96"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => onError("Failed to load video")}
      >
        <source src={file.cloudinaryUrl} type={`video/${file.fileType}`} />
        Your browser does not support the video tag.
      </video>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
