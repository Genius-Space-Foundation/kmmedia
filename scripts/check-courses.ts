import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      featured: true,
      instructor: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  console.log('Courses in database:');
  console.log(JSON.stringify(courses, null, 2));

  const total = await prisma.course.count();
  console.log('Total courses:', total);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
