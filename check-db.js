const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const courseCounts = await prisma.course.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    console.log('Course counts by status:', JSON.stringify(courseCounts, null, 2));

    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        cohort: true
      }
    });
    console.log('All courses:', JSON.stringify(allCourses, null, 2));

    const users = await prisma.user.findMany({
        where: { email: 'student@test.com' },
        select: { id: true, name: true, role: true }
    });
    console.log('Student user:', JSON.stringify(users, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
