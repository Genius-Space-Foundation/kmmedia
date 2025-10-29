"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

interface DocumentViewerProps {
  file: DocumentFile;
  className?: string;
  showDownload?: boolean;
  showFullscreen?: boolean;
}

export function DocumentViewer({
  file,
  className = "",
  showDownload = true,
  showFullscreen = true,
}: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf") || type.includes("doc")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (
      type.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(type)
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

  const openInNewTab = () => {
    window.open(file.cloudinaryUrl, "_blank");
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            {getFileIcon(file.fileType)}
            <span className="truncate">{file.originalName}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {file.fileType.toUpperCase()}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview Area */}
        <div className="mb-4">
          {canPreview() ? (
            <DocumentPreview file={file} />
          ) : (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Preview not available</p>
                <p className="text-xs text-gray-500">
                  Download to view this file
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {canPreview() && showFullscreen && (
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Full Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      {getFileIcon(file.fileType)}
                      <span>{file.originalName}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <FullscreenDocumentPreview file={file} />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>

          {showDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Document Preview Component
interface DocumentPreviewProps {
  file: DocumentFile;
}

function DocumentPreview({ file }: DocumentPreviewProps) {
  const fileType = file.fileType.toLowerCase();

  if (fileType.includes("pdf")) {
    return <PDFPreview file={file} height="200px" />;
  }

  if (
    fileType.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)
  ) {
    return <ImagePreview file={file} height="200px" />;
  }

  if (
    fileType.includes("video") ||
    ["mp4", "mov", "avi", "webm"].includes(fileType)
  ) {
    return <VideoPreview file={file} height="200px" />;
  }

  return null;
}

// Fullscreen Document Preview Component
interface FullscreenDocumentPreviewProps {
  file: DocumentFile;
}

function FullscreenDocumentPreview({ file }: FullscreenDocumentPreviewProps) {
  const fileType = file.fileType.toLowerCase();

  if (fileType.includes("pdf")) {
    return <PDFPreview file={file} height="80vh" showControls />;
  }

  if (
    fileType.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)
  ) {
    return <ImagePreview file={file} height="80vh" showControls />;
  }

  if (
    fileType.includes("video") ||
    ["mp4", "mov", "avi", "webm"].includes(fileType)
  ) {
    return <VideoPreview file={file} height="80vh" showControls />;
  }

  return null;
}

// PDF Preview Component
interface PDFPreviewProps {
  file: DocumentFile;
  height?: string;
  showControls?: boolean;
}

function PDFPreview({
  file,
  height = "400px",
  showControls = false,
}: PDFPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative" style={{ height }}>
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(file.cloudinaryUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}

      <iframe
        src={`${file.cloudinaryUrl}#toolbar=${showControls ? 1 : 0}&navpanes=${
          showControls ? 1 : 0
        }&scrollbar=1`}
        className="w-full h-full border-0 rounded-lg"
        title={file.originalName}
        onError={() => setError("Failed to load PDF")}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(file.cloudinaryUrl, "_blank")}
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Image Preview Component
interface ImagePreviewProps {
  file: DocumentFile;
  height?: string;
  showControls?: boolean;
}

function ImagePreview({
  file,
  height = "400px",
  showControls = false,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div
      className="relative bg-gray-50 rounded-lg overflow-hidden"
      style={{ height }}
    >
      {showControls && (
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
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center overflow-auto">
        <img
          src={file.cloudinaryUrl}
          alt={file.originalName}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease-in-out",
          }}
          onError={() => setError("Failed to load image")}
        />
      </div>

      {showControls && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Preview Component
interface VideoPreviewProps {
  file: DocumentFile;
  height?: string;
  showControls?: boolean;
}

function VideoPreview({
  file,
  height = "400px",
  showControls = true,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden"
      style={{ height }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setError("Failed to load video")}
        controls={!showControls}
      >
        <source src={file.cloudinaryUrl} type={`video/${file.fileType}`} />
        Your browser does not support the video tag.
      </video>

      {/* Custom Video Controls */}
      {showControls && (
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
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
