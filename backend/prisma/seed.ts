import { PrismaClient, Role, QualificationLevel, DocumentType, ApplicationStatus, PaymentStatus } from '@prisma/client';
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
  const defaultPasswordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMeInDev2026!');

  // 2a. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@kictamc.edu.sl',
      phone: '+23276100001',
      passwordHash: defaultPasswordHash,
      firstName: 'Alhaji',
      middleName: 'M.',
      surname: 'Kamara',
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2b. College Admin (Operational Admin)
  const collegeAdmin = await prisma.user.create({
    data: {
      email: 'admin.staff@kictamc.edu.sl',
      phone: '+23276100010',
      passwordHash: defaultPasswordHash,
      firstName: 'Ibrahim',
      middleName: 'K.',
      surname: 'Conteh',
      role: Role.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2c. Compliance Officer (View and Logs only)
  const complianceOfficer = await prisma.user.create({
    data: {
      email: 'compliance@kictamc.edu.sl',
      phone: '+23276100011',
      passwordHash: defaultPasswordHash,
      firstName: 'Hawa',
      middleName: 'T.',
      surname: 'Bangura',
      role: Role.COMPLIANCE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2d. Lecturer (Academic Staff)
  const lecturer = await prisma.user.create({
    data: {
      email: 'lecturer@kictamc.edu.sl',
      phone: '+23276100012',
      passwordHash: defaultPasswordHash,
      firstName: 'Dr. Joseph',
      middleName: 'B.',
      surname: 'Tarawally',
      role: Role.LECTURER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2e. Admissions Officer
  const admissionsOfficer = await prisma.user.create({
    data: {
      email: 'admissions@kictamc.edu.sl',
      phone: '+23276100002',
      passwordHash: defaultPasswordHash,
      firstName: 'Fatmata',
      middleName: 'B.',
      surname: 'Sesay',
      role: Role.ADMISSIONS_OFFICER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2f. Finance Officer
  const financeOfficer = await prisma.user.create({
    data: {
      email: 'finance@kictamc.edu.sl',
      phone: '+23276100003',
      passwordHash: defaultPasswordHash,
      firstName: 'Mohamed',
      middleName: 'S.',
      surname: 'Koroma',
      role: Role.FINANCE_OFFICER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 2g. Prospective Applicant (In Progress)
  const sampleApplicant = await prisma.user.create({
    data: {
      email: 'applicant@kictamc.edu.sl',
      phone: '+23278200001',
      passwordHash: defaultPasswordHash,
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

  // 2h. Enrolled Student (Accepted, Enrolled, Matriculated)
  const sampleStudent = await prisma.user.create({
    data: {
      email: 'student@kictamc.edu.sl',
      phone: '+23278200099',
      passwordHash: defaultPasswordHash,
      firstName: 'Abu',
      middleName: 'Bakarr',
      surname: 'Kamara',
      role: Role.STUDENT,
      isEmailVerified: true,
      isPhoneVerified: true,
      studentProfile: {
        create: {
          dateOfBirth: new Date('2003-08-20'),
          gender: 'Male',
          nationality: 'Sierra Leonean',
          placeOfBirth: 'Freetown',
          maritalStatus: 'Single',
          residentialAddress: '25 Wilkinson Road',
          townCity: 'Freetown',
          chiefdom: 'Western Area Urban',
          district: 'Western Area Urban',
          regionProvince: 'Western Area',
          postalAddress: 'P.O. Box 101, Freetown',
          parentFullName: 'Santigie Kamara',
          parentRelationship: 'Father',
          parentPhone: '+23277000111',
          parentAddress: '25 Wilkinson Road, Freetown',
          parentOccupation: 'Lecturer',
          emergencyFullName: 'Santigie Kamara',
          emergencyRelationship: 'Father',
          emergencyPhone: '+23277000111',
        },
      },
    },
  });

  console.log('✓ Users created: Super Admin, Admin, Compliance, Lecturer, Admissions, Finance, Applicant, Student');

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

  const allCreatedCourses: any[] = [];
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

    allCreatedCourses.push(createdCourse);
  }

  console.log(`✓ Created ${coursesData.length} courses with document requirements`);

  // 6. Seed Sample Application for APPLICANT (Under Review, not enrolled yet)
  const defaultIntake = academicYear.intakes[0];
  const itDegreeCourse = allCreatedCourses.find((c) => c.code === 'BIT-301') || allCreatedCourses[0];
  const diplomaCourse = allCreatedCourses.find((c) => c.code === 'DIT-L10') || allCreatedCourses[0];

  await prisma.application.create({
    data: {
      applicationReference: 'KICTAMC-2026-000101',
      applicantId: sampleApplicant.id,
      academicYearId: academicYear.id,
      intakeId: defaultIntake.id,
      courseId: diplomaCourse.id,
      studyMode: 'Full-Time',
      preferredCampus: 'Kenema Main Campus',
      status: ApplicationStatus.UNDER_REVIEW,
      paymentStatus: PaymentStatus.PAID,
      currentStep: 4,
      submittedAt: new Date(),
      declarationAccepted: true,
      declarationAcceptedAt: new Date(),
      courseNameSnapshot: diplomaCourse.name,
      courseCodeSnapshot: diplomaCourse.code,
      courseLevelSnapshot: diplomaCourse.qualificationLevel,
      departmentNameSnapshot: deptICT.name,
      applicationFeeMinorSnapshot: diplomaCourse.applicationFeeMinor,
      currencySnapshot: diplomaCourse.currency,
    },
  });

  // 7. Seed Sample Application for STUDENT (Enrolled & Matriculated)
  await prisma.application.create({
    data: {
      applicationReference: 'KICTAMC-2026-000088',
      applicantId: sampleStudent.id,
      academicYearId: academicYear.id,
      intakeId: defaultIntake.id,
      courseId: itDegreeCourse.id,
      studyMode: 'Full-Time',
      preferredCampus: 'Kenema Main Campus',
      status: ApplicationStatus.APPROVED,
      paymentStatus: PaymentStatus.PAID,
      currentStep: 4,
      submittedAt: new Date('2026-09-02'),
      decisionAt: new Date('2026-09-10'),
      decidedByUserId: superAdmin.id,
      decisionRemarks: 'Applicant meets all academic and departmental requirements. Full admission offered.',
      declarationAccepted: true,
      declarationAcceptedAt: new Date('2026-09-02'),
      offerAccepted: true,
      offerAcceptedAt: new Date('2026-09-12'),
      acceptanceLetterPublished: true,
      acceptanceLetterPublishedAt: new Date('2026-09-10'),
      matriculationNumber: 'KICTAMC/2026/BIT/0001',
      isEnrolled: true,
      enrolledAt: new Date('2026-09-15'),
      matriculationFeePaid: true,
      matriculationFeeMinor: 50000,
      courseNameSnapshot: itDegreeCourse.name,
      courseCodeSnapshot: itDegreeCourse.code,
      courseLevelSnapshot: itDegreeCourse.qualificationLevel,
      departmentNameSnapshot: deptICT.name,
      applicationFeeMinorSnapshot: itDegreeCourse.applicationFeeMinor,
      currencySnapshot: itDegreeCourse.currency,
    },
  });

  console.log('✓ Seeded applications: 1 Under Review for Applicant, 1 Enrolled for Student');

  // 8. Record audit log for database seed
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      userEmail: superAdmin.email,
      action: 'SYSTEM_SEED',
      resource: 'Database',
      details: {
        note: 'Initial setup of KICTAMC portal with Super Admin, Admin, Compliance, Lecturer, Admissions, Finance, Applicant, and Student accounts.',
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
