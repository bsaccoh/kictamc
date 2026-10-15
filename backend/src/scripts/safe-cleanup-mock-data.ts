import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function safeCleanup() {
  console.log('=== KICTAMC CONTROLLED MOCK DATA CLEANUP ===');
  console.log('Starting dependency-safe cleanup of confirmed disposable test records...\n');

  // 1. Identify target users
  const disposableUsers = await prisma.user.findMany({
    where: {
      email: { startsWith: 'student_' },
    },
    select: { id: true, email: true },
  });
  const disposableUserIds = disposableUsers.map((u) => u.id);
  console.log(`Identified ${disposableUsers.length} synthetic test applicant accounts:`);
  disposableUsers.forEach((u) => console.log(` - ${u.email} (${u.id})`));

  // 2. Identify target applications
  // Target: applications by disposable users OR references with SIM-, ADM-, REJ- test prefixes
  const disposableApps = await prisma.application.findMany({
    where: {
      OR: [
        { applicantId: { in: disposableUserIds } },
        { applicationReference: { startsWith: 'KICTAMC-SIM-' } },
        { applicationReference: { startsWith: 'KICTAMC-ADM-' } },
        { applicationReference: { startsWith: 'KICTAMC-REJ-' } },
      ],
    },
    select: { id: true, applicationReference: true, applicantId: true },
  });
  const disposableAppIds = disposableApps.map((a) => a.id);
  console.log(`\nIdentified ${disposableApps.length} disposable simulation/test applications:`);
  disposableApps.forEach((a) => console.log(` - ${a.applicationReference} (${a.id})`));

  // 3. Identify target payments & tokens
  const disposablePayments = await prisma.payment.findMany({
    where: {
      OR: [
        { applicationId: { in: disposableAppIds } },
        { internalReference: { startsWith: 'PAYREF-REJ-' } },
      ],
    },
    select: { id: true, internalReference: true, receiptDocumentPath: true },
  });
  const disposablePaymentIds = disposablePayments.map((p) => p.id);
  console.log(`\nIdentified ${disposablePayments.length} disposable test payments.`);

  // 4. Identify documents and their storage files
  const disposableDocs = await prisma.applicationDocument.findMany({
    where: { applicationId: { in: disposableAppIds } },
    select: { id: true, storagePath: true },
  });
  console.log(`Identified ${disposableDocs.length} disposable application documents.`);

  // 5. Execute transaction in strict foreign-key order
  console.log('\nExecuting transactional deletion...');
  const result = await prisma.$transaction(async (tx) => {
    // a. Payment confirmation tokens
    const deletedTokens = await tx.paymentConfirmationToken.deleteMany({
      where: {
        OR: [
          { applicationId: { in: disposableAppIds } },
          { paymentId: { in: disposablePaymentIds } },
        ],
      },
    });

    // b. Payments
    const deletedPayments = await tx.payment.deleteMany({
      where: { id: { in: disposablePaymentIds } },
    });

    // c. Documents
    const deletedDocs = await tx.applicationDocument.deleteMany({
      where: { applicationId: { in: disposableAppIds } },
    });

    // d. Educations
    const deletedEducations = await tx.applicationEducation.deleteMany({
      where: { applicationId: { in: disposableAppIds } },
    });

    // e. Status histories
    const deletedHistories = await tx.applicationStatusHistory.deleteMany({
      where: { applicationId: { in: disposableAppIds } },
    });

    // f. Applications
    const deletedApps = await tx.application.deleteMany({
      where: { id: { in: disposableAppIds } },
    });

    // g. Notifications for disposable users
    const deletedNotifications = await tx.notification.deleteMany({
      where: { userId: { in: disposableUserIds } },
    });

    // h. Verification tokens for disposable users
    const deletedVerificationTokens = await tx.verificationToken.deleteMany({
      where: { userId: { in: disposableUserIds } },
    });

    // i. Student profiles for disposable users
    const deletedProfiles = await tx.studentProfile.deleteMany({
      where: { userId: { in: disposableUserIds } },
    });

    // j. Audit logs for disposable users & deleted applications
    const deletedAuditLogs = await tx.auditLog.deleteMany({
      where: {
        OR: [
          { userId: { in: disposableUserIds } },
          { resourceId: { in: disposableAppIds } },
          { resourceId: { in: disposablePaymentIds } },
        ],
      },
    });

    // k. Users
    const deletedUsers = await tx.user.deleteMany({
      where: { id: { in: disposableUserIds } },
    });

    return {
      tokens: deletedTokens.count,
      payments: deletedPayments.count,
      docs: deletedDocs.count,
      educations: deletedEducations.count,
      histories: deletedHistories.count,
      apps: deletedApps.count,
      notifications: deletedNotifications.count,
      verificationTokens: deletedVerificationTokens.count,
      profiles: deletedProfiles.count,
      auditLogs: deletedAuditLogs.count,
      users: deletedUsers.count,
    };
  });

  console.log('\n--- TRANSACTION COMPLETE ---');
  console.log('Deleted records count:', JSON.stringify(result, null, 2));

  // 6. Clean up physical disposable files
  console.log('\nCleaning up physical files corresponding to deleted records...');
  let filesCleaned = 0;
  for (const doc of disposableDocs) {
    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      try {
        fs.unlinkSync(doc.storagePath);
        filesCleaned++;
      } catch (e) {
        console.warn(`Could not delete file ${doc.storagePath}:`, e);
      }
    }
  }
  for (const pay of disposablePayments) {
    if (pay.receiptDocumentPath && fs.existsSync(pay.receiptDocumentPath)) {
      try {
        fs.unlinkSync(pay.receiptDocumentPath);
        filesCleaned++;
      } catch (e) {
        console.warn(`Could not delete receipt ${pay.receiptDocumentPath}:`, e);
      }
    }
  }
  console.log(`Cleaned up ${filesCleaned} physical test files.`);

  // 7. Verify remaining database records
  console.log('\n--- VERIFYING POST-CLEANUP RECORD COUNTS ---');
  const postCounts = {
    users: await prisma.user.count(),
    studentProfiles: await prisma.studentProfile.count(),
    academicYears: await prisma.academicYear.count(),
    admissionIntakes: await prisma.admissionIntake.count(),
    faculties: await prisma.faculty.count(),
    departments: await prisma.department.count(),
    courses: await prisma.course.count(),
    courseDocReqs: await prisma.courseDocumentRequirement.count(),
    applications: await prisma.application.count(),
    payments: await prisma.payment.count(),
    paymentTokens: await prisma.paymentConfirmationToken.count(),
    newsArticles: await prisma.newsArticle.count(),
    collegeEvents: await prisma.collegeEvent.count(),
    publicEnquiries: await prisma.publicEnquiry.count(),
  };
  console.log(JSON.stringify(postCounts, null, 2));

  const remainingUsers = await prisma.user.findMany({
    select: { email: true, role: true, firstName: true, surname: true },
  });
  console.log('\nRemaining Users (Verified Safe):');
  remainingUsers.forEach((u) => console.log(` - [${u.role}] ${u.email} (${u.firstName} ${u.surname})`));

  await prisma.$disconnect();
}

safeCleanup().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
