"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  X,
  Clock,
  Calendar,
  Video,
  MapPin,
  User,
  Download,
  ExternalLink,
  Copy,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";

interface Resource {
  id: string;
  name: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "DOCUMENT";
  url: string;
  downloadable: boolean;
}

interface ClassSession {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: "LIVE" | "RECORDED" | "HYBRID";
  instructor: {
    id: string;
    name: string;
    photo?: string;
    bio?: string;
  };
  meetingLink?: string;
  platform?: "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "IN_PERSON";
  location?: string;
  accessCode?: string;
  agenda: string[];
  materials: Resource[];
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

interface UpcomingClassDetailModalProps {
  classSession: ClassSession | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinClass?: (classId: string) => void;
  onAddToCalendar?: (classId: string) => void;
}

export default function UpcomingClassDetailModal({
  classSession,
  isOpen,
  onClose,
  onJoinClass,
  onAddToCalendar,
}: UpcomingClassDetailModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  if (!classSession) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "LIVE":
        return "from-green-500 to-emerald-600";
      case "RECORDED":
        return "from-blue-500 to-indigo-600";
      case "HYBRID":
        return "from-purple-500 to-violet-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case "ZOOM":
        return "🎥";
      case "GOOGLE_MEET":
        return "📹";
      case "TEAMS":
        return "💼";
      case "IN_PERSON":
        return "🏫";
      default:
        return "🎓";
    }
  };

  const getTimeUntilClass = () => {
    const now = new Date();
    const classStart = new Date(`${classSession.date}T${classSession.startTime}`);
    const diff = classStart.getTime() - now.getTime();

    if (diff < 0) return { text: "In Progress", canJoin: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const canJoin = diff < 15 * 60 * 1000; // Can join 15 minutes before

    if (days > 0) {
      return { text: `Starts in ${days}d ${hours}h`, canJoin };
    } else if (hours > 0) {
      return { text: `Starts in ${hours}h ${minutes}m`, canJoin };
    } else {
      return { text: `Starts in ${minutes}m`, canJoin };
    }
  };

  const handleCopyLink = () => {
    if (classSession.meetingLink) {
      navigator.clipboard.writeText(classSession.meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const timeUntil = getTimeUntilClass();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <Badge
                className={`bg-gradient-to-r ${getTypeColor(classSession.type)} text-white border-0`}
              >
                {classSession.type}
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-800">
                {classSession.courseName}
              </Badge>
              {classSession.platform && (
                <Badge variant="outline" className="border-green-200 text-green-800">
                  {getPlatformIcon(classSession.platform)} {classSession.platform}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold px-6 pb-4 text-gray-900">
            {classSession.title}
          </h2>
        </div>

        {/* Time Card */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(classSession.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  {classSession.startTime} - {classSession.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration & Countdown</p>
                <p className="text-lg font-bold text-gray-900">
                  {classSession.duration} minutes
                </p>
                <p
                  className={`text-sm font-medium ${
                    timeUntil.canJoin ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {timeUntil.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Card */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Instructor</h3>
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <Avatar className="w-16 h-16 border-2 border-white shadow-md">
              <AvatarImage
                src={classSession.instructor.photo}
                alt={classSession.instructor.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-semibold">
                {classSession.instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {classSession.instructor.name}
                </h4>
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              {classSession.instructor.bio && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {classSession.instructor.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        {(classSession.meetingLink || classSession.location) && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Meeting Information
            </h3>
            <div className="space-y-3">
              {classSession.meetingLink && (
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Meeting Link
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyLink}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        {linkCopied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(classSession.meetingLink, "_blank")
                        }
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {classSession.meetingLink}
                  </p>
                </div>
              )}

              {classSession.accessCode && (
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">Access Code:</span>
                    <code className="px-3 py-1 bg-gray-100 rounded text-gray-900 font-mono">
                      {classSession.accessCode}
                    </code>
                  </div>
                </div>
              )}

              {classSession.location && (
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Location:</span>
                    <span className="text-gray-700">{classSession.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agenda */}
        {classSession.agenda && classSession.agenda.length > 0 && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Class Agenda
            </h3>
            <div className="space-y-2">
              {classSession.agenda.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 flex-1">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {classSession.materials && classSession.materials.length > 0 && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Class Materials
            </h3>
            <div className="space-y-2">
              {classSession.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{material.name}</p>
                      <p className="text-sm text-gray-600">{material.type}</p>
                    </div>
                  </div>
                  {material.downloadable && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {timeUntil.canJoin && classSession.meetingLink && (
              <Button
                onClick={() => onJoinClass?.(classSession.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
              >
                <Video className="w-5 h-5 mr-2" />
                Join Class Now
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onAddToCalendar?.(classSession.id)}
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 h-12"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Add to Calendar
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 h-12">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
