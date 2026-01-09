import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegistration from "@/components/PWARegistration";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";
import { NotificationProvider } from "@/components/ui/notification-provider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KM Media Training Institute",
  description:
    "Hybrid training management system for KM Media Training Institute",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KM Media Training Institute",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="KM Media Training Institute"
        />
        <link rel="apple-touch-icon" href="/images/logo.jpeg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AccessibilityProvider>
          <SessionProvider>
            <ThemeProvider>
              <NotificationProvider>
                <PWARegistration />
                {children}
                <Toaster position="top-right" richColors />
              </NotificationProvider>
            </ThemeProvider>
          </SessionProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
