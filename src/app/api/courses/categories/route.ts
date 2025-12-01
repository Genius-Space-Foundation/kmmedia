import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // Get course categories with counts
    const coursesWithCategories = await prisma.course.groupBy({
      by: ["category"],
      where: {
        status: "PUBLISHED",
      },
      _count: {
        category: true,
      },
    });

    // Define category metadata
    const categoryMetadata: Record<
      string,
      { icon: string; description: string }
    > = {
      "Film & Television": {
        icon: "🎬",
        description: "Production & Direction",
      },
      "Animation & VFX": { icon: "🎨", description: "Digital Arts & Effects" },
      Photography: { icon: "📸", description: "Visual Storytelling" },
      Marketing: { icon: "📈", description: "Digital & Brand Marketing" },
      Production: { icon: "🎥", description: "Media Production" },
      Journalism: { icon: "📰", description: "News & Reporting" },
      Design: { icon: "🎨", description: "Graphic & UI Design" },
      Audio: { icon: "🎵", description: "Sound & Music Production" },
    };

    const categories = coursesWithCategories.map((item) => ({
      name: item.category,
      slug: item.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/&/g, "and"),
      icon: categoryMetadata[item.category]?.icon || "📚",
      courseCount: item._count.category,
      description:
        categoryMetadata[item.category]?.description || "Professional Training",
    }));

    // Sort by course count (most popular first)
    categories.sort((a, b) => b.courseCount - a.courseCount);

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching course categories:", error);

    // Return fallback categories
    return NextResponse.json({
      success: true,
      categories: [
        {
          name: "Film & Television",
          slug: "film-television",
          icon: "🎬",
          courseCount: 12,
          description: "Production & Direction",
        },
        {
          name: "Animation & VFX",
          slug: "animation-vfx",
          icon: "🎨",
          courseCount: 8,
          description: "Digital Arts & Effects",
        },
        {
          name: "Photography",
          slug: "photography",
          icon: "📸",
          courseCount: 10,
          description: "Visual Storytelling",
        },
        {
          name: "Marketing",
          slug: "marketing",
          icon: "📈",
          courseCount: 6,
          description: "Digital & Brand Marketing",
        },
        {
          name: "Production",
          slug: "production",
          icon: "🎥",
          courseCount: 9,
          description: "Media Production",
        },
        {
          name: "Journalism",
          slug: "journalism",
          icon: "📰",
          courseCount: 5,
          description: "News & Reporting",
        },
      ],
    });
  }
}
