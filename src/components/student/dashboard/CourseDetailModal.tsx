"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Clock,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Users,
  Award,
  Globe,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: string;
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
    profileImage?: string;
    image?: string;
  };
  image?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  cohort?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  certificateAwarded?: boolean;
  installmentEnabled?: boolean;
  installmentPlan?: any;
}

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (courseId: string) => void;
}

export default function CourseDetailModal({
  course,
  isOpen,
  onClose,
  onApply,
}: CourseDetailModalProps) {
  if (!course) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "BEGINNER":
        return "bg-green-100 text-green-800 border-green-200";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ADVANCED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>{course.description}</DialogDescription>
        </DialogHeader>
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 bg-neutral-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent z-10"></div>
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">
              📚
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 backdrop-blur-md rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-brand-primary hover:bg-brand-primary text-white border-0">
                {course.category}
              </Badge>
              <Badge className={getDifficultyColor(course.difficulty)}>
                {course.difficulty}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md">
                {course.mode.join(", ")}
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {course.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Instructor: {course.instructor.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration} Weeks</span>
              </div>
              {course.cohort && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">
                  Cohort: {course.cohort}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-100 bg-white">
          <div className="p-4 flex flex-col items-center justify-center border-r border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Duration</span>
            <span className="text-sm font-semibold">{course.duration} Weeks</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center border-r border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Start Date</span>
            <span className="text-sm font-semibold">
              {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'TBA'}
            </span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center border-r border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Deadline</span>
            <span className="text-sm font-semibold text-red-600">
              {course.enrollmentDeadline ? new Date(course.enrollmentDeadline).toLocaleDateString() : 'TBA'}
            </span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Level</span>
            <span className="text-sm font-semibold capitalize">{course.difficulty.toLowerCase()}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Info */}
          <div className="lg:col-span-2 p-6 sm:p-8 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                About this Course
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </section>

            <section className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden">
                    {(course.instructor.profileImage || course.instructor.image) ? (
                      <img 
                        src={course.instructor.profileImage || course.instructor.image} 
                        alt={course.instructor.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-brand-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{course.instructor.name}</h4>
                    <p className="text-sm text-neutral-500 italic">Course Instructor</p>
                  </div>
               </div>
               {course.instructor.bio && (
                 <p className="text-sm text-neutral-600 leading-relaxed">
                   {course.instructor.bio}
                 </p>
               )}
            </section>

            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  What You'll Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningObjectives.map((obj, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((req, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Pricing & Sidebar */}
          <div className="bg-neutral-50 p-6 sm:p-8 border-l border-neutral-100 lg:h-full">
            <div className="sticky top-8 space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200">
                <p className="text-neutral-500 text-sm mb-1 font-medium italic">Course Price</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black text-gray-900">₵{course.price.toLocaleString()}</span>
                  <span className="text-neutral-400 text-sm">Full access</span>
                </div>

                {course.applicationFee > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-yellow-800 italic">Application Fee</span>
                      <span className="font-bold text-yellow-950">₵{course.applicationFee.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    onClose();
                    onApply(course.id);
                  }}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-12 rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
                >
                  Apply Now
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 px-1">This course includes:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-neutral-600 text-sm">
                    <Globe className="w-4 h-4 text-brand-primary" />
                    <span>Access on mobile and TV</span>
                  </div>
                  {course.certificateAwarded !== false && (
                    <div className="flex items-center gap-3 text-neutral-600 text-sm">
                      <Award className="w-4 h-4 text-brand-primary" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-neutral-600 text-sm">
                    <GraduationCap className="w-4 h-4 text-brand-primary" />
                    <span>Expert instruction</span>
                  </div>
                </div>

                {course.installmentEnabled && course.installmentPlan && (
                  <div className="mt-8 pt-6 border-t border-neutral-100">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Payment Plan Available</h4>
                    <ul className="space-y-2">
                      {Object.entries(course.installmentPlan).map(([key, value]) => (
                        <li key={key} className="flex justify-between text-xs text-neutral-600">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-semibold text-gray-900">{value as number}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
