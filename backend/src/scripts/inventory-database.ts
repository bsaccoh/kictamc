import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inventory() {
  console.log('=== KICTAMC DATABASE INVENTORY ===');

  const counts = {
    users: await prisma.user.count(),
    studentProfiles: await prisma.studentProfile.count(),
    academicYears: await prisma.academicYear.count(),
    admissionIntakes: await prisma.admissionIntake.count(),
    faculties: await prisma.faculty.count(),
    departments: await prisma.department.count(),
    courses: await prisma.course.count(),
    courseDocReqs: await prisma.courseDocumentRequirement.count(),
    applications: await prisma.application.count(),
    applicationEducations: await prisma.applicationEducation.count(),
    applicationDocuments: await prisma.applicationDocument.count(),
    applicationStatusHistories: await prisma.applicationStatusHistory.count(),
    payments: await prisma.payment.count(),
    paymentTokens: await prisma.paymentConfirmationToken.count(),
    notifications: await prisma.notification.count(),
    auditLogs: await prisma.auditLog.count(),
    verificationTokens: await prisma.verificationToken.count(),
    newsArticles: await prisma.newsArticle.count(),
    collegeEvents: await prisma.collegeEvent.count(),
    publicEnquiries: await prisma.publicEnquiry.count(),
  };

  console.log('--- TABLE COUNTS ---');
  console.log(JSON.stringify(counts, null, 2));

  console.log('--- USERS INVENTORY ---');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      firstName: true,
      surname: true,
      createdAt: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- APPLICATIONS INVENTORY ---');
  const apps = await prisma.application.findMany({
    select: {
      id: true,
      applicationReference: true,
      applicant: { select: { email: true, firstName: true, surname: true } },
      course: { select: { code: true, name: true } },
      status: true,
      paymentStatus: true,
      createdAt: true,
      _count: {
        select: { documents: true, payments: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(apps, null, 2));

  console.log('--- PAYMENTS INVENTORY ---');
  const payments = await prisma.payment.findMany({
    select: {
      id: true,
      internalReference: true,
      paymentMethod: true,
      expectedAmountMinor: true,
      declaredAmountMinor: true,
      status: true,
      application: {
        select: {
          applicationReference: true,
          applicant: { select: { email: true } },
        },
      },
      verifiedBy: { select: { email: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(payments, null, 2));

  console.log('--- FACULTIES & COURSES INVENTORY ---');
  const faculties = await prisma.faculty.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      _count: { select: { courses: true, departments: true } },
    },
  });
  console.log('Faculties:', JSON.stringify(faculties, null, 2));

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      qualificationLevel: true,
      applicationFeeMinor: true,
      faculty: { select: { code: true } },
    },
  });
  console.log('Courses count:', courses.length);

  await prisma.$disconnect();
}

inventory().catch((err) => {
  console.error('Inventory error:', err);
  process.exit(1);
});
