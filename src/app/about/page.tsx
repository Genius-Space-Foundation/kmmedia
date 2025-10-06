"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      <div className="relative max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-surface/95 border-b border-brand-border/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-responsive">
            <nav className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo Section - Left */}
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="/images/logo.jpeg"
                    alt="KM Media Training Institute Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-responsive-lg sm:text-responsive-xl font-bold text-brand-primary leading-tight">
                    KM Media Training Institute
                  </h1>
                  <p className="text-xs sm:text-sm text-brand-text-muted font-medium">
                    Excellence in Media Education
                  </p>
                </div>
              </Link>

              {/* Navigation Links - Center */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Courses
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-accent/10 hover:text-brand-accent transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Contact
                  </Button>
                </Link>
              </div>

              {/* Auth Buttons - Right */}
              <div className="flex items-center space-x-1 sm:space-x-3">
                <Link href="/auth/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 btn-touch-friendly-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button className="btn-brand-primary shadow-md btn-touch-friendly-sm">
                    Sign Up
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden btn-touch-friendly-sm hover:bg-brand-primary/10 p-2 ml-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </Button>
              </div>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-4 pb-4 border-t border-brand-border/30">
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300"
                  >
                    Home
                  </Button>
                </Link>
                <Link
                  href="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300"
                  >
                    Courses
                  </Button>
                </Link>
                <Link
                  href="/stories"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all duration-300"
                  >
                    Stories
                  </Button>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-accent/10 hover:text-brand-accent transition-all duration-300"
                  >
                    Contact
                  </Button>
                </Link>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-brand-border/30 mt-4">
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-start btn-brand-primary hover:opacity-90 transition-all duration-300">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-responsive text-center relative overflow-hidden rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 my-4 sm:my-8">
          <div className="absolute inset-0">
            <img
              src="/images/2.jpeg"
              alt="About KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-brand-overlay"></div>
          </div>
          <div className="relative z-10 text-white max-w-4xl mx-auto px-responsive">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              About Our Institute
            </div>
            <h1 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              Empowering the Next Generation of
              <br />
              <span className="text-brand-accent">Media Professionals</span>
            </h1>
            <p className="text-responsive-lg sm:text-responsive-xl text-brand-neutral-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Since our founding, we&apos;ve been dedicated to providing
              world-class media education through innovative hybrid learning
              experiences that combine theoretical knowledge with hands-on
              practical training.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-responsive px-responsive">
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
                  To democratize access to quality media education by providing
                  comprehensive, industry-relevant training that bridges the gap
                  between academic learning and professional practice in the
                  rapidly evolving media landscape.
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
                  recognized for excellence in education, innovation in teaching
                  methodologies, and for producing graduates who shape the
                  future of media and communication.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-responsive px-responsive">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-brand-gradient-hero mb-3 sm:mb-4">
              Our Core Values
            </h2>
            <p className="text-responsive-base sm:text-responsive-lg text-brand-text-secondary max-w-2xl mx-auto">
              The principles that guide everything we do and shape our approach
              to education
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
        </section>

        {/* Team Section */}
        <section className="py-responsive px-responsive">
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
        </section>

        {/* Statistics */}
        <section className="py-responsive px-responsive">
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
        </section>

        {/* Call to Action */}
        <section className="py-responsive px-responsive text-center">
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
