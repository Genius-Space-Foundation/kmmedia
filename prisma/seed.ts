import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kmmedia.com" },
    update: {},
    create: {
      email: "admin@kmmedia.com",
      password: adminPassword,
      name: "KM Media Admin",
      phone: "+1234567890",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Create Instructors
  const instructor1Password = await bcrypt.hash("instructor123", 12);
  const instructor1 = await prisma.user.upsert({
    where: { email: "john.film@kmmedia.com" },
    update: {},
    create: {
      email: "john.film@kmmedia.com",
      password: instructor1Password,
      name: "John Film Director",
      phone: "+1234567891",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      profile: {
        create: {
          bio: "Award-winning film director with 15 years of experience in the industry.",
          expertise: ["Film Direction", "Cinematography", "Screenwriting"],
          experience: 15,
          qualifications: "MFA in Film Directing",
        },
      },
    },
  });

  const instructor2Password = await bcrypt.hash("instructor123", 12);
  const instructor2 = await prisma.user.upsert({
    where: { email: "sarah.animation@kmmedia.com" },
    update: {},
    create: {
      email: "sarah.animation@kmmedia.com",
      password: instructor2Password,
      name: "Sarah Animation Expert",
      phone: "+1234567892",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      profile: {
        create: {
          bio: "Lead animator at major studio with expertise in 3D animation and VFX.",
          expertise: ["3D Animation", "VFX", "Character Design"],
          experience: 10,
          qualifications: "BFA in Animation",
        },
      },
    },
  });

  // Create Sample Courses
  const filmCourse = await prisma.course.create({
    data: {
      title: "Advanced Film Direction",
      description:
        "Master the art of film direction with hands-on projects and industry insights.",
      category: "Film & Television",
      duration: 12,
      price: 2500,
      mode: ["ONLINE", "OFFLINE"],
      status: "PUBLISHED",
      applicationFee: 50,
      installmentEnabled: true,
      installmentPlan: { upfront: 40, midCourse: 30, completion: 30 },
      prerequisites: ["Basic photography knowledge", "Storytelling skills"],
      learningObjectives: [
        "Master shot composition",
        "Learn directing techniques",
        "Understand post-production workflow",
      ],
      certificateAwarded: true,
      instructorId: instructor1.id,
      approvedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  const animationCourse = await prisma.course.create({
    data: {
      title: "3D Animation Mastery",
      description:
        "Comprehensive course covering 3D animation from basics to advanced techniques.",
      category: "Animation & VFX",
      duration: 16,
      price: 3000,
      mode: ["ONLINE"],
      status: "PUBLISHED",
      applicationFee: 50,
      installmentEnabled: true,
      installmentPlan: { upfront: 50, midCourse: 25, completion: 25 },
      prerequisites: ["Basic computer skills", "Art background preferred"],
      learningObjectives: [
        "Master 3D modeling",
        "Learn animation principles",
        "Understand lighting and rendering",
      ],
      certificateAwarded: true,
      instructorId: instructor2.id,
      approvedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  const photographyCourse = await prisma.course.create({
    data: {
      title: "Professional Photography",
      description: "From beginner to professional photographer in 8 weeks.",
      category: "Photography",
      duration: 8,
      price: 1200,
      mode: ["HYBRID"],
      status: "PENDING_APPROVAL",
      applicationFee: 25,
      installmentEnabled: false,
      prerequisites: ["Camera equipment"],
      learningObjectives: [
        "Master camera settings",
        "Learn composition techniques",
        "Understand photo editing",
      ],
      certificateAwarded: true,
      instructorId: instructor1.id,
    },
  });

  // Create Sample Lessons
  await prisma.lesson.createMany({
    data: [
      {
        title: "Introduction to Film Direction",
        content: "Overview of film direction principles and techniques...",
        order: 1,
        type: "VIDEO",
        duration: 90,
        courseId: filmCourse.id,
      },
      {
        title: "Shot Composition Basics",
        content: "Learn how to compose compelling shots...",
        order: 2,
        type: "VIDEO",
        duration: 120,
        courseId: filmCourse.id,
      },
      {
        title: "Introduction to 3D Animation",
        content: "Basics of 3D animation software and tools...",
        order: 1,
        type: "VIDEO",
        duration: 60,
        courseId: animationCourse.id,
      },
    ],
  });

  // Create Test Student
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      password: studentPassword,
      name: "Test Student",
      phone: "+1234567893",
      role: "STUDENT",
      status: "ACTIVE",
      profile: {
        create: {
          bio: "Aspiring media professional eager to learn",
          expertise: ["Photography", "Video Editing"],
          experience: 1,
          qualifications: "High School Diploma",
        },
      },
    },
  });

  // Create Learning Profile for Student
  await prisma.learningProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      interests: ["Photography", "Video Production", "Digital Marketing"],
      skillLevel: "beginner",
      learningStyle: "visual",
      goals: [
        "Learn professional photography",
        "Master video editing",
        "Build a portfolio",
      ],
      timeCommitment: 10,
      experience: "Some basic photography experience",
      careerGoals: "Become a professional photographer and videographer",
      onboardingCompleted: false,
    },
  });

  // Create System Configuration
  await prisma.systemConfig.upsert({
    where: { key: "payment_settings" },
    update: {
      value: {
        currency: "USD",
        applicationFee: 50,
        gracePeriod: 7, // days
        lateFeePercentage: 5,
      },
      description: "Global payment settings",
      updatedBy: admin.id,
    },
    create: {
      key: "payment_settings",
      value: {
        currency: "USD",
        applicationFee: 50,
        gracePeriod: 7, // days
        lateFeePercentage: 5,
      },
      description: "Global payment settings",
      updatedBy: admin.id,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: "notification_settings" },
    update: {
      value: {
        emailNotifications: true,
        smsNotifications: false,
        paymentReminders: true,
        courseUpdates: true,
      },
      description: "Notification preferences",
      updatedBy: admin.id,
    },
    create: {
      key: "notification_settings",
      value: {
        emailNotifications: true,
        smsNotifications: false,
        paymentReminders: true,
        courseUpdates: true,
      },
      description: "Notification preferences",
      updatedBy: admin.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin credentials: admin@kmmedia.com / admin123");
  console.log("Student credentials: student@test.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
