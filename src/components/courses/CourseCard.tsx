"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Heart,
  Share2,
  Eye,
  Award,
  CheckCircle,
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
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    bio?: string;
    rating?: number;
    totalStudents?: number;
    yearsExperience?: number;
    credentials?: string[];
  };
  _count: {
    applications: number;
    enrollments: number;
    reviews?: number;
    assignments?: number;
  };
  status: string;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
  isEnrolled?: boolean;
  progress?: number;
  isWishlisted?: boolean;
  nextStartDate?: string;
  spotsRemaining?: number;
  tags?: string[];
  completionRate?: number;
  lastAccessed?: string;
}

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "detailed";
  showProgress?: boolean;
  onWishlistToggle?: (courseId: string) => void;
  onShare?: (course: Course) => void;
  onPreview?: (course: Course) => void;
  className?: string;
}

export default function CourseCard({
  course,
  variant = "default",
  showProgress = false,
  onWishlistToggle,
  onShare,
  onPreview,
  className = "",
}: CourseCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const rating = course.averageRating || 4.8;
  const isPopular = course._count.enrollments > 50;
  const isAlmostFull = course.spotsRemaining && course.spotsRemaining <= 5;
  const isNew =
    new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(course.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(course);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPreview?.(course);
  };

  if (variant === "compact") {
    return (
      <Card
        className={`group hover:shadow-2xl transition-all duration-500 border border-white/10 bg-white/40 backdrop-blur-xl rounded-2xl overflow-hidden ${className}`}
      >
        <div className="flex p-4 space-x-5">
          {/* Course Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
              <img
                src="/images/3.jpeg"
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <BookOpen className="w-8 h-8 text-brand-primary animate-pulse" />}
            </div>
            {isPopular && (
              <Badge className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] font-black px-1.5 py-0.5 shadow-xl uppercase">
                Hot
              </Badge>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-black text-neutral-900 truncate pr-2 group-hover:text-brand-primary transition-colors tracking-tight text-lg">
                {course.title}
              </h3>
            </div>

            <div className="flex items-center space-x-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">
              <div className="flex items-center space-x-1">
                <Avatar className="w-5 h-5 border border-white">
                  <AvatarImage src={course.instructor.profileImage} />
                  <AvatarFallback className="bg-neutral-900 text-white text-[8px]">
                    {course.instructor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{course.instructor.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-brand-primary" />
                <span>{course.duration}w</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-brand-primary text-brand-primary" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-[9px] font-black uppercase border-neutral-200">
                  {course.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-black text-neutral-900 text-lg">
                  ₵{course.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-white/10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden hover:scale-[1.02] hover:-translate-y-2 relative cursor-pointer ${className}`}
    >
      {/* Status Badges - Multi-layer */}
      <div className="absolute top-5 left-5 z-10 flex flex-col space-y-2">
        {isNew && (
          <Badge className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-xl uppercase tracking-widest border-0">
            Elite New
          </Badge>
        )}
        {isPopular && (
          <Badge className="bg-brand-primary text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-xl uppercase tracking-widest border-0">
            Top Rated
          </Badge>
        )}
        {isAlmostFull && (
          <Badge className="bg-error-DEFAULT text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-xl uppercase tracking-widest border-0">
            Critical Spots
          </Badge>
        )}
      </div>

      {/* Action Buttons - Quick Access */}
      <div className="absolute top-5 right-5 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistToggle}
          className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xl hover:bg-white text-neutral-900 shadow-xl"
        >
          <Heart className={`w-5 h-5 ${course.isWishlisted ? "fill-error-DEFAULT text-error-DEFAULT" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xl hover:bg-white text-neutral-900 shadow-xl"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Image Section - Cinematic Scale */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="/images/3.jpeg"
          alt={course.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent group-hover:via-neutral-900/40 transition-all duration-500" />
        
        {/* Dynamic Hover Effect */}
        <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Icon - Centered Action */}
        {onPreview && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
            <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-3xl border border-white/30 flex items-center justify-center group-hover:bg-brand-primary transition-colors cursor-pointer" onClick={handlePreview}>
              <Play className="w-10 h-10 text-white ml-2" />
            </div>
          </div>
        )}

        {/* Floating Price Tag */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end">
          <div className="bg-brand-primary text-white text-2xl font-black px-5 py-2 rounded-2xl shadow-2xl tracking-tighter">
            ₵{course.price.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Category Badge & Meta */}
        <div className="flex items-center gap-3 mb-5">
          <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 font-black uppercase text-[9px] tracking-[0.2em] px-3 py-1">
            {course.category}
          </Badge>
          <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {course.difficulty} Level
          </span>
        </div>

        <h3 className="text-2xl font-black text-neutral-900 group-hover:text-brand-primary transition-colors line-clamp-2 mb-4 leading-tight tracking-tight">
          {course.title}
        </h3>

        <p className="text-neutral-500 font-medium line-clamp-2 mb-8 text-sm leading-relaxed">
          {course.description}
        </p>

        {/* Professional Instructor Profile */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-3xl bg-neutral-50 border border-neutral-100 group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-14 h-14 border-4 border-white shadow-2xl">
                <AvatarImage src={course.instructor.profileImage} className="object-cover" />
                <AvatarFallback className="bg-neutral-900 text-white text-xs font-black">
                  {course.instructor.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-black text-neutral-900 text-sm">{course.instructor.name}</h4>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Architect Instructor</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-brand-primary font-black text-xs">
              <Star className="w-3 h-3 fill-brand-primary" />
              {course.instructor.rating?.toFixed(1) || "4.9"}
            </div>
            <span className="text-[9px] font-bold text-neutral-400">RATING</span>
          </div>
        </div>

        {/* Performance High-Impact Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { icon: Star, value: rating.toFixed(1), label: "SCORE", color: "text-brand-primary" },
            { icon: Users, value: course._count.enrollments, label: "ENROLLED", color: "text-neutral-900" },
            { icon: Clock, value: `${course.duration}W`, label: "LENGTH", color: "text-neutral-900" },
            { icon: Award, value: "YES", label: "CERT", color: "text-neutral-900" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group/stat">
              <div className="text-lg font-black text-neutral-900 mb-0.5 tracking-tighter">{stat.value}</div>
              <div className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress System for Enrolled Students */}
        {showProgress && course.isEnrolled && (
          <div className="mb-8 p-5 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-emerald-100 flex-shrink-0">
               <span className="text-xl font-black text-emerald-600">{course.progress || 0}%</span>
            </div>
            <div className="flex-1">
              <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Mastery Progress</h5>
              <Progress value={course.progress || 0} className="h-2 bg-emerald-100" />
            </div>
          </div>
        )}

        {/* Global Action Terminal */}
        <div className="flex gap-4">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-neutral-200 text-neutral-900 font-black text-[12px] uppercase tracking-widest hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all active:scale-95 group/btn shadow-sm">
              <Eye className="w-4 h-4 mr-3 group-hover/btn:scale-110 transition-transform" />
              Explore Path
            </Button>
          </Link>
          <Link href={`/courses/${course.id}/apply`} className="flex-1">
            <Button className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-white font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95 group/btn">
              {course.isEnrolled ? (
                <>
                  <Play className="w-4 h-4 mr-3 group-hover/btn:scale-110 transition-transform" />
                  Resume Mastery
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-3 group-hover/btn:scale-110 transition-transform" />
                  Enroll Now
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
