"use client";

import { useState } from "react";
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

export default function ContactPage() {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Stories
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
              alt="Contact KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-brand-overlay"></div>
          </div>
          <div className="relative z-10 text-white max-w-4xl mx-auto px-responsive">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Get In Touch
            </div>
            <h1 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              We'd Love to
              <br />
              <span className="text-brand-accent">Hear From You</span>
            </h1>
            <p className="text-responsive-lg sm:text-responsive-xl text-brand-neutral-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Have questions about our courses? Need guidance on your career
              path? Our team is here to help you take the next step in your
              media journey.
            </p>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-responsive px-responsive">
          <div className="grid grid-responsive-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📍</span>
                </div>
                <CardTitle className="text-xl text-brand-text-primary">
                  Visit Our Campus
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-brand-text-secondary">
                  123 Media Avenue,
                  <br />
                  Victoria Island, Lagos
                  <br />
                  Nigeria
                </p>
                <p className="text-sm text-brand-primary font-medium">
                  Open Mon-Fri: 9AM-6PM
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📞</span>
                </div>
                <CardTitle className="text-xl text-brand-text-primary">
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-brand-text-secondary">
                  +234 (0) 123 456 7890
                  <br />
                  +234 (0) 098 765 4321
                </p>
                <p className="text-sm text-brand-secondary font-medium">
                  24/7 Support Available
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">✉️</span>
                </div>
                <CardTitle className="text-xl text-brand-text-primary">
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-brand-text-secondary">
                  info@kmmedia.edu.ng
                  <br />
                  admissions@kmmedia.edu.ng
                </p>
                <p className="text-sm text-brand-accent font-medium">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form and FAQ */}
        <section className="py-responsive px-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">💬</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-brand-text-primary">
                      Send Us a Message
                    </CardTitle>
                    <CardDescription className="text-brand-text-secondary">
                      Fill out the form below and we&apos;ll get back to you
                      soon
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-brand-text-primary"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-input-brand h-12 px-4 border-2 border-brand-border focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-brand-text-primary"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input-brand h-12 px-4 border-2 border-brand-border focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-brand-text-primary"
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
                        className="form-input-brand h-12 px-4 border-2 border-brand-border focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="inquiryType"
                        className="text-sm font-medium text-brand-text-primary"
                      >
                        Inquiry Type
                      </Label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="form-input-brand h-12 w-full rounded-lg border-2 border-brand-border bg-brand-surface px-4 text-sm focus:border-brand-primary focus:ring-brand-primary/20 focus:outline-none transition-all duration-200"
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
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-700"
                    >
                      Message *
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="form-input-brand w-full px-4 py-3 border-2 border-brand-border focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg transition-all duration-200 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 btn-brand-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Message...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>📤</span>
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-brand-text-primary mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-brand-text-secondary">
                  Quick answers to common questions about our programs
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "What are your admission requirements?",
                    answer:
                      "We welcome students from all backgrounds. Basic computer literacy and enthusiasm for learning are the main requirements. Some advanced courses may have prerequisites.",
                  },
                  {
                    question: "Do you offer payment plans?",
                    answer:
                      "Yes! We offer flexible payment plans including installment options to make our courses accessible to everyone. Contact our admissions team for details.",
                  },
                  {
                    question:
                      "What's the difference between online and hybrid courses?",
                    answer:
                      "Online courses are fully remote with live virtual sessions. Hybrid courses combine online learning with in-person practical sessions at our campus.",
                  },
                  {
                    question: "Do you provide job placement assistance?",
                    answer:
                      "Absolutely! Our career services team provides resume reviews, interview preparation, and connects you with our network of industry partners.",
                  },
                  {
                    question: "How long are the courses?",
                    answer:
                      "Course duration varies from 6-16 weeks depending on the program. Each course is designed to be comprehensive yet time-efficient for working professionals.",
                  },
                ].map((faq, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-brand-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-2">
                    Still have questions?
                  </h3>
                  <p className="text-brand-text-secondary mb-4">
                    Schedule a free consultation with our admissions team
                  </p>
                  <Button className="btn-brand-primary">
                    📅 Schedule Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Section (Placeholder) */}
        <section className="py-16">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-brand-text-primary">
                Find Our Campus
              </CardTitle>
              <CardDescription className="text-brand-text-secondary">
                Located in the heart of Lagos, easily accessible by public
                transport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-brand-text-secondary font-medium">
                    Interactive Map
                  </p>
                  <p className="text-sm text-brand-text-muted">
                    123 Media Avenue, Victoria Island, Lagos
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-blue-500">🚌</span>
                  <span className="text-sm text-brand-text-secondary">
                    Bus Stop: Media Junction
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-brand-secondary">🅿️</span>
                  <span className="text-sm text-brand-text-secondary">
                    Free Parking Available
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-brand-accent">♿</span>
                  <span className="text-sm text-brand-text-secondary">
                    Wheelchair Accessible
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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
