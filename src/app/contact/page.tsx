"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-neutral-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✅</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Message Sent!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Thank you for reaching out. We&apos;ll get back to you within 24
              hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                In the meantime, feel free to explore our courses or follow us
                on social media.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/courses" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    View Courses
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-neutral-50 flex flex-col">
      {/* Enhanced Navigation */}
      <EnhancedNavigation user={user} />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative min-h-[500px] lg:h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Modern Overlay */}
          <div className="absolute inset-0 z-0 scale-105 animate-subtle-zoom">
            <img
              src="/images/2.jpeg"
              alt="Contact KM Media Training Institute"
              className="w-full h-full object-cover grayscale opacity-20"
            />
            {/* Multi-layered overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/90 via-neutral-900/80 to-neutral-950/90"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center mt-24 mb-20">
            <div className="max-w-4xl mx-auto">
              {/* Premium Glassmorphism Badge */}
              <div className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium mb-10 animate-fade-in shadow-2xl">
                <span className="relative flex h-2.5 w-2.5 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
                </span>
                We&apos;re Here to Help
              </div>
             
              {/* Refined Typography */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1] drop-shadow-lg">
                <span className="block">
                  Let&apos;s Start a
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent italic">
                  Conversation
                </span>
              </h1>
              
              <div className="w-24 h-1.5 bg-brand-primary mx-auto rounded-full mb-10 shadow-lg shadow-brand-primary/50"></div>

              <p className="text-lg sm:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-md">
                Have questions about our courses, admissions, or partnerships? Our team is ready to assist you on your journey.
              </p>
            </div>
          </div>

          {/* Bottom Decorative Curve */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-brand-neutral-50 clip-path-slant"></div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="pt-24 pb-32 relative bg-brand-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-20">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                      📍
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-text-primary mb-1">Visit Us</h3>
                      <p className="text-brand-text-secondary">
                        123 Media Avenue,<br />
                        Akatsi, Volta Region<br />
                        Ghana
                      </p>
                      <p className="text-xs text-brand-primary font-medium mt-2">
                        Open Mon-Fri: 9AM-6PM
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                      📞
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-text-primary mb-1">Call Us</h3>
                      <p className="text-brand-text-secondary">
                        +234 (0) 123 456 7890<br />
                        +234 (0) 098 765 4321
                      </p>
                      <p className="text-xs text-brand-secondary font-medium mt-2">
                        24/7 Support Available
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                      ✉️
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-text-primary mb-1">Email Us</h3>
                      <p className="text-brand-text-secondary break-all">
                        info@kmmediatraininginstitute.com
                      </p>
                      <p className="text-xs text-brand-accent font-medium mt-2">
                        Response within 24 hours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Quick Links */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-border/20">
                  <h3 className="font-bold text-lg text-brand-text-primary mb-4">Common Questions</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-brand-text-secondary hover:text-brand-primary cursor-pointer transition-colors">
                      • Admission requirements?
                    </p>
                    <p className="text-sm text-brand-text-secondary hover:text-brand-primary cursor-pointer transition-colors">
                      • Tuition and fees?
                    </p>
                    <p className="text-sm text-brand-text-secondary hover:text-brand-primary cursor-pointer transition-colors">
                      • Class schedules?
                    </p>
                    <Link href="/faq" className="block text-sm font-semibold text-brand-primary hover:underline mt-4">
                      View all FAQs →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Main Contact Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-brand-neutral-50 border-b border-brand-border/20 pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                        <span className="text-white text-lg">💬</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-brand-text-primary">
                          Send Us a Message
                        </CardTitle>
                        <CardDescription className="text-brand-text-secondary">
                          Fill out the form below and we&apos;ll be in touch shortly.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-sm font-semibold text-brand-text-primary"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="h-12 border-brand-border bg-brand-neutral-50 focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-brand-text-primary"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="h-12 border-brand-border bg-brand-neutral-50 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-semibold text-brand-text-primary"
                          >
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+234 (0) 123 456 7890"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-12 border-brand-border bg-brand-neutral-50 focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="inquiryType"
                            className="text-sm font-semibold text-brand-text-primary"
                          >
                            Inquiry Type
                          </Label>
                          <select
                            id="inquiryType"
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                            className="w-full h-12 rounded-md border border-brand-border bg-brand-neutral-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:bg-white transition-colors"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="admissions">Admissions</option>
                            <option value="courses">Course Information</option>
                            <option value="careers">Career Services</option>
                            <option value="partnerships">Partnerships</option>
                            <option value="technical">Technical Support</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-sm font-semibold text-brand-text-primary"
                        >
                          Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="What is this regarding?"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="h-12 border-brand-border bg-brand-neutral-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-sm font-semibold text-brand-text-primary"
                        >
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          className="flex w-full rounded-md border border-brand-border bg-brand-neutral-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-colors resize-y min-h-[150px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 btn-brand-primary text-lg font-bold shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Message...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Send Message</span>
                            <span aria-hidden="true">→</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="pt-0 pb-20 bg-white border-t border-brand-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-text-primary mb-4">Find Our Campus</h2>
              <p className="text-brand-text-secondary max-w-2xl mx-auto">
                Located in the heart of Akatsi, our campus is easily accessible by public transport and features learning spaces designed for creativity.
              </p>
             </div>
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-brand-neutral-100 h-96 flex items-center justify-center relative group overflow-hidden">
                   {/* Interactive Map Placeholder - In production this would be Google Maps Embed */}
                  <div className="text-center z-10">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🗺️</div>
                    <p className="text-brand-text-primary font-bold text-xl">
                      Interactive Map
                    </p>
                    <p className="text-brand-text-secondary">
                      123 Media Avenue, Akatsi, Volta Region
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
