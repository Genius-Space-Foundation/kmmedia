"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import Footer from "@/components/layout/Footer";

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
    <div className="min-h-screen bg-brand-neutral-50 flex flex-col">
      {/* Enhanced Navigation */}
      <EnhancedNavigation user={user} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/2.jpeg"
              alt="About KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/80"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Badge */}
             
            {/* Main Heading */}
            <h1 className="text-responsive-4xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Empowering the Next Generation of
              <br />
              <span className="text-brand-accent">Media Professionals</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Bridging the gap between academic theory and professional practice through innovative, hands-on media education.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Mission */}
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl">
                  🎯
                </div>
                <h2 className="text-3xl font-bold text-neutral-900">Our Mission</h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  To democratize access to quality media education by providing comprehensive, industry-relevant training. We strive to empower individuals with the practical skills and theoretical knowledge needed to thrive in the rapidly evolving global media landscape.
                </p>
              </div>

              {/* Vision */}
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-2xl">
                  👁️
                </div>
                <h2 className="text-3xl font-bold text-neutral-900">Our Vision</h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  To be the premier media training institute in Africa, recognized globally for excellence in education, innovation in teaching methodologies, and for producing graduates who become ethical leaders and creative pioneers in the media industry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Strip */}
        <section className="py-16 bg-brand-neutral-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-neutral-800">
              <div className="p-4">
                <div className="text-4xl sm:text-5xl font-bold text-brand-primary mb-2">500+</div>
                <div className="text-sm sm:text-base text-neutral-400 font-medium uppercase tracking-wider">Graduates</div>
              </div>
              <div className="p-4">
                <div className="text-4xl sm:text-5xl font-bold text-brand-primary mb-2">95%</div>
                <div className="text-sm sm:text-base text-neutral-400 font-medium uppercase tracking-wider">Job Placement</div>
              </div>
              <div className="p-4">
                <div className="text-4xl sm:text-5xl font-bold text-brand-primary mb-2">50+</div>
                <div className="text-sm sm:text-base text-neutral-400 font-medium uppercase tracking-wider">Partners</div>
              </div>
              <div className="p-4">
                <div className="text-4xl sm:text-5xl font-bold text-brand-primary mb-2">5</div>
                <div className="text-sm sm:text-base text-neutral-400 font-medium uppercase tracking-wider">Years Active</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-brand-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Our Core Values</h2>
              <p className="text-lg text-neutral-600">
                The fundamental principles that guide our educational approach and professional conduct.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "🎓",
                  title: "Excellence",
                  description: "We hold ourselves and our students to the highest standards of academic and practical performance."
                },
                {
                  icon: "🤝",
                  title: "Integrity",
                  description: "We operate with transparency, honesty, and strong ethical principles in all our interactions."
                },
                {
                  icon: "💡",
                  title: "Innovation",
                  description: "We embrace new technologies and creative methodologies to stay ahead of industry trends."
                },
                {
                  icon: "🌍",
                  title: "Impact",
                  description: "We focus on creating positive change in our community and the broader media landscape."
                }
              ].map((value, index) => (
                <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardHeader className="text-center pt-8 pb-4">
                    <div className="w-16 h-16 mx-auto bg-brand-neutral-100 rounded-full flex items-center justify-center text-3xl mb-4">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-neutral-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <p className="text-neutral-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Meet Our Leadership</h2>
                <p className="text-lg text-neutral-600">
                  Guided by industry veterans and passionate educators dedicated to your success.
                </p>
              </div>
              <Link href="/contact">
                <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl">
                  Join Our Team
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Adebayo Johnson",
                  role: "Founder & Director",
                  bio: "20+ years in media strategy and leadership.",
                  image: "👨‍💼"
                },
                {
                  name: "Sarah Okafor",
                  role: "Head of Curriculum",
                  bio: "Expert in digital marketing and content strategy.",
                  image: "👩‍🏫"
                },
                {
                  name: "Michael Adeyemi",
                  role: "Lead Instructor",
                  bio: "Award-winning filmmaker and broadcast journalist.",
                  image: "👨‍🎬"
                }
              ].map((member, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-brand-neutral-50 border border-brand-neutral-100">
                  <div className="aspect-[4/3] bg-brand-neutral-200 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                    {member.image}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
                    <p className="text-brand-primary font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-brand-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-brand-primary-light mb-10 max-w-2xl mx-auto">
              Join a community of passionate creators and launch your career in the media industry today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-brand-primary hover:bg-brand-neutral-100 border-none px-8 py-6 text-lg font-semibold shadow-lg rounded-xl">
                  Apply Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
