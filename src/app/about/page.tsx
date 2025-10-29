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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function AboutPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral-50 via-brand-neutral-100 to-brand-neutral-200 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-tertiary/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Enhanced Navigation */}
      <EnhancedNavigation user={user} />

      <div className="relative max-w-full mx-auto">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center hero-gradient overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/2.jpeg"
              alt="About KM Media Training Institute"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 hero-overlay"></div>
          </div>

          <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              About Our Institute
            </div>

            {/* Main Heading */}
            <h1 className="text-responsive-4xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Empowering the Next Generation of
              <br />
              <span className="text-brand-accent">Media Professionals</span>
            </h1>

            {/* Description */}
            <p className="text-responsive-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-up">
              Since our founding, we've been dedicated to providing world-class
              media education through innovative hybrid learning experiences
              that combine theoretical knowledge with hands-on practical
              training.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <CardTitle className="text-2xl text-brand-text-primary">
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-brand-text-secondary leading-relaxed text-lg">
                    To democratize access to quality media education by
                    providing comprehensive, industry-relevant training that
                    bridges the gap between academic learning and professional
                    practice in the rapidly evolving media landscape.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <CardTitle className="text-2xl text-brand-text-primary">
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-brand-text-secondary leading-relaxed text-lg">
                    To become the leading media training institute in Africa,
                    recognized for excellence in education, innovation in
                    teaching methodologies, and for producing graduates who
                    shape the future of media and communication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-brand-gradient-hero mb-3 sm:mb-4">
                Our Core Values
              </h2>
              <p className="text-responsive-base sm:text-responsive-lg text-brand-text-secondary max-w-2xl mx-auto">
                The principles that guide everything we do and shape our
                approach to education
              </p>
            </div>

            <div className="grid grid-responsive-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  icon: "🎓",
                  title: "Excellence",
                  description:
                    "We strive for the highest standards in education and training delivery",
                  gradient: "from-blue-500 to-indigo-600",
                },
                {
                  icon: "🤝",
                  title: "Integrity",
                  description:
                    "We maintain honesty, transparency, and ethical practices in all our dealings",
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  icon: "🚀",
                  title: "Innovation",
                  description:
                    "We embrace new technologies and methodologies to enhance learning",
                  gradient: "from-purple-500 to-pink-600",
                },
                {
                  icon: "🌍",
                  title: "Impact",
                  description:
                    "We are committed to making a positive difference in our students' lives",
                  gradient: "from-orange-500 to-red-600",
                },
              ].map((value, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-2xl">{value.icon}</span>
                    </div>
                    <CardTitle className="text-xl text-brand-text-primary">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-brand-text-secondary leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-brand-gradient-hero mb-3 sm:mb-4">
                Meet Our Team
              </h2>
              <p className="text-responsive-base sm:text-responsive-lg text-brand-text-secondary max-w-2xl mx-auto">
                Industry experts and passionate educators dedicated to your
                success
              </p>
            </div>

            <div className="grid grid-responsive-3 gap-6 sm:gap-8">
              {[
                {
                  name: "Dr. Adebayo Johnson",
                  role: "Founder & Director",
                  specialization: "Media Strategy & Leadership",
                  image: "👨‍💼",
                  bio: "20+ years in media industry with expertise in digital transformation",
                },
                {
                  name: "Sarah Okafor",
                  role: "Head of Curriculum",
                  specialization: "Digital Marketing & Content Strategy",
                  image: "👩‍🏫",
                  bio: "Former marketing director with passion for education and innovation",
                },
                {
                  name: "Michael Adeyemi",
                  role: "Lead Instructor",
                  specialization: "Video Production & Broadcasting",
                  image: "👨‍🎬",
                  bio: "Award-winning filmmaker and broadcast journalist with global experience",
                },
              ].map((member, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">{member.image}</span>
                    </div>
                    <CardTitle className="text-xl text-brand-text-primary">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-brand-primary font-medium">
                      {member.role}
                    </CardDescription>
                    <p className="text-sm text-brand-secondary font-medium">
                      {member.specialization}
                    </p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-brand-text-secondary leading-relaxed text-sm">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20 px-responsive">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-brand-gradient-hero mb-3 sm:mb-4">
                  Our Impact in Numbers
                </h2>
                <p className="text-responsive-base sm:text-responsive-lg text-brand-text-secondary">
                  Measurable results that speak to our commitment to excellence
                </p>
              </div>

              <div className="grid grid-responsive-4 gap-4 sm:gap-6 lg:gap-8">
                {[
                  { number: "500+", label: "Graduates", icon: "🎓" },
                  { number: "95%", label: "Job Placement Rate", icon: "💼" },
                  { number: "50+", label: "Industry Partners", icon: "🤝" },
                  { number: "5", label: "Years of Excellence", icon: "⭐" },
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold text-brand-accent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-brand-text-secondary font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-responsive text-center">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-brand-text-primary mb-4 sm:mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-responsive-lg sm:text-responsive-xl text-brand-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join hundreds of successful graduates who have transformed their
                careers through our comprehensive media training programs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="btn-touch-friendly px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-brand-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-white"
                  >
                    🚀 Apply Now
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="btn-touch-friendly px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all duration-200"
                  >
                    📚 View Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 lg:mt-20 py-8 sm:py-10 lg:py-12 bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-t-2xl sm:rounded-t-3xl">
          <div className="max-w-4xl mx-auto px-responsive text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden">
                <img
                  src="/images/logo.jpeg"
                  alt="KM Media Training Institute Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-responsive-xl sm:text-responsive-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  KM Media Training Institute
                </h3>
                <p className="text-brand-neutral-400 text-xs sm:text-sm">
                  Excellence in Media Education
                </p>
              </div>
            </div>
            <p className="text-responsive-sm sm:text-responsive-base text-brand-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Empowering the next generation of media professionals through
              innovative hybrid learning experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Link
                href="/about"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                About
              </Link>
              <Link
                href="/courses"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/stories"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Stories
              </Link>
              <Link
                href="/contact"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="pt-4 sm:pt-6 border-t border-brand-neutral-700">
              <p className="text-responsive-sm text-brand-neutral-400">
                &copy; 2025 KM Media Training Institute. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
