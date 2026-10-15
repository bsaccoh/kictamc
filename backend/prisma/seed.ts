import { PrismaClient, Role, QualificationLevel, DocumentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function main() {
  console.log('--- Seeding KICTAMC Student Application Portal Database ---');

  // 1. Clean existing records in appropriate order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.paymentConfirmationToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.applicationDocument.deleteMany();
  await prisma.applicationEducation.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.courseDocumentRequirement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.admissionIntake.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.department.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminPasswordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMeInDev2026!');
  const admissionsPasswordHash = await hashPassword(process.env.SEED_ADMISSIONS_PASSWORD || 'ChangeMeInDev2026!');
  const financePasswordHash = await hashPassword(process.env.SEED_FINANCE_PASSWORD || 'ChangeMeInDev2026!');
  const applicantPasswordHash = await hashPassword(process.env.SEED_APPLICANT_PASSWORD || 'ChangeMeInDev2026!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kictamc.edu.sl',
      phone: '+23276100001',
      passwordHash: adminPasswordHash,
      firstName: 'Alhaji',
      middleName: 'M.',
      surname: 'Kamara',
      role: Role.SYSTEM_ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const admissionsOfficer = await prisma.user.create({
    data: {
      email: 'admissions@kictamc.edu.sl',
      phone: '+23276100002',
      passwordHash: admissionsPasswordHash,
      firstName: 'Fatmata',
      middleName: 'B.',
      surname: 'Sesay',
      role: Role.ADMISSIONS_OFFICER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const financeOfficer = await prisma.user.create({
    data: {
      email: 'finance@kictamc.edu.sl',
      phone: '+23276100003',
      passwordHash: financePasswordHash,
      firstName: 'Mohamed',
      middleName: 'S.',
      surname: 'Koroma',
      role: Role.FINANCE_OFFICER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const sampleApplicant = await prisma.user.create({
    data: {
      email: 'applicant@kictamc.edu.sl',
      phone: '+23278200001',
      passwordHash: applicantPasswordHash,
      firstName: 'Mariama',
      middleName: 'Kallon',
      surname: 'Bangura',
      role: Role.APPLICANT,
      isEmailVerified: true,
      isPhoneVerified: true,
      studentProfile: {
        create: {
          dateOfBirth: new Date('2005-04-15'),
          gender: 'Female',
          nationality: 'Sierra Leonean',
          placeOfBirth: 'Kenema City',
          maritalStatus: 'Single',
          residentialAddress: '14 Hangha Road',
          townCity: 'Kenema',
          chiefdom: 'Nongowa',
          district: 'Kenema',
          regionProvince: 'Eastern Province',
          postalAddress: 'P.O. Box 42, Kenema',
          parentFullName: 'Pa Brima Bangura',
          parentRelationship: 'Father',
          parentPhone: '+23278300002',
          parentAddress: '14 Hangha Road, Kenema',
          parentOccupation: 'Civil Servant',
          emergencyFullName: 'Pa Brima Bangura',
          emergencyRelationship: 'Father',
          emergencyPhone: '+23278300002',
        },
      },
    },
  });

  console.log('✓ Users created: Admin, Admissions, Finance, Applicant');

  // 3. Seed Academic Year & Intakes
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2026/2027 Academic Year',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-08-31'),
      isActive: true,
      intakes: {
        create: [
          {
            name: 'September 2026 Regular Intake',
            startDate: new Date('2026-09-01'),
            endDate: new Date('2026-12-20'),
            applicationDeadline: new Date('2026-11-30'),
            isActive: true,
          },
          {
            name: 'January 2027 Modular Intake',
            startDate: new Date('2027-01-10'),
            endDate: new Date('2027-05-15'),
            applicationDeadline: new Date('2027-02-15'),
            isActive: true,
          },
        ],
      },
    },
    include: { intakes: true },
  });

  console.log('✓ Academic Year and Intakes seeded');

  // 4. Seed Departments
  const deptICT = await prisma.department.create({
    data: {
      name: 'Faculty of Information & Communication Technology',
      code: 'FICT',
      description: 'Computing, Software Engineering, Networks and IT Management programmes.',
      isActive: true,
    },
  });

  const deptManagement = await prisma.department.create({
    data: {
      name: 'Faculty of Management & Business Studies',
      code: 'FMBS',
      description: 'Business Administration, Human Resources, and Entrepreneurship.',
      isActive: true,
    },
  });

  const deptAccounting = await prisma.department.create({
    data: {
      name: 'Faculty of Accounting & Financial Studies',
      code: 'FAFS',
      description: 'Professional Accounting, Banking, and Financial Economics.',
      isActive: true,
    },
  });

  console.log('✓ Departments created');

  // 5. Seed Courses across 3 Qualification Levels
  const standardRequirements = [
    { type: DocumentType.EXAM_RESULT, name: 'WASSCE / GCE Result Slip or Certificate', mandatory: true },
    { type: DocumentType.TESTIMONIAL, name: 'Secondary School Testimonial', mandatory: true },
    { type: DocumentType.BIRTH_CERTIFICATE, name: 'Birth Certificate', mandatory: true },
    { type: DocumentType.PASSPORT_PHOTO, name: 'Recent Passport-size Photograph', mandatory: true },
    { type: DocumentType.ID_DOCUMENT, name: 'National ID / Voter Card / Passport', mandatory: false },
  ];

  const coursesData = [
    // Lower Diploma
    {
      departmentId: deptICT.id,
      academicYearId: academicYear.id,
      name: 'Lower Diploma in Information Technology',
      code: 'DIT-L10',
      qualificationLevel: QualificationLevel.LOWER_DIPLOMA,
      description: 'Foundational computer hardware, software office productivity, and beginner web skills.',
      admissionRequirements: 'Minimum of 3 WASSCE/GCE O-Level passes including English or Mathematics.',
      applicationFeeMinor: 20000, // 200 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Evening',
    },
    {
      departmentId: deptManagement.id,
      academicYearId: academicYear.id,
      name: 'Lower Diploma in Business Administration',
      code: 'DBA-L10',
      qualificationLevel: QualificationLevel.LOWER_DIPLOMA,
      description: 'Practical business administration, office communication, and clerical management.',
      admissionRequirements: 'Minimum of 3 WASSCE/GCE O-Level passes.',
      applicationFeeMinor: 20000, // 200 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Evening',
    },
    // Higher Diploma
    {
      departmentId: deptICT.id,
      academicYearId: academicYear.id,
      name: 'Higher National Diploma in Computer Science & Networking',
      code: 'HND-CS20',
      qualificationLevel: QualificationLevel.HIGHER_DIPLOMA,
      description: 'Advanced networking, database administration, and web applications development.',
      admissionRequirements: 'Minimum 4 WASSCE credits or recognized Lower Diploma in relevant discipline.',
      applicationFeeMinor: 25000, // 250 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Evening,Weekend',
    },
    {
      departmentId: deptAccounting.id,
      academicYearId: academicYear.id,
      name: 'Higher National Diploma in Accounting & Finance',
      code: 'HND-AF20',
      qualificationLevel: QualificationLevel.HIGHER_DIPLOMA,
      description: 'Financial accounting, auditing, public sector finance, and taxation.',
      admissionRequirements: 'Minimum 4 WASSCE credits including Mathematics or Lower Diploma in Accounting.',
      applicationFeeMinor: 25000, // 250 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Evening',
    },
    // Degree
    {
      departmentId: deptICT.id,
      academicYearId: academicYear.id,
      name: 'BSc in Information Technology & Systems',
      code: 'BIT-301',
      qualificationLevel: QualificationLevel.DEGREE,
      description: 'Comprehensive 4-year degree covering software engineering, cloud computing, cybersecurity and IT management.',
      admissionRequirements: '5 WASSCE credits in one sitting or 6 credits in two sittings, including English Language and Mathematics.',
      applicationFeeMinor: 30000, // 300 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Weekend',
    },
    {
      departmentId: deptManagement.id,
      academicYearId: academicYear.id,
      name: 'BSc in Business Administration & Management',
      code: 'BBA-301',
      qualificationLevel: QualificationLevel.DEGREE,
      description: 'Degree focusing on organizational management, corporate strategy, marketing and entrepreneurship.',
      admissionRequirements: '5 WASSCE credits including English Language and Mathematics or economics.',
      applicationFeeMinor: 30000, // 300 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Weekend',
    },
    {
      departmentId: deptManagement.id,
      academicYearId: academicYear.id,
      name: 'BSc in Procurement & Supply Chain Management',
      code: 'BPS-301',
      qualificationLevel: QualificationLevel.DEGREE,
      description: 'Strategic procurement, contract administration, inventory management, and logistics.',
      admissionRequirements: '5 WASSCE credits including English Language and Mathematics.',
      applicationFeeMinor: 30000, // 300 SLE
      currency: 'SLE',
      studyModes: 'Full-Time,Weekend',
    },
  ];

  for (const c of coursesData) {
    const createdCourse = await prisma.course.create({
      data: c,
    });

    for (const req of standardRequirements) {
      await prisma.courseDocumentRequirement.create({
        data: {
          courseId: createdCourse.id,
          documentType: req.type,
          name: req.name,
          isMandatory: req.mandatory,
        },
      });
    }
  }

  console.log(`✓ Created ${coursesData.length} courses with document requirements`);

  // 6. Record audit log for database seed
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userEmail: admin.email,
      action: 'SYSTEM_SEED',
      resource: 'Database',
      details: {
        note: 'Initial setup of KICTAMC portal with departments, academic years, courses, and default administrative accounts.',
      },
    },
  });

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
