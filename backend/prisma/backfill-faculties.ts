import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Backfilling Faculties and linking Courses/Departments ---');

  // 1. Create or upsert the 3 College Faculties
  const fict = await prisma.faculty.upsert({
    where: { code: 'FICT' },
    update: {},
    create: {
      name: 'Faculty of Information & Communication Technology',
      code: 'FICT',
      description: 'Specializing in Computing, Software Engineering, Networks, Cyber Security, and IT Management programmes.',
      deanName: 'Dr. Patrick Conteh',
      email: 'fict@kictamc.edu.sl',
      phone: '+232 76 100010',
      officeLocation: 'ICT Complex, 2nd Floor, Main Campus',
      isActive: true,
    },
  });

  const fmbs = await prisma.faculty.upsert({
    where: { code: 'FMBS' },
    update: {},
    create: {
      name: 'Faculty of Management & Business Studies',
      code: 'FMBS',
      description: 'Providing rigorous education in Business Administration, Human Resource Management, Marketing, and Entrepreneurship.',
      deanName: 'Dr. Aminata Koroma',
      email: 'fmbs@kictamc.edu.sl',
      phone: '+232 76 100020',
      officeLocation: 'Management Wing, Block A, Main Campus',
      isActive: true,
    },
  });

  const fafs = await prisma.faculty.upsert({
    where: { code: 'FAFS' },
    update: {},
    create: {
      name: 'Faculty of Accounting & Financial Studies',
      code: 'FAFS',
      description: 'Excellence in Professional Accounting, Financial Services, Banking, and Corporate Auditing.',
      deanName: 'Mr. Sheku B. Turay',
      email: 'fafs@kictamc.edu.sl',
      phone: '+232 76 100030',
      officeLocation: 'Commerce & Finance Hall, Main Campus',
      isActive: true,
    },
  });

  console.log('✓ Faculties ready: FICT, FMBS, FAFS');

  // 2. Link existing departments to faculties
  const depts = await prisma.department.findMany();
  for (const dept of depts) {
    let targetFacultyId = fict.id;
    if (dept.code === 'FMBS' || dept.name.toLowerCase().includes('management')) {
      targetFacultyId = fmbs.id;
    } else if (dept.code === 'FAFS' || dept.name.toLowerCase().includes('accounting')) {
      targetFacultyId = fafs.id;
    }

    await prisma.department.update({
      where: { id: dept.id },
      data: { facultyId: targetFacultyId },
    });
  }
  console.log(`✓ Linked ${depts.length} departments to corresponding faculties`);

  // 3. Link all courses to corresponding faculties
  const courses = await prisma.course.findMany({ include: { department: true } });
  for (const c of courses) {
    let targetFacultyId = fict.id;
    const deptName = (c.department?.name || '').toLowerCase();
    const courseName = c.name.toLowerCase();

    if (deptName.includes('management') || courseName.includes('business') || courseName.includes('management') || courseName.includes('administration')) {
      targetFacultyId = fmbs.id;
    } else if (deptName.includes('accounting') || courseName.includes('accounting') || courseName.includes('finance') || courseName.includes('banking')) {
      targetFacultyId = fafs.id;
    }

    const duration = c.qualificationLevel === 'DEGREE' ? 4 : c.qualificationLevel === 'HIGHER_DIPLOMA' ? 2 : 1;
    const qualificationAward = c.qualificationLevel === 'DEGREE' 
      ? 'Bachelor of Science (BSc Honours)' 
      : c.qualificationLevel === 'HIGHER_DIPLOMA' 
      ? 'Higher National Diploma (HND)' 
      : 'National Certificate / Lower Diploma';

    await prisma.course.update({
      where: { id: c.id },
      data: {
        facultyId: targetFacultyId,
        duration: c.duration || duration,
        durationUnit: c.durationUnit || 'Years',
        qualificationAward: c.qualificationAward || qualificationAward,
      },
    });
  }
  console.log(`✓ Linked ${courses.length} courses to faculties with duration and awards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
