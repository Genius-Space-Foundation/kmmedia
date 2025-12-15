import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration - Automatically filled from previous diagnosis
const CONFIG = {
  studentEmail: 'student@test.com',
  studentId: 'cmgzgmsnu000eli6041h2nrxb',
  courseId: 'cmgzgmryx0006li605lfpt8qc',  // Advanced Film Direction
  assessmentTitle: '',
};

async function diagnoseAssignmentVisibility() {
  console.log('🔍 Diagnosing Assignment Visibility Issue...\n');
  console.log('Configuration:', CONFIG, '\n');

  try {
    // 1. Find student and their enrollments
    console.log('📋 Step 1: Checking Student Enrollments');
    console.log('─'.repeat(60));
    
    const student = await prisma.user.findFirst({
      where: CONFIG.studentId 
        ? { id: CONFIG.studentId }
        : { email: CONFIG.studentEmail },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      console.log('❌ Student not found!');
      console.log(`   Email: ${CONFIG.studentEmail}`);
      console.log(`   ID: ${CONFIG.studentId}`);
      return;
    }

    console.log(`✅ Student Found: ${student.name} (${student.email})`);
    console.log(`   ID: ${student.id}`);
    console.log(`   Role: ${student.role}`);
    console.log(`\n   Enrollments (${student.enrollments.length}):`);
    
    student.enrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. ${enrollment.course.title}`);
      console.log(`      - Status: ${enrollment.status}`);
      console.log(`      - Course ID: ${enrollment.courseId}`);
      console.log(`      - Progress: ${enrollment.progress}%`);
    });

    const enrolledCourseIds = student.enrollments
      .filter(e => e.status === 'ACTIVE')
      .map(e => e.courseId);

    console.log(`\n   Active Course IDs: ${enrolledCourseIds.join(', ') || 'NONE'}`);

    // 2. Check published assignments
    console.log('\n\n📚 Step 2: Checking Published Assignments');
    console.log('─'.repeat(60));

    const whereClause: any = {
      type: 'ASSIGNMENT',
      isPublished: true,
    };

    if (CONFIG.courseId) {
      whereClause.courseId = CONFIG.courseId;
    } else if (enrolledCourseIds.length > 0) {
      whereClause.courseId = { in: enrolledCourseIds };
    }

    if (CONFIG.assessmentTitle) {
      whereClause.title = { contains: CONFIG.assessmentTitle, mode: 'insensitive' };
    }

    const assignments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        submissions: {
          where: {
            studentId: student.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${assignments.length} published assignments\n`);

    assignments.forEach((assignment, index) => {
      const isEnrolled = enrolledCourseIds.includes(assignment.courseId);
      const hasSubmission = assignment.submissions.length > 0;
      
      console.log(`${index + 1}. ${assignment.title}`);
      console.log(`   - ID: ${assignment.id}`);
      console.log(`   - Course: ${assignment.course.title} (${assignment.courseId})`);
      console.log(`   - Instructor: ${assignment.course.instructor.name}`);
      console.log(`   - Published: ${assignment.isPublished ? '✅ Yes' : '❌ No'}`);
      console.log(`   - Due Date: ${assignment.dueDate?.toISOString() || 'Not set'}`);
      console.log(`   - Student Enrolled: ${isEnrolled ? '✅ Yes' : '❌ No'}`);
      console.log(`   - Has Submission: ${hasSubmission ? '✅ Yes' : '❌ No'}`);
      console.log(`   - SHOULD BE VISIBLE: ${isEnrolled && assignment.isPublished ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });

    // 3. Check ALL assignments (including unpublished) for the course
    if (CONFIG.courseId) {
      console.log('\n\n📝 Step 3: Checking ALL Assignments (including unpublished)');
      console.log('─'.repeat(60));

      const allAssignments = await prisma.assessment.findMany({
        where: {
          type: 'ASSIGNMENT',
          courseId: CONFIG.courseId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`Found ${allAssignments.length} total assignments in course\n`);

      allAssignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.title}`);
        console.log(`   - Published: ${assignment.isPublished ? '✅ Yes' : '❌ No'}`);
        console.log(`   - Created: ${assignment.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // 4. Summary and recommendations
    console.log('\n\n💡 Summary & Recommendations');
    console.log('─'.repeat(60));

    if (enrolledCourseIds.length === 0) {
      console.log('❌ ISSUE: Student has NO active enrollments');
      console.log('   → Enroll the student in a course first');
    } else {
      console.log(`✅ Student has ${enrolledCourseIds.length} active enrollment(s)`);
    }

    const visibleAssignments = assignments.filter(a => 
      enrolledCourseIds.includes(a.courseId) && a.isPublished
    );

    console.log(`\n📊 Assignments that SHOULD be visible: ${visibleAssignments.length}`);
    
    if (visibleAssignments.length === 0 && assignments.length > 0) {
      console.log('\n⚠️  Possible Issues:');
      const unpublished = assignments.filter(a => !a.isPublished);
      const wrongCourse = assignments.filter(a => !enrolledCourseIds.includes(a.courseId));
      
      if (unpublished.length > 0) {
        console.log(`   - ${unpublished.length} assignment(s) not published`);
      }
      if (wrongCourse.length > 0) {
        console.log(`   - ${wrongCourse.length} assignment(s) in courses student is not enrolled in`);
      }
    }

    console.log('\n✅ Diagnosis complete!');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseAssignmentVisibility()
  .then(() => {
    console.log('\n🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
