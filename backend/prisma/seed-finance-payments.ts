import { PrismaClient, PaymentMethod, PaymentStatus, Role, ApplicationStatus, QualificationLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function seedFinance() {
  console.log('Seeding realistic finance data...');

  // 1. Ensure Academic Year & Intake
  let academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
    include: { intakes: true },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        code: '2025-2026',
        name: '2025/2026 Academic Session',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-07-31'),
        applicationStartDate: new Date('2025-04-01'),
        applicationEndDate: new Date('2026-08-31'),
        isActive: true,
        intakes: {
          create: [
            {
              name: 'September 2025 Intake',
              startDate: new Date('2025-09-15'),
              endDate: new Date('2026-01-30'),
              applicationDeadline: new Date('2026-08-15'),
              isActive: true,
            },
          ],
        },
      },
      include: { intakes: true },
    });
  }

  const intake = academicYear.intakes[0];

  // 2. Ensure Course
  let course = await prisma.course.findFirst();
  if (!course) {
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: 'Department of Computer Science',
          code: 'DCS',
        },
      });
    }
    course = await prisma.course.create({
      data: {
        departmentId: dept.id,
        academicYearId: academicYear.id,
        name: 'BSc in Information Technology & Systems',
        code: 'BIT-301',
        qualificationLevel: QualificationLevel.DEGREE,
        applicationFeeMinor: 250000, // 2,500.00 SLE
        tuitionFeeMinor: 450000,
        currency: 'SLE',
      },
    });
  }

  // 3. Ensure Finance Officer
  let financeOfficer = await prisma.user.findFirst({
    where: { role: Role.FINANCE_OFFICER },
  });
  if (!financeOfficer) {
    const pw = await bcrypt.hash('Finance@123', 10);
    financeOfficer = await prisma.user.create({
      data: {
        email: 'finance@kictamc.edu.sl',
        passwordHash: pw,
        role: Role.FINANCE_OFFICER,
        firstName: 'Fatmata',
        surname: 'Turay',
        isActive: true,
      },
    });
  }

  // 4. Sample Candidate Transactions matching reference design
  const sampleTransactions = [
    {
      appRef: 'APP-2025-0412',
      firstName: 'James',
      middleName: 'S.',
      surname: 'Koroma',
      email: 'james.koroma@student.kictamc.edu.sl',
      phone: '+23276112233',
      amountMinor: 250000, // Le 2,500
      method: PaymentMethod.ONLINE_MOCK,
      status: PaymentStatus.PAID,
      hoursAgo: 2,
      providerRef: 'MOCK-ONL-984712',
      token: 'KICTAMC-PAY-98A72B10',
    },
    {
      appRef: 'APP-2025-0387',
      firstName: 'Mariama',
      middleName: 'K.',
      surname: 'Conteh',
      email: 'mariama.conteh@student.kictamc.edu.sl',
      phone: '+23278223344',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_BANK_DEPOSIT,
      status: PaymentStatus.PENDING_VERIFICATION,
      hoursAgo: 18,
      providerRef: 'SLBL-TEL-449102',
    },
    {
      appRef: 'APP-2025-0391',
      firstName: 'Alusine',
      middleName: 'M.',
      surname: 'Bangura',
      email: 'alusine.bangura@student.kictamc.edu.sl',
      phone: '+23277334455',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_ORANGE_MONEY,
      status: PaymentStatus.PAID,
      hoursAgo: 42,
      providerRef: 'OM-TX-882190',
      token: 'KICTAMC-PAY-11C90D44',
    },
    {
      appRef: 'APP-2025-0403',
      firstName: 'Fatmata',
      middleName: 'T.',
      surname: 'Kamara',
      email: 'fatmata.kamara@student.kictamc.edu.sl',
      phone: '+23276445566',
      amountMinor: 250000,
      method: PaymentMethod.ONLINE_MOCK,
      status: PaymentStatus.REJECTED,
      hoursAgo: 68,
      providerRef: 'MOCK-FL-002194',
      rejectionReason: 'Invalid transaction reference code provided by candidate.',
    },
    {
      appRef: 'APP-2025-0376',
      firstName: 'Ibrahim',
      middleName: 'S.',
      surname: 'Jalloh',
      email: 'ibrahim.jalloh@student.kictamc.edu.sl',
      phone: '+23279556677',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_BANK_DEPOSIT,
      status: PaymentStatus.PAID,
      hoursAgo: 94,
      providerRef: 'RCB-DEPO-77192',
      token: 'KICTAMC-PAY-44E81A99',
    },
    {
      appRef: 'APP-2025-0410',
      firstName: 'Mohamed',
      middleName: 'L.',
      surname: 'Sesay',
      email: 'mohamed.sesay@student.kictamc.edu.sl',
      phone: '+23276889900',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_AFRIMONEY,
      status: PaymentStatus.PAID,
      hoursAgo: 120,
      providerRef: 'AFRI-CASH-99120',
      token: 'KICTAMC-PAY-33D72B88',
    },
    {
      appRef: 'APP-2025-0420',
      firstName: 'Sia',
      middleName: 'A.',
      surname: 'Mansaray',
      email: 'sia.mansaray@student.kictamc.edu.sl',
      phone: '+23277991122',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_BANK_DEPOSIT,
      status: PaymentStatus.PENDING_VERIFICATION,
      hoursAgo: 140,
      providerRef: 'UTB-SL-29182',
    },
    {
      appRef: 'APP-2025-0365',
      firstName: 'Kadiatu',
      middleName: 'B.',
      surname: 'Thoronka',
      email: 'kadiatu.thoronka@student.kictamc.edu.sl',
      phone: '+23278114477',
      amountMinor: 250000,
      method: PaymentMethod.ONLINE_MOCK,
      status: PaymentStatus.PAID,
      hoursAgo: 180,
      providerRef: 'MOCK-ONL-881273',
      token: 'KICTAMC-PAY-77B19C33',
    },
    {
      appRef: 'APP-2025-0350',
      firstName: 'Samuel',
      middleName: 'E.',
      surname: 'Bio',
      email: 'samuel.bio@student.kictamc.edu.sl',
      phone: '+23276332211',
      amountMinor: 250000,
      method: PaymentMethod.MANUAL_ORANGE_MONEY,
      status: PaymentStatus.PENDING_VERIFICATION,
      hoursAgo: 220,
      providerRef: 'OM-REF-491028',
    },
    {
      appRef: 'APP-2025-0342',
      firstName: 'Aminata',
      middleName: 'P.',
      surname: 'Kanneh',
      email: 'aminata.kanneh@student.kictamc.edu.sl',
      phone: '+23279445588',
      amountMinor: 250000,
      method: PaymentMethod.ONLINE_MOCK,
      status: PaymentStatus.PAID,
      hoursAgo: 260,
      providerRef: 'MOCK-ONL-771923',
      token: 'KICTAMC-PAY-55A33C11',
    },
  ];

  const pwHash = await bcrypt.hash('Student@123', 10);
  const now = new Date();

  for (const item of sampleTransactions) {
    // 1. Create or get user
    let user = await prisma.user.findUnique({ where: { email: item.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: item.email,
          passwordHash: pwHash,
          role: Role.APPLICANT,
          firstName: item.firstName,
          middleName: item.middleName,
          surname: item.surname,
          phone: item.phone,
          isActive: true,
        },
      });
    }

    // 2. Create or get application
    let app = await prisma.application.findUnique({
      where: { applicationReference: item.appRef },
    });
    if (!app) {
      const submittedAt = new Date(now.getTime() - item.hoursAgo * 60 * 60 * 1000);
      app = await prisma.application.create({
        data: {
          applicationReference: item.appRef,
          applicantId: user.id,
          academicYearId: academicYear.id,
          intakeId: intake.id,
          courseId: course.id,
          studyMode: 'Full-Time',
          preferredCampus: 'Kenema Main Campus',
          status:
            item.status === PaymentStatus.PAID
              ? ApplicationStatus.UNDER_REVIEW
              : item.status === PaymentStatus.REJECTED
              ? ApplicationStatus.DRAFT
              : ApplicationStatus.SUBMITTED,
          paymentStatus: item.status,
          currentStep: 4,
          submittedAt,
          declarationAccepted: true,
          declarationAcceptedAt: submittedAt,
          courseNameSnapshot: course.name,
          courseCodeSnapshot: course.code,
          courseLevelSnapshot: course.qualificationLevel,
          applicationFeeMinorSnapshot: course.applicationFeeMinor,
          currencySnapshot: course.currency,
        },
      });
    }

    // 3. Create or update payment
    const submittedAt = new Date(now.getTime() - item.hoursAgo * 60 * 60 * 1000);
    const existingPayment = await prisma.payment.findFirst({
      where: { applicationId: app.id },
    });

    if (!existingPayment) {
      const internalRef = `KICTAMC-PAYREF-${Math.floor(100000 + Math.random() * 900000)}`;
      const payment = await prisma.payment.create({
        data: {
          applicationId: app.id,
          internalReference: internalRef,
          paymentMethod: item.method,
          expectedAmountMinor: item.amountMinor,
          declaredAmountMinor: item.amountMinor,
          currency: 'SLE',
          providerTransactionReference: item.providerRef,
          paymentType: 'APPLICATION_FEE',
          status: item.status,
          rejectionReason: item.rejectionReason || null,
          submittedAt,
          verifiedAt: item.status === PaymentStatus.PAID ? submittedAt : null,
          verifiedByUserId: item.status === PaymentStatus.PAID ? financeOfficer.id : null,
        },
      });

      if (item.token && item.status === PaymentStatus.PAID) {
        await prisma.paymentConfirmationToken.create({
          data: {
            applicationId: app.id,
            paymentId: payment.id,
            token: item.token,
            issuedAt: submittedAt,
            isValid: true,
          },
        });
      }
    }
  }

  console.log(`✓ Seeded ${sampleTransactions.length} authentic payments and tokens for Finance Dashboard!`);
  await prisma.$disconnect();
}

seedFinance().catch(console.error);
