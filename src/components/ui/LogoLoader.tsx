import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  className?: string;
}

export default function LogoLoader({
  size = "md",
  text = "Loading...",
  subtext,
  className,
}: LogoLoaderProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative">
        <div className={cn("relative z-10 rounded-full overflow-hidden shadow-xl animate-pulse", sizeClasses[size])}>
          <Image
            src="/images/logo.jpeg"
            alt="KM Media Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Decorative rings */}
        <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl animate-pulse delay-75"></div>
        <div className={cn("absolute -inset-4 border-2 border-blue-500/30 rounded-full animate-spin-slow", {
             "border-t-blue-600": true
        })}></div>
      </div>

      {(text || subtext) && (
        <div className="mt-8 text-center space-y-2 animate-fade-in-up">
          {text && (
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              {text}
            </h3>
          )}
          {subtext && (
            <p className="text-sm text-gray-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
