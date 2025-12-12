import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding installment payment test data...");

  // 1. Find or create a test student
  let student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
  });

  if (!student) {
    console.log("Creating test student...");
    student = await prisma.user.create({
      data: {
        email: "student@test.com",
        name: "Test Student",
        role: "STUDENT",
        password: "hashed_password", // You should use proper hashing in production
      },
    });
  }
  console.log(`✓ Using student: ${student.email} (${student.id})`);

  // 2. Find or create a course with installment enabled
  let course = await prisma.course.findFirst({
    where: { installmentEnabled: true },
  });

  if (!course) {
    // Find any course to update
    course = await prisma.course.findFirst();
    
    if (!course) {
      console.error("❌ No courses found. Please create a course first.");
      return;
    }

    console.log(`Updating course "${course.title}" with installment settings...`);
    course = await prisma.course.update({
      where: { id: course.id },
      data: {
        installmentEnabled: true,
        installmentPlan: {
          upfront: 40,
          installments: 3,
          schedule: "Monthly",
        },
      },
    });
  }
  console.log(`✓ Using course: ${course.title} (Price: GHS ${course.price})`);

  // 3. Create or find enrollment
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    console.log("Creating enrollment...");
    enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        status: "ACTIVE",
        enrolledAt: new Date(),
        progress: 0,
      },
    });
  }
  console.log(`✓ Enrollment created: ${enrollment.id}`);

  // 4. Create initial installment payment (40% of course price)
  const installmentPlan = course.installmentPlan as any;
  const upfrontPercentage = installmentPlan?.upfront || 40;
  const upfrontAmount = (course.price * upfrontPercentage) / 100;

  const existingPayment = await prisma.payment.findFirst({
    where: {
      userId: student.id,
      enrollmentId: enrollment.id,
      type: "INSTALLMENT",
    },
  });

  if (!existingPayment) {
    console.log(`Creating payment record (${upfrontPercentage}% = GHS ${upfrontAmount})...`);
    await prisma.payment.create({
      data: {
        userId: student.id,
        enrollmentId: enrollment.id,
        type: "INSTALLMENT",
        amount: upfrontAmount,
        status: "COMPLETED",
        method: "PAYSTACK",
        reference: `TEST-INST-${Date.now()}`,
        description: `Initial installment payment (${upfrontPercentage}%)`,
        paidAt: new Date(),
      },
    });
  } else {
    console.log("✓ Payment already exists");
  }

  console.log("\n✅ Test data seeded successfully!");
  console.log("\nExpected Results in Dashboard:");
  console.log(`- Course: ${course.title}`);
  console.log(`- Total Price: GHS ${course.price}`);
  console.log(`- Amount Paid: GHS ${upfrontAmount}`);
  console.log(`- Remaining Balance: GHS ${course.price - upfrontAmount}`);
  console.log(`- Progress: ${upfrontPercentage}%`);
  console.log(`\nLogin as: ${student.email}`);
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
