"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HeroSection() {
  const [user, setUser] = useState<User | null>(null);

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
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[900px] flex items-center overflow-hidden bg-neutral-900">
      {/* Premium Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: "url('/images/1.jpeg')" }}
      >
        {/* Advanced Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]"></div>
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 30%, var(--brand-primary) 0%, transparent 50%),
                              radial-gradient(circle at 80% 70%, #064E6B 0%, transparent 50%)`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading with Premium Typography */}
          <h1 className="text-4xl tracking-tight font-black text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] sm:leading-[0.9]">
            <span className="block mb-2">Elevate Your</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-[#57D2FF] py-2">
              Media & Tech Career
            </span>
          </h1>

          {/* Subtitle with better spacing and readability */}
          <p className="mt-8 text-lg sm:text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            Master the skills that define the future of media and technology. Access world-class training in film production, digital broadcasting, and tech innovation today.
          </p>

          {/* CTA Section - Simplified and Impactful */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-6">
            <Link href={user ? `/dashboards/${user.role.toLowerCase()}` : "/auth/register"} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-[#57D2FF] rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Button className="relative h-16 px-10 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-black text-lg shadow-2xl transition-all duration-300 active:scale-95 flex items-center gap-3">
                {user ? "Enter Your Dashboard" : "Start Your Journey Today"}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Glassmorphic Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  </div>
                ))}
              </div>
              <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
              <span className="text-sm font-black text-white uppercase tracking-wider">Industry Certified</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-neutral-400 font-bold uppercase tracking-[0.2em]">
              <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></div>
              Expert Instructors
              <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></div>
              Job Support
            </div>
          </div>
        </div>
      </div>

      {/* Decoration Element */}
      <div className="absolute top-1/4 right-0 w-1/3 h-1/2 bg-brand-primary/10 blur-[120px] rounded-full"></div>
    </section>
  );
}
