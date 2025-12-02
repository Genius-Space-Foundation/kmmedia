import { prisma } from "../src/lib/db";

async function findUsers() {
  try {
    const instructor = await prisma.user.findFirst({
      where: { role: "INSTRUCTOR" },
    });
    
    if (instructor) {
      console.log("Found instructor:", instructor.id);
    } else {
      console.log("No instructor found. Creating one...");
      const newInstructor = await prisma.user.create({
        data: {
          email: "test-instructor@example.com",
          name: "Test Instructor",
          role: "INSTRUCTOR",
          status: "ACTIVE",
        }
      });
      console.log("Created instructor:", newInstructor.id);
    }

    const student = await prisma.user.findFirst({
      where: { role: "STUDENT" },
    });

    if (student) {
      console.log("Found student:", student.id);
    } else {
      console.log("No student found. Creating one...");
      const newStudent = await prisma.user.create({
        data: {
          email: "test-student@example.com",
          name: "Test Student",
          role: "STUDENT",
          status: "ACTIVE",
        }
      });
      console.log("Created student:", newStudent.id);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findUsers();
