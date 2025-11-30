import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  instructor: {
    name: string;
    avatar?: string;
  };
  image?: string;
}

interface StudentCoursesProps {
  courses: Course[];
  onApplyCourse: (courseId: string) => void;
}

export default function StudentCourses({ courses, onApplyCourse }: StudentCoursesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "ALL" || course.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Catalog</h2>
          <p className="text-gray-600 mt-1">Discover and apply for amazing courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-xl md:w-80"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="rounded-xl md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
            <SelectItem value="VIDEOGRAPHY">Videography</SelectItem>
            <SelectItem value="EDITING">Editing</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="rounded-xl md:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onApply={onApplyCourse} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg mb-2">No courses found</p>
            <Button 
              variant="link" 
              onClick={() => { setSearchTerm(""); setCategoryFilter("ALL"); setDifficultyFilter("ALL"); }}
              className="text-brand-primary"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onApply }: { course: Course; onApply: (id: string) => void }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER": return "bg-green-100 text-green-800";
      case "INTERMEDIATE": return "bg-yellow-100 text-yellow-800";
      case "ADVANCED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group h-full flex flex-col">
      {/* Course Image/Icon */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
          📚
        </div>
        <Badge className={`absolute top-4 right-4 ${getDifficultyColor(course.difficulty)} hover:${getDifficultyColor(course.difficulty)}`}>
          {course.difficulty}
        </Badge>
        <Badge className="absolute top-4 left-4 bg-white/90 text-brand-primary backdrop-blur-sm shadow-sm hover:bg-white">
          {course.category}
        </Badge>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
        
        {/* Course Details */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">👨‍🏫</span>
            <span className="text-gray-600 truncate">{course.instructor.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">⏱️</span>
            <span className="text-gray-600">{course.duration} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-500">🎓</span>
            <span className="text-gray-600 truncate">{course.mode.join(", ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">💰</span>
            <span className="text-gray-600">₵{course.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Application Fee */}
        {course.applicationFee > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Application Fee:</span> ₵{course.applicationFee.toLocaleString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
              📖 View Details
            </Button>
          </Link>
          <Button 
            onClick={() => onApply(course.id)}
            className="flex-1 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg transition-all"
          >
            🚀 Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
