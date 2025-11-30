"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { successStories, testimonials } from "@/lib/data";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function StoriesPage() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="min-h-screen bg-brand-neutral-50">
      <div className="max-w-full mx-auto">
        {/* Enhanced Navigation */}
        <EnhancedNavigation user={user} />

        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/1.jpeg"
              alt="Success Stories - KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/70"></div>
          </div>

          <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-8">
              {/* <span className="text-lg mr-2">⭐</span> */}
              Student Testimonials
            </div>

            {/* Main Heading */}
            <h1 className="text-responsive-4xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Discover Our
              <br />
              <span className="text-brand-primary">Success Stories</span>
            </h1>

            {/* Description */}
            <p className="text-responsive-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-up">
              Stay connected with our community through success stories, events,
              tips, and behind-the-scenes content that inspires and educates.
            </p>

            {/* Search Bar */}
            {/* <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  className="w-full h-14 px-6 pr-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-white/70 text-xl">🔍</span>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-20 px-responsive bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                Quantifying the success of our graduates and the quality of our training
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  number: "95%",
                  label: "Job Placement Rate",
                  icon: "💼",
                  description: "within 6 months",
                },
                {
                  number: "180%",
                  label: "Avg. Salary Increase",
                  icon: "📈",
                  description: "post-graduation",
                },
                {
                  number: "500+",
                  label: "Success Stories",
                  icon: "⭐",
                  description: "and counting",
                },
                {
                  number: "50+",
                  label: "Industry Partners",
                  icon: "🤝",
                  description: "hiring our graduates",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-brand-neutral-50 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-brand-neutral-100 group"
                >
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 text-3xl">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-brand-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-brand-text-primary mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-brand-text-secondary">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Graduate Success Stories
              </h2>
              <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                Meet some of our amazing graduates who have transformed their
                careers
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {successStories.map((story) => (
                <Link href={`/stories/${story.id}`} key={story.id} className="block h-full">
                  <Card
                    className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white shadow-sm h-full rounded-xl overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl">{story.image}</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl text-brand-text-primary group-hover:text-brand-primary transition-colors">
                            {story.name}
                          </CardTitle>
                          <CardDescription className="text-brand-primary font-semibold">
                            {story.role}
                          </CardDescription>
                          <p className="text-sm text-brand-text-muted">
                            {story.company}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-xl">
                              {story.course}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl">
                              Class of {story.year}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <blockquote className="text-brand-text-secondary italic leading-relaxed line-clamp-3">
                        &ldquo;{story.story}&rdquo;
                      </blockquote>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-500">📉</span>
                            <span className="text-sm text-brand-text-secondary">
                              Before: {story.beforeRole}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-brand-secondary">📈</span>
                            <span className="text-sm text-brand-text-secondary">
                              After: {story.afterRole}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-brand-accent">🎯</span>
                            <span className="text-sm text-brand-text-secondary line-clamp-1">
                              {story.achievement}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-brand-tertiary">💰</span>
                            <span className="text-sm text-brand-text-secondary">
                              {story.salary}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 mt-2 flex justify-end">
                        <span className="text-brand-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                          Read full story 
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                What Our Alumni Say
              </h2>
              <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                Honest feedback from graduates about their learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-sm hover:scale-105 rounded-xl"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">
                          ⭐
                        </span>
                      ))}
                    </div>
                    <CardTitle className="text-lg text-brand-text-primary">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-brand-primary">
                      {testimonial.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <blockquote className="text-brand-text-secondary italic leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </blockquote>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Career Transformation Section */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="bg-brand-primary rounded-3xl shadow-2xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-6">
                Your Success Story Starts Here
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Join the hundreds of professionals who have transformed their
                careers through our world-class media training programs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Industry-Relevant Skills
                  </h3>
                  <p className="opacity-80">
                    Learn what employers actually want
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🤝</div>
                  <h3 className="text-xl font-semibold mb-2">Career Support</h3>
                  <p className="opacity-80">
                    Lifetime access to our career services
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌟</div>
                  <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                  <p className="opacity-80">
                    95% of graduates find jobs within 6 months
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
                  >
                    Start Your Journey
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200 rounded-xl"
                  >
                    View Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Alumni Network */}
        {/* <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Join Our Alumni Network
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Connect with industry professionals and expand your career
                opportunities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { company: "Channels TV", logo: "📺", graduates: "15+" },
                { company: "Dangote Group", logo: "🏢", graduates: "8+" },
                { company: "MTN Nigeria", logo: "📱", graduates: "12+" },
                { company: "Nollywood", logo: "🎬", graduates: "25+" },
                { company: "Banks", logo: "🏦", graduates: "20+" },
                { company: "Tech Startups", logo: "💻", graduates: "30+" },
                {
                  company: "Advertising Agencies",
                  logo: "🎨",
                  graduates: "18+",
                },
                { company: "Media Houses", logo: "📰", graduates: "40+" },
              ].map((employer, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm hover:scale-105 rounded-xl"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {employer.logo}
                    </div>
                    <h3 className="font-semibold text-brand-text-primary mb-1">
                      {employer.company}
                    </h3>
                    <p className="text-sm text-brand-primary font-medium">
                      {employer.graduates} graduates
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
