import { prisma } from '../utils/prisma';

async function main() {
  const users = await prisma.user.count();
  const applications = await prisma.application.count();
  const courses = await prisma.course.count();
  console.log('Users count:', users);
  console.log('Applications count:', applications);
  console.log('Courses count:', courses);
  await prisma.$disconnect();
}
main().catch(console.error);
