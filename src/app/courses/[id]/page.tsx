"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Play,
} from "lucide-react";
import CourseAssignmentsTab from "@/components/course/CourseAssignmentsTab";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import Footer from "@/components/layout/Footer";

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
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
    profile?: {
      bio?: string;
    };
  };
  lessons?: Array<{
    id: string;
    title: string;
    description?: string;
    order: number;
  }>;
  _count: {
    applications: number;
    enrollments: number;
    assignments?: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const user = session?.user as any;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.message || "Failed to fetch course");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Course Details...
          </div>
          <p className="text-gray-500">
            Please wait while we fetch course information
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Error Loading Course
            </CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Please try again or browse our available courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Course Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The course you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Please check the course ID or browse our available courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Link href="/courses">Browse Courses</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate spots remaining (assuming a default capacity if not provided)
  const capacity = 30; // Default capacity, you might want to add this to your course model
  const enrolled = course._count.enrollments || 0;
  const spotsRemaining = capacity - enrolled;
  const isAlmostFull = spotsRemaining <= 5;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary/30">
      <EnhancedNavigation user={user} />

      {/* Cinematic Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Advanced Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb - Minimalist */}
          <nav className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-12">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-neutral-700">/</span>
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <span className="text-neutral-700">/</span>
            <span className="text-brand-primary">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Wing - Metadata & Titles */}
            <div className="lg:col-span-7 space-y-10">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/30 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/5">
                  {course.difficulty} Elite
                </Badge>
                {isAlmostFull && (
                  <Badge variant="destructive" className="bg-error-DEFAULT/20 text-error-DEFAULT border-error-DEFAULT/30 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md animate-pulse">
                    Critical Capacity
                  </Badge>
                )}
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                {course.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-400" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <p className="text-xl text-neutral-400 font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Performance Stats Scroll */}
              <div className="grid grid-cols-3 gap-8 py-8 border-y border-white/5">
                <div>
                  <div className="text-3xl font-black text-white mb-1">4.8</div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Global Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">{enrolled}</div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Mastery Cohort</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">{course.duration}W</div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Module Length</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-6 pt-4">
                <Button className="h-16 px-10 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-white font-black text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1">
                  Start Learning Path
                </Button>
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  <Play className="w-5 h-5 mr-3" />
                  Preview Module
                </Button>
              </div>
            </div>

            {/* Right Wing - Cinematic Frame */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                <img
                  src="/images/3.jpeg"
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
                
                {/* Immersive Price Overlay */}
                <div className="absolute bottom-10 left-10 p-8 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/10 shadow-3xl">
                  <div className="text-sm font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Investment</div>
                  <div className="text-5xl font-black text-white tracking-tighter">₵{course.price.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Architecture */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Central Intel - Left Side (8 cols) */}
          <div className="lg:col-span-8 space-y-20">
            {/* Intel Tabs Navigation */}
            <div className="flex space-x-12 border-b border-white/5 pb-6">
              {['overview', 'curriculum', 'assignments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-black uppercase tracking-[0.3em] transition-all relative ${
                    activeTab === tab ? "text-brand-primary" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute -bottom-[25px] left-0 right-0 h-[2px] bg-brand-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* About Intel */}
                <section>
                  <h2 className="text-3xl font-black text-white mb-8 tracking-tighter italic">About the Mastery Program</h2>
                  <p className="text-lg text-neutral-400 font-medium leading-relaxed">
                    {course.longDescription || course.description}
                  </p>
                </section>

                {/* Outcome Metrics */}
                <section className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-xl">
                  <h3 className="text-xl font-black text-white mb-10 uppercase tracking-widest flex items-center gap-4">
                    <div className="h-6 w-1 bg-brand-primary"></div>
                    Strategic Outcomes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { title: "Elite Architecture", desc: "Master the fundamental core principles with structural precision." },
                      { title: "Forge Real World", desc: "Develop high-impact projects vetted by industry veterans." },
                      { title: "Standard Protocol", desc: "Align your skills with the highest professional global standards." },
                      { title: "Visual Narrative", desc: "Construct a cinematic portfolio that commands market attention." }
                    ].map((outcome, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="h-12 w-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-white text-md mb-2">{outcome.title}</h4>
                          <p className="text-neutral-500 text-sm font-medium">{outcome.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Module Sequence</h3>
                  <Badge variant="outline" className="border-brand-primary/30 text-brand-primary">
                    {course.lessons?.length || 0} Modules
                  </Badge>
                </div>
                <div className="space-y-4">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="group bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:bg-neutral-800/50 hover:border-brand-primary/50 transition-all duration-500 hover:scale-[1.01]"
                      >
                        <div className="flex items-start gap-8">
                          <div className="h-16 w-16 rounded-[1.25rem] bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-colors duration-500">
                            <span className="text-xl font-black text-brand-primary group-hover:text-white">{lesson.order < 10 ? `0${lesson.order}` : lesson.order}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl font-black text-white tracking-tight">{lesson.title}</h4>
                              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Module</span>
                            </div>
                            <p className="text-neutral-500 font-medium text-sm leading-relaxed mb-6">
                              {lesson.description || "Core architectural breakdown of the subject matter including practical executions and theoretical synthesis."}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="h-1 w-1 rounded-full bg-brand-primary"></div>
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Mastery Level: Advanced</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="w-6 h-6 text-brand-primary" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <BookOpen className="w-12 h-12 text-neutral-700 mx-auto mb-6" />
                      <h4 className="text-xl font-black text-neutral-400 uppercase tracking-widest">Curriculum Locked</h4>
                      <p className="text-neutral-600 text-sm mt-2">The mastery path is currently being optimized.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CourseAssignmentsTab
                  courseId={course.id}
                  userRole={(user?.role?.toLowerCase() as "student" | "instructor" | "admin") || "student"}
                  userId={user?.id}
                />
              </div>
            )}

            {/* Instructor Profile - Premium Frame */}
            <section className="mt-32 pt-20 border-t border-white/5">
              <div className="flex items-baseline gap-4 mb-12">
                <h2 className="text-4xl font-black text-white tracking-tighter italic">Architect</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>

              <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-neutral-900 to-black border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px]"></div>
                
                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/10 group-hover:border-brand-primary transition-colors duration-700 shadow-2xl">
                      <img
                        src="/images/1.jpeg"
                        alt={course.instructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-emerald-500 rounded-2xl border-4 border-neutral-900 flex items-center justify-center shadow-xl">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-3xl font-black text-white tracking-tighter">{course.instructor.name}</h3>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Elite Certified</Badge>
                      </div>
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-6">Subject Matter Expert • Architect Instructor</p>
                      <p className="text-lg text-neutral-400 font-medium leading-relaxed max-w-2xl">
                        {course.instructor.profile?.bio || "A world-renowned architect in the discipline, having mentored over 10,000+ graduates into top-tier global firms and leadership positions."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5">
                      {[
                        { label: "Students", val: "10K+" },
                        { label: "Rating", val: "4.9/5" },
                        { label: "Exp", val: "15Y+" },
                        { label: "Projects", val: "500+" }
                      ].map((s, i) => (
                        <div key={i}>
                          <div className="text-xl font-black text-white">{s.val}</div>
                          <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-6">
                      <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                        View Dossier
                      </Button>
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">{course.instructor.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Elite Sidebar - Right side (4 cols) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 space-y-10">
              {/* Application Command Center */}
              <div className="p-10 rounded-[3rem] bg-white text-black shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-6">Access Protocol</div>
                  
                  <div className="mb-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Standard Tuition</div>
                    <div className="text-6xl font-black tracking-tighter">₵{course.price.toLocaleString()}</div>
                  </div>

                  <div className="space-y-6 mb-12">
                    {[
                      { icon: Clock, label: "Duration", val: `${course.duration} Weeks` },
                      { icon: Users, label: "Cohort", val: `${enrolled} Enrollments` },
                      { icon: Globe, label: "Access", val: course.mode.join(" / ") },
                      { icon: Award, label: "Outcome", val: "Global Certification" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{item.label}</span>
                        </div>
                        <span className="text-xs font-black text-black uppercase tracking-widest">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/courses/${course.id}/apply`} className="block">
                    <Button className="w-full h-20 rounded-3xl bg-neutral-900 border-2 border-neutral-900 hover:bg-brand-primary hover:border-brand-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
                      Apply For Entry
                    </Button>
                  </Link>
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest text-center mt-6">Application Fee: ₵{course.applicationFee.toLocaleString()}</p>
                </div>
              </div>

              {/* Guarantees Badge */}
              <div className="p-8 rounded-[2rem] bg-brand-primary/5 border border-brand-primary/10 backdrop-blur-3xl text-center">
                <Shield className="w-8 h-8 text-brand-primary mx-auto mb-4" />
                <h5 className="font-black text-white text-xs uppercase tracking-widest mb-2">Elite Assurance</h5>
                <p className="text-[10px] font-medium text-neutral-500 leading-relaxed uppercase tracking-widest">Global industry validation included upon successful module completion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
