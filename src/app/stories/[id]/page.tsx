"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import Footer from "@/components/layout/Footer";
import { successStories } from "@/lib/data";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [story, setStory] = useState<typeof successStories[0] | null>(null);

  // Check for authenticated user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  // Fetch story data
  useEffect(() => {
    if (params.id) {
      const foundStory = successStories.find(
        (s) => s.id === Number(params.id)
      );
      if (foundStory) {
        setStory(foundStory);
      } else {
        router.push("/stories");
      }
    }
  }, [params.id, router]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-neutral-50">
        <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-neutral-50">
      <div className="max-w-full mx-auto">
        {/* Enhanced Navigation */}
        <EnhancedNavigation user={user} />

        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/1.jpeg"
              alt={story.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/80"></div>
          </div>

          <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <Link href="/stories" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stories
            </Link>
            
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-4xl">
              {story.image}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {story.name}
            </h1>
            <p className="text-xl text-brand-primary-light font-medium mb-2">
              {story.role} at {story.company}
            </p>
            <p className="text-white/80">
              Graduate of {story.course} • Class of {story.year}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Story Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 p-8">
                  <CardTitle className="text-2xl font-bold text-neutral-900">
                    My Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                    <p className="text-xl font-medium text-brand-primary mb-6 italic">
                      &ldquo;{story.story}&rdquo;
                    </p>
                    <div className="space-y-4">
                      {story.fullStory.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Achievements */}
              <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 p-8">
                  <CardTitle className="text-2xl font-bold text-neutral-900">
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4 p-4 bg-brand-neutral-50 rounded-xl">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary text-xl flex-shrink-0">
                        🎯
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">Impact</h4>
                        <p className="text-sm text-gray-600">{story.achievement}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-brand-neutral-50 rounded-xl">
                      <div className="w-10 h-10 bg-brand-secondary/10 rounded-lg flex items-center justify-center text-brand-secondary text-xl flex-shrink-0">
                        💰
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">Growth</h4>
                        <p className="text-sm text-gray-600">{story.salary}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-brand-primary text-white">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6">Career Transformation</h3>
                  <div className="space-y-6">
                    <div className="relative pl-8 border-l-2 border-white/30">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white/30"></div>
                      <p className="text-sm text-white/70 mb-1">Before</p>
                      <p className="font-semibold text-lg">{story.beforeRole}</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-white">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white"></div>
                      <p className="text-sm text-white/70 mb-1">After</p>
                      <p className="font-semibold text-lg">{story.afterRole}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-neutral-900 mb-6">Course Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Program</p>
                      <p className="font-semibold text-brand-primary">{story.course}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Graduation Year</p>
                      <p className="font-semibold text-neutral-900">{story.year}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <Link href="/courses">
                        <Button className="w-full rounded-xl btn-brand-primary">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
