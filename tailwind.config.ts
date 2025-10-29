import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "Roboto", "Arial", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
      },
      colors: {
        // Brand Colors - New Design System
        "brand-primary": "rgb(var(--brand-primary))",
        "brand-primary-light": "rgb(var(--brand-primary-light))",
        "brand-primary-dark": "rgb(var(--brand-primary-dark))",

        "brand-accent": "rgb(var(--brand-accent))",
        "brand-accent-light": "rgb(var(--brand-accent-light))",
        "brand-accent-dark": "rgb(var(--brand-accent-dark))",

        "brand-background": "rgb(var(--brand-background))",
        "brand-surface": "rgb(var(--brand-surface))",
        "brand-border": "rgb(var(--brand-border))",
        "brand-text-primary": "rgb(var(--brand-text-primary))",
        "brand-text-secondary": "rgb(var(--brand-text-secondary))",
        "brand-text-disabled": "rgb(var(--brand-text-disabled))",

        // Neutral Colors
        "brand-neutral-50": "rgb(var(--brand-neutral-50))",
        "brand-neutral-100": "rgb(var(--brand-neutral-100))",
        "brand-neutral-200": "rgb(var(--brand-neutral-200))",
        "brand-neutral-300": "rgb(var(--brand-neutral-300))",
        "brand-neutral-400": "rgb(var(--brand-neutral-400))",
        "brand-neutral-500": "rgb(var(--brand-neutral-500))",
        "brand-neutral-600": "rgb(var(--brand-neutral-600))",
        "brand-neutral-700": "rgb(var(--brand-neutral-700))",
        "brand-neutral-800": "rgb(var(--brand-neutral-800))",
        "brand-neutral-900": "rgb(var(--brand-neutral-900))",

        // Status Colors
        "brand-success": "rgb(var(--brand-success))",
        "brand-warning": "rgb(var(--brand-warning))",
        "brand-error": "rgb(var(--brand-error))",
        "brand-info": "rgb(var(--brand-info))",

        // Text Colors
        "brand-text-primary": "rgb(var(--brand-text-primary))",
        "brand-text-secondary": "rgb(var(--brand-text-secondary))",
        "brand-text-tertiary": "rgb(var(--brand-text-tertiary))",
        "brand-text-muted": "rgb(var(--brand-text-muted))",

        // Border Colors
        "brand-border": "rgb(var(--brand-border))",
        "brand-border-light": "rgb(var(--brand-border-light))",
        "brand-border-dark": "rgb(var(--brand-border-dark))",

        // Background Colors
        "brand-background": "rgb(var(--brand-background))",
        "brand-surface": "rgb(var(--brand-surface))",
        "brand-surface-secondary": "rgb(var(--brand-surface-secondary))",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(var(--brand-primary)) 0%, rgb(var(--brand-secondary)) 100%)",
        "brand-gradient-hero":
          "linear-gradient(135deg, rgb(var(--brand-primary)) 0%, rgb(var(--brand-secondary)) 50%, rgb(var(--brand-tertiary)) 100%)",
        "brand-gradient-primary":
          "linear-gradient(135deg, rgb(var(--brand-primary)) 0%, rgb(var(--brand-primary-light)) 100%)",
        "brand-gradient-secondary":
          "linear-gradient(135deg, rgb(var(--brand-secondary)) 0%, rgb(var(--brand-secondary-light)) 100%)",
        "brand-gradient-accent":
          "linear-gradient(135deg, rgb(var(--brand-accent)) 0%, rgb(var(--brand-accent-light)) 100%)",
        "brand-gradient-tertiary":
          "linear-gradient(135deg, rgb(var(--brand-tertiary)) 0%, rgb(var(--brand-tertiary-light)) 100%)",
      },
      textColor: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(var(--brand-primary)) 0%, rgb(var(--brand-secondary)) 100%)",
        "brand-gradient-hero":
          "linear-gradient(135deg, rgb(var(--brand-primary)) 0%, rgb(var(--brand-secondary)) 50%, rgb(var(--brand-tertiary)) 100%)",
      },
      boxShadow: {
        "brand-sm": "0 1px 2px 0 rgb(var(--brand-shadow-sm))",
        "brand-md": "0 4px 6px -1px rgb(var(--brand-shadow-md))",
        "brand-lg": "0 10px 15px -3px rgb(var(--brand-shadow-lg))",
        "brand-xl": "0 20px 25px -5px rgb(var(--brand-shadow-xl))",
        "brand-2xl": "0 25px 50px -12px rgb(var(--brand-shadow-xl))",
        "brand-3xl": "0 35px 60px -12px rgb(var(--brand-shadow-xl))",
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "text-glow": "textGlow 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(var(--brand-primary), 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(var(--brand-primary), 0.6)" },
        },
        textGlow: {
          "0%, 100%": { textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" },
          "50%": { textShadow: "0 0 20px rgba(255, 255, 255, 0.6)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
