"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  X,
  Star,
  Users,
  Clock,
  Award,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Eye,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  difficulty: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    enrollments: number;
    applications: number;
  };
}

interface CourseQuickPreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseQuickPreviewModal({
  course,
  isOpen,
  onClose,
}: CourseQuickPreviewModalProps) {
  if (!course) return null;

  const enrolled = course._count.enrollments || 0;

  const learningOutcomes = [
    {
      title: "Master Core Concepts",
      description: `Understand fundamental principles in ${course.category}`,
    },
    {
      title: "Hands-on Projects",
      description: "Build real-world projects to apply your knowledge",
    },
    {
      title: "Industry Best Practices",
      description: "Learn professional workflows and standards",
    },
    {
      title: "Portfolio Development",
      description: "Create impressive portfolio pieces",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header Section */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {course.category}
              </Badge>
              <Badge variant="outline" className="border-green-200 text-green-800">
                {course.difficulty}
              </Badge>
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
            {course.title}
          </h2>
        </div>

        {/* Hero Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-indigo-600">
          <img
            src="/images/3.jpeg"
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ₵{course.price.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              App Fee: ₵{course.applicationFee.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">4.8</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">{enrolled}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">{course.duration}</div>
            <div className="text-xs text-gray-600">Weeks</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900 capitalize">
              {course.difficulty}
            </div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>

        {/* What You'll Learn */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            What You'll Learn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{outcome.title}</p>
                  <p className="text-sm text-gray-600">{outcome.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Preview */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Instructor</h3>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {course.instructor.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{course.instructor.name}</p>
              <p className="text-sm text-gray-600">Expert Instructor</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-blue-200 hover:bg-blue-50"
            >
              <Link href={`/courses/${course.id}`} onClick={onClose}>
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href={`/courses/${course.id}/apply`} onClick={onClose}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
