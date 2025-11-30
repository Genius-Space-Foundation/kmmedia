import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

/**
 * GET /api/user/application-data
 * Fetches user profile data formatted for course application forms
 * Includes all available user information to pre-fill application fields
 */
export async function GET(_request: NextRequest) {
  try {
    console.log("========== APPLICATION DATA API REQUEST ==========");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("Fetching application data for user:", userId);

    // Fetch user with comprehensive profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile: {
          select: {
            phone: true,
            address: true,
            dateOfBirth: true,
            expertise: true,
            experience: true,
            qualifications: true,
            employmentStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Split name into firstName and lastName (if possible)
    const nameParts = user.name?.trim().split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Parse address into components (if available)
    // Assuming address might be in format: "Street, City, Region"
    let address = "";
    let city = "";
    let region = "";

    if (user.profile?.address) {
      const addressParts = user.profile.address.split(",").map((p) => p.trim());
      if (addressParts.length >= 3) {
        address = addressParts[0];
        city = addressParts[1];
        region = addressParts[2];
      } else if (addressParts.length === 2) {
        address = addressParts[0];
        city = addressParts[1];
      } else {
        address = user.profile.address;
      }
    }

    // Map employmentStatus from database enum to form enum
    let mappedEmploymentStatus = "";
    if (user.profile?.employmentStatus) {
      const statusMap: Record<string, string> = {
        STUDENT: "student",
        EMPLOYED: "employed",
        UNEMPLOYED: "unemployed",
        SELF_EMPLOYED: "self-employed",
      };
      mappedEmploymentStatus = statusMap[user.profile.employmentStatus] || "";
    }

    // Format yearsOfExperience
    let yearsOfExperience = "";
    if (
      user.profile?.experience !== null &&
      user.profile?.experience !== undefined
    ) {
      const exp = user.profile.experience;
      if (exp === 0) yearsOfExperience = "0";
      else if (exp >= 1 && exp <= 2) yearsOfExperience = "1-2";
      else if (exp >= 3 && exp <= 5) yearsOfExperience = "3-5";
      else if (exp >= 6 && exp <= 10) yearsOfExperience = "6-10";
      else if (exp > 10) yearsOfExperience = "10+";
    }

    // Format dateOfBirth to YYYY-MM-DD for input[type="date"]
    let formattedDateOfBirth = "";
    if (user.profile?.dateOfBirth) {
      const date = new Date(user.profile.dateOfBirth);
      formattedDateOfBirth = date.toISOString().split("T")[0];
    }

    // Build the response with all available data
    const applicationData = {
      // Personal Information
      firstName,
      lastName,
      email: user.email,
      phone: user.profile?.phone || user.phone || "",
      dateOfBirth: formattedDateOfBirth,
      gender: "", // Not in schema - will be added in future

      // Address Information
      address,
      city,
      region,

      // Educational Background (not in schema - will remain empty)
      educationLevel: "",
      institution: "",
      fieldOfStudy: "",
      graduationYear: "",

      // Professional Experience
      employmentStatus: mappedEmploymentStatus,
      currentPosition: "", // Not in schema
      companyName: "", // Not in schema
      yearsOfExperience,

      // Course-Specific Information (should NOT be pre-filled)
      // motivation: "", // Leave empty - unique per application
      // goals: "", // Leave empty - unique per application
      // priorExperience: "", // Leave empty - unique per application

      // Additional Information (should NOT be pre-filled)
      // hearAboutUs: "",
      // referralSource: "",
      // specialNeeds: "",

      // Metadata
      hasProfile: !!user.profile,
      profileCompleteness: calculateCompleteness({
        firstName,
        lastName,
        email: user.email,
        phone: user.profile?.phone || user.phone,
        dateOfBirth: formattedDateOfBirth,
        address,
        employmentStatus: mappedEmploymentStatus,
      }),
    };

    console.log("✅ Application data fetched successfully");
    console.log(
      "Profile completeness:",
      applicationData.profileCompleteness + "%"
    );

    return NextResponse.json({
      success: true,
      data: applicationData,
    });
  } catch (error) {
    console.error("Application data fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application data" },
      { status: 500 }
    );
  }
}

/**
 * Calculate profile completeness percentage
 */
function calculateCompleteness(data: Record<string, any>): number {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "address",
    "employmentStatus",
  ];

  const completed = fields.filter((field) => {
    const value = data[field];
    return value && value.length > 0;
  }).length;

  return Math.round((completed / fields.length) * 100);
}








