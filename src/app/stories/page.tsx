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

// Mock data for success stories
const successStories = [
  {
    id: 1,
    name: "Adunni Oladele",
    role: "Digital Marketing Manager",
    company: "TechStart Nigeria",
    course: "Digital Marketing Mastery",
    image: "👩‍💼",
    story:
      "After completing the Digital Marketing Mastery course, I was able to secure a senior role at one of Nigeria's leading tech startups. The practical skills I learned, especially in SEO and social media marketing, directly contributed to increasing our company's online presence by 300%.",
    achievement: "300% increase in company's online presence",
    beforeRole: "Junior Marketing Assistant",
    afterRole: "Digital Marketing Manager",
    salary: "Salary increased by 180%",
    year: "2024",
  },
  {
    id: 2,
    name: "Emeka Nwosu",
    role: "Video Content Creator",
    company: "Freelance & Nollywood",
    course: "Video Production & Editing",
    image: "👨‍🎬",
    story:
      "The Video Production course transformed my passion into a profitable career. I went from knowing nothing about video editing to working on major Nollywood productions. The hands-on training and industry connections made all the difference.",
    achievement: "Worked on 15+ Nollywood productions",
    beforeRole: "Unemployed Graduate",
    afterRole: "Professional Video Producer",
    salary: "Earning ₵500k+ monthly",
    year: "2023",
  },
  {
    id: 3,
    name: "Fatima Abdullahi",
    role: "Broadcast Journalist",
    company: "Channels Television",
    course: "Broadcast Journalism",
    image: "👩‍📺",
    story:
      "KM Media Training Institute didn't just teach me journalism; they prepared me for the real world. The practical sessions, including live news presentation practice, gave me the confidence to excel in my role at Channels TV.",
    achievement: "Became youngest prime-time anchor",
    beforeRole: "Fresh Graduate",
    afterRole: "News Anchor",
    salary: "Landed dream job at top TV station",
    year: "2024",
  },
  {
    id: 4,
    name: "David Okafor",
    role: "Brand Designer",
    company: "Okafor Creative Studio",
    course: "Graphic Design & Branding",
    image: "👨‍🎨",
    story:
      "Starting my own design studio was always a dream, but I lacked the technical skills and business knowledge. The Graphic Design course not only taught me advanced design techniques but also how to run a creative business.",
    achievement: "Founded successful design studio",
    beforeRole: "Part-time Designer",
    afterRole: "Studio Owner & Creative Director",
    salary: "Business generating ₵2M+ monthly",
    year: "2023",
  },
  {
    id: 5,
    name: "Aisha Mohammed",
    role: "Podcast Host & Producer",
    company: "The Aisha Show",
    course: "Podcast Production",
    image: "👩‍🎙️",
    story:
      "My podcast now reaches over 50,000 listeners across Africa. The technical skills and marketing strategies I learned have been invaluable in growing my audience and securing major brand sponsorships.",
    achievement: "50k+ podcast listeners",
    beforeRole: "Corporate Employee",
    afterRole: "Full-time Podcaster",
    salary: "Multiple brand sponsorships",
    year: "2024",
  },
  {
    id: 6,
    name: "Tolu Adeyemi",
    role: "Social Media Strategist",
    company: "Dangote Group",
    course: "Social Media Management",
    image: "👨‍💻",
    story:
      "The Social Media Management course equipped me with cutting-edge strategies that helped me land a role at one of Africa's largest conglomerates. I now manage social media for multiple Dangote brands.",
    achievement: "Manages 5+ major brand accounts",
    beforeRole: "Social Media Assistant",
    afterRole: "Senior Social Media Strategist",
    salary: "Promoted twice in 18 months",
    year: "2023",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Kemi Adesanya",
    role: "Alumni, Class of 2023",
    content:
      "The instructors are industry professionals who bring real-world experience to the classroom. The hybrid learning model allowed me to balance work while gaining new skills.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ibrahim Yusuf",
    role: "Alumni, Class of 2024",
    content:
      "Best investment I've made in my career. The practical approach and industry connections opened doors I never thought possible.",
    rating: 5,
  },
  {
    id: 3,
    name: "Grace Okonkwo",
    role: "Alumni, Class of 2023",
    content:
      "The support doesn't end after graduation. The career services team helped me land my dream job, and the alumni network is incredibly strong.",
    rating: 5,
  },
];

export default function StoriesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral-50 via-brand-neutral-100 to-brand-neutral-200">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
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
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-brand-primary leading-tight">
                    KM Media Training Institute
                  </h1>
                  <p className="text-xs text-brand-text-muted font-medium">
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
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    About
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
                    className="btn-touch-friendly-sm hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button className="btn-brand-primary shadow-md btn-touch-friendly-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
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
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300"
                  >
                    About
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
              src="/images/1.jpeg"
              alt="Success Stories - KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-brand-overlay"></div>
          </div>
          <div className="relative z-10 text-white max-w-4xl mx-auto px-responsive">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Success Stories
            </div>
            <h1 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              Real Stories,
              <br />
              <span className="text-brand-accent">Real Success</span>
            </h1>
            <p className="text-responsive-lg sm:text-responsive-xl text-brand-neutral-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Discover how our graduates have transformed their careers and
              achieved their dreams through our comprehensive media training
              programs.
            </p>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-responsive px-responsive">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3 sm:mb-4">
                Our Graduate Success Rate
              </h2>
              <p className="text-responsive-base sm:text-responsive-lg text-brand-text-secondary">
                Numbers that speak to the quality of our training
              </p>
            </div>

            <div className="grid grid-responsive-4 gap-6 sm:gap-8">
              {[
                {
                  number: "95%",
                  label: "Job Placement Rate",
                  icon: "💼",
                  description: "within 6 months",
                },
                {
                  number: "180%",
                  label: "Average Salary Increase",
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
                <div key={index} className="text-center group">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-brand-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-brand-text-primary font-semibold mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-text-muted">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Graduate Success Stories
            </h2>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Meet some of our amazing graduates who have transformed their
              careers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {successStories.map((story) => (
              <Card
                key={story.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{story.image}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-brand-text-primary">
                        {story.name}
                      </CardTitle>
                      <CardDescription className="text-brand-primary font-semibold">
                        {story.role}
                      </CardDescription>
                      <p className="text-sm text-brand-text-muted">
                        {story.company}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {story.course}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          Class of {story.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <blockquote className="text-brand-text-secondary italic leading-relaxed">
                    "{story.story}"
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
                        <span className="text-sm text-brand-text-secondary">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
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
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-yellow-50 hover:scale-105"
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
                    "{testimonial.content}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Career Transformation Section */}
        <section className="py-16">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-12 text-white text-center">
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
                <p className="opacity-80">Learn what employers actually want</p>
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
                  className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Start Your Journey
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
                >
                  📚 View Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Alumni Network */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
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
              { company: "Advertising Agencies", logo: "🎨", graduates: "18+" },
              { company: "Media Houses", logo: "📰", graduates: "40+" },
            ].map((employer, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
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
        </section>

        {/* Footer */}
        <footer className="mt-20 py-12 bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-t-3xl">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img
                  src="/images/logo.jpeg"
                  alt="KM Media Training Institute Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  KM Media Training Institute
                </h3>
                <p className="text-brand-neutral-400 text-sm">
                  Excellence in Media Education
                </p>
              </div>
            </div>
            <p className="text-brand-neutral-300 mb-8 max-w-2xl mx-auto">
              Empowering the next generation of media professionals through
              innovative hybrid learning experiences.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
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
            <div className="pt-6 border-t border-brand-neutral-700">
              <p className="text-brand-neutral-400">
                &copy; 2025 KM Media Training Institute. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
