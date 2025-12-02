import { prisma } from "../src/lib/db";
import { getTemplates, createTemplate } from "../src/app/api/instructor/courses/templates/route";
import { getStudentProgress } from "../src/app/api/instructor/students/[id]/progress/route";
import { NextRequest } from "next/server";

// Mock AuthenticatedRequest
function createMockRequest(userId: string, body?: any) {
  const req = new NextRequest("http://localhost:3000/api/test", {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
  });
  (req as any).user = { userId, role: "INSTRUCTOR" };
  return req;
}

async function verify() {
  try {
    // 1. Find Instructor
    let instructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
    if (!instructor) {
        console.log("Creating test instructor...");
        instructor = await prisma.user.create({
            data: {
                email: "verify-instructor@example.com",
                name: "Verify Instructor",
                role: "INSTRUCTOR",
                status: "ACTIVE"
            }
        });
    }
    console.log("Using instructor:", instructor.id);

    // 2. Verify Templates API
    console.log("\n--- Verifying Templates API ---");
    
    // Create Template
    const newTemplateReq = createMockRequest(instructor.id, {
      title: "Test Template " + Date.now(),
      category: "Development",
      duration: 4,
      difficulty: "BEGINNER",
      modules: [],
      isPublic: false
    });
    const createRes = await createTemplate(newTemplateReq);
    const createData = await createRes.json();
    console.log("Create Template Response:", createData.success ? "SUCCESS" : "FAILED", createData.message || "");

    // Get Templates
    const getTemplatesReq = createMockRequest(instructor.id);
    const getRes = await getTemplates(getTemplatesReq);
    const getData = await getRes.json();
    console.log("Get Templates Response:", getData.success ? "SUCCESS" : "FAILED", `Found ${getData.data?.length} templates`);

    // 3. Verify Student Progress API
    console.log("\n--- Verifying Student Progress API ---");
    let student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
    if (!student) {
        console.log("Creating test student...");
        student = await prisma.user.create({
            data: {
                email: "verify-student@example.com",
                name: "Verify Student",
                role: "STUDENT",
                status: "ACTIVE"
            }
        });
    }

    if (student) {
      console.log("Using student:", student.id);
      const progressReq = createMockRequest(instructor.id);
      // Need to pass params manually as the second arg to the handler
      const progressRes = await getStudentProgress(progressReq, { params: { id: student.id } });
      const progressData = await progressRes.json();
      console.log("Get Progress Response:", progressData.success ? "SUCCESS" : "FAILED");
      if (progressData.success) {
        console.log("Student Stats:", progressData.data.stats);
      } else {
        console.log("Error:", progressData.message);
      }
    } else {
      console.log("No student found, skipping progress verification");
    }

  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
