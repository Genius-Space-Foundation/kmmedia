import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllAssignments() {
  console.log('🔍 Searching for ALL Assignments in Database...\n');

  try {
    // Find all assessments of type ASSIGNMENT
    const allAssignments = await prisma.assessment.findMany({
      where: {
        type: 'ASSIGNMENT',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${allAssignments.length} total assignments in database\n`);
    console.log('─'.repeat(80));

    if (allAssignments.length === 0) {
      console.log('❌ No assignments found in the entire database!');
      console.log('   You need to create an assignment first.');
      return;
    }

    allAssignments.forEach((assignment, index) => {
      console.log(`\n${index + 1}. ${assignment.title}`);
      console.log(`   ID: ${assignment.id}`);
      console.log(`   Course: ${assignment.course.title}`);
      console.log(`   Course ID: ${assignment.courseId}`);
      console.log(`   Instructor: ${assignment.course.instructor.name}`);
      console.log(`   Published: ${assignment.isPublished ? '✅ Yes' : '❌ No'}`);
      console.log(`   Due Date: ${assignment.dueDate?.toISOString() || 'Not set'}`);
      console.log(`   Created: ${assignment.createdAt.toISOString()}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n💡 To make an assignment visible to student@test.com:');
    console.log('   1. The assignment must be in course: Advanced Film Direction');
    console.log('      Course ID: cmgzgmryx0006li605lfpt8qc');
    console.log('   2. The assignment must be published (isPublished = true)');
    console.log('   3. The student must have an ACTIVE enrollment (✅ already has this)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAllAssignments()
  .then(() => {
    console.log('\n✅ Search complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
