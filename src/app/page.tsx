import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedCourses from "@/components/homepage/FeaturedCourses";
import WhyChooseUs from "@/components/homepage/WhyChooseUs";
import Statistics from "@/components/homepage/Statistics";
import CallToAction from "@/components/homepage/CallToAction";
import Footer from "@/components/layout/Footer";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token");

  if (!token) return null;

  try {
    // In a real app, we would validate the token here
    // For now, we'll just return a mock user if the token exists
    // or fetch from an internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      headers: {
        Cookie: `auth_token=${token.value}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-white">
      <EnhancedNavigation user={user} />
      
      <main>
        <HeroSection />
        <FeaturedCourses />
        <WhyChooseUs />
        <Statistics />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
