import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding / updating collegiate departments with HOD assignments...');

  // 1. Get faculties
  const fict = await prisma.faculty.findFirst({ where: { OR: [{ code: 'ICT' }, { code: 'FICT' }] } });
  const fmbs = await prisma.faculty.findFirst({ where: { OR: [{ code: 'MBS' }, { code: 'FMBS' }] } });
  const fafs = await prisma.faculty.findFirst({ where: { OR: [{ code: 'AFS' }, { code: 'FAFS' }] } });

  if (!fict || !fmbs || !fafs) {
    console.error('Faculties FICT, FMBS, or FAFS not found! Run backfill-faculties first.');
    return;
  }

  // 2. Department 1: Computer Science & Software Engineering (FICT)
  let deptCSSE = await prisma.department.findFirst({
    where: { OR: [{ code: 'CSSE' }, { code: 'FICT' }] },
  });
  if (deptCSSE) {
    deptCSSE = await prisma.department.update({
      where: { id: deptCSSE.id },
      data: {
        facultyId: fict.id,
        name: 'Department of Computer Science & Software Engineering',
        code: 'CSSE',
        description: 'Undergraduate and professional programmes in computing, software architecture, mobile app development, and artificial intelligence.',
        hodName: 'Dr. Joseph M. Koroma',
        hodTitle: 'Senior Lecturer & Head of Department',
        email: 'csse@kictamc.edu.sl',
        phone: '+232 76 200011',
        officeLocation: 'ICT Block A, Room 102, Main Campus',
        isActive: true,
      },
    });
  } else {
    deptCSSE = await prisma.department.create({
      data: {
        facultyId: fict.id,
        name: 'Department of Computer Science & Software Engineering',
        code: 'CSSE',
        description: 'Undergraduate and professional programmes in computing, software architecture, mobile app development, and artificial intelligence.',
        hodName: 'Dr. Joseph M. Koroma',
        hodTitle: 'Senior Lecturer & Head of Department',
        email: 'csse@kictamc.edu.sl',
        phone: '+232 76 200011',
        officeLocation: 'ICT Block A, Room 102, Main Campus',
        isActive: true,
      },
    });
  }

  // 3. Department 2: Information Systems & Networking (FICT)
  let deptISN = await prisma.department.findFirst({
    where: { code: 'ISN' },
  });
  if (!deptISN) {
    deptISN = await prisma.department.create({
      data: {
        facultyId: fict.id,
        name: 'Department of Information Systems & Networking',
        code: 'ISN',
        description: 'Focusing on network engineering, cyber security, cloud infrastructure, and enterprise IT administration.',
        hodName: 'Mr. Mohamed Alpha',
        hodTitle: 'Senior Lecturer & Head of Department',
        email: 'isn@kictamc.edu.sl',
        phone: '+232 76 200012',
        officeLocation: 'ICT Block B, Cisco Networking Lab 1',
        isActive: true,
      },
    });
  }

  // 4. Department 3: Business Administration & Management (FMBS)
  let deptBAM = await prisma.department.findFirst({
    where: { OR: [{ code: 'BAM' }, { code: 'FMBS' }] },
  });
  if (deptBAM) {
    deptBAM = await prisma.department.update({
      where: { id: deptBAM.id },
      data: {
        facultyId: fmbs.id,
        name: 'Department of Business Administration & Management',
        code: 'BAM',
        description: 'Core collegiate management studies, strategic leadership, marketing, organizational behavior, and small business entrepreneurship.',
        hodName: 'Dr. Fatu Kamara',
        hodTitle: 'Associate Professor & Head of Department',
        email: 'bam@kictamc.edu.sl',
        phone: '+232 76 200021',
        officeLocation: 'Management Wing, Block A, Room 204',
        isActive: true,
      },
    });
  } else {
    deptBAM = await prisma.department.create({
      data: {
        facultyId: fmbs.id,
        name: 'Department of Business Administration & Management',
        code: 'BAM',
        description: 'Core collegiate management studies, strategic leadership, marketing, organizational behavior, and small business entrepreneurship.',
        hodName: 'Dr. Fatu Kamara',
        hodTitle: 'Associate Professor & Head of Department',
        email: 'bam@kictamc.edu.sl',
        phone: '+232 76 200021',
        officeLocation: 'Management Wing, Block A, Room 204',
        isActive: true,
      },
    });
  }

  // 5. Department 4: Procurement & Supply Chain (FMBS)
  let deptPSC = await prisma.department.findFirst({
    where: { code: 'PSC' },
  });
  if (!deptPSC) {
    deptPSC = await prisma.department.create({
      data: {
        facultyId: fmbs.id,
        name: 'Department of Procurement & Supply Chain Management',
        code: 'PSC',
        description: 'Public procurement, commercial logistics, inventory control, and strategic global supply chain operations.',
        hodName: 'Mr. Abdulai Sesay',
        hodTitle: 'Lecturer & Head of Department',
        email: 'psc@kictamc.edu.sl',
        phone: '+232 76 200022',
        officeLocation: 'Commerce Hall, Room 105, Main Campus',
        isActive: true,
      },
    });
  }

  // 6. Department 5: Banking & Financial Accounting (FAFS)
  let deptBFA = await prisma.department.findFirst({
    where: { OR: [{ code: 'BFA' }, { code: 'FAFS' }] },
  });
  if (deptBFA) {
    deptBFA = await prisma.department.update({
      where: { id: deptBFA.id },
      data: {
        facultyId: fafs.id,
        name: 'Department of Banking & Financial Accounting',
        code: 'BFA',
        description: 'Professional accounting certifications, auditing, public sector finance, forensic accounting, and micro-finance operations.',
        hodName: 'Mrs. Isatu Jalloh',
        hodTitle: 'Chartered Accountant & Head of Department',
        email: 'bfa@kictamc.edu.sl',
        phone: '+232 76 200031',
        officeLocation: 'Finance Wing, Ground Floor, Room 101',
        isActive: true,
      },
    });
  } else {
    deptBFA = await prisma.department.create({
      data: {
        facultyId: fafs.id,
        name: 'Department of Banking & Financial Accounting',
        code: 'BFA',
        description: 'Professional accounting certifications, auditing, public sector finance, forensic accounting, and micro-finance operations.',
        hodName: 'Mrs. Isatu Jalloh',
        hodTitle: 'Chartered Accountant & Head of Department',
        email: 'bfa@kictamc.edu.sl',
        phone: '+232 76 200031',
        officeLocation: 'Finance Wing, Ground Floor, Room 101',
        isActive: true,
      },
    });
  }

  // Link specific courses to their specialized departments:
  // BIT-301 -> CSSE
  await prisma.course.updateMany({
    where: { code: 'BIT-301' },
    data: { departmentId: deptCSSE.id, facultyId: fict.id },
  });
  // DIT-L10 -> CSSE
  await prisma.course.updateMany({
    where: { code: 'DIT-L10' },
    data: { departmentId: deptCSSE.id, facultyId: fict.id },
  });
  // HND-CS20 -> ISN
  await prisma.course.updateMany({
    where: { code: 'HND-CS20' },
    data: { departmentId: deptISN.id, facultyId: fict.id },
  });

  // BBA-301 -> BAM
  await prisma.course.updateMany({
    where: { code: 'BBA-301' },
    data: { departmentId: deptBAM.id, facultyId: fmbs.id },
  });
  // DBA-L10 -> BAM
  await prisma.course.updateMany({
    where: { code: 'DBA-L10' },
    data: { departmentId: deptBAM.id, facultyId: fmbs.id },
  });
  // BPS-301 -> PSC
  await prisma.course.updateMany({
    where: { code: 'BPS-301' },
    data: { departmentId: deptPSC.id, facultyId: fmbs.id },
  });

  // HND-AF20 -> BFA
  await prisma.course.updateMany({
    where: { code: 'HND-AF20' },
    data: { departmentId: deptBFA.id, facultyId: fafs.id },
  });

  console.log('✓ Successfully enriched departments and updated course linkages!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
