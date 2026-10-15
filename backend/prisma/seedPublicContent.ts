import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding KICTAMC Public Website Content ---');

  // Check if news articles already exist
  const existingArticles = await prisma.newsArticle.count();
  if (existingArticles === 0) {
    await prisma.newsArticle.createMany({
      data: [
        {
          title: 'Admissions Officially Open for 2026/2027 Academic Year',
          slug: 'admissions-open-2026-2027',
          summary: 'The Registry of Kenema ICT & Management College (KICTAMC) invites applications from suitably qualified candidates for admission into our Degree, Higher National Diploma, and Lower Diploma programmes.',
          content: `The Administration and Academic Board of Kenema ICT & Management College (KICTAMC) are pleased to announce that online applications for the 2026/2027 Academic Year are now officially open.

Prospective students can apply for accredited programmes across our faculties:
- Faculty of Information & Communication Technology (BSc in IT, HND Computer Science & Networking, Diploma in IT)
- Faculty of Management & Business Studies (BSc in Business Administration, BSc in Procurement & Supply Chain, Diploma in Business Administration)
- Faculty of Accounting & Financial Studies (HND in Accounting & Finance)

Applications must be submitted through the official Student Application Portal. Candidates should ensure all supporting documents (WASSCE / GCE certificates, testimonial, and birth certificate) are scanned and uploaded accurately. For further enquiries, prospective candidates may visit the Admissions Office at 19 Bockarie Gbay Street, Kenema.`,
          category: 'ADMISSION',
          featuredImage: '/campus-building.jpg',
          author: 'KICTAMC Office of the Registrar',
          isPublished: true,
          publishedAt: new Date('2026-09-01T08:00:00Z'),
        },
        {
          title: 'Commissioning of Modern Computer Systems and Networking Laboratories',
          slug: 'commissioning-of-modern-computer-laboratories',
          summary: 'KICTAMC expands its practical computing infrastructure with newly outfitted computer labs to support hands-on software development and networking practicals.',
          content: `In line with our institutional commitment to practical, job-ready education, KICTAMC has officially commissioned upgraded computing and digital systems laboratories at our Kenema campus.

The laboratories are equipped with high-speed local networking, modern workstations, and dedicated server environments to support students enrolled in Computer Science, Networking, and Information Technology programmes. 

Speaking during the inspection, the Academic Board emphasized that KICTAMC remains steadfast in bridging the digital skills gap in Eastern Sierra Leone and providing youth with cutting-edge technical competencies.`,
          category: 'ACADEMIC',
          featuredImage: '/kictamc-college-front.jpg',
          author: 'Faculty of Information & Communication Technology',
          isPublished: true,
          publishedAt: new Date('2026-09-15T10:00:00Z'),
        },
        {
          title: 'Orientation and Matriculation Ceremony for Incoming Class',
          slug: 'orientation-and-matriculation-ceremony',
          summary: 'Official date announced for the orientation week and formal matriculation ceremony welcoming newly admitted students to KICTAMC.',
          content: `All newly admitted students for the 2026/2027 Academic Year are hereby notified that the official College Orientation Week and Matriculation Ceremony have been scheduled.

Orientation sessions will introduce fresh students to academic regulations, digital portal usage, library facilities, and code of conduct. The formal Matriculation Ceremony will mark the official induction of students into the collegiate community.

Attendance is mandatory for all matriculating students. Matriculation gowns and identification credentials will be issued upon clearance from the Finance and Admissions Registry.`,
          category: 'ANNOUNCEMENT',
          featuredImage: '/kictamc-campus.jpg',
          author: 'KICTAMC Directorate of Student Affairs',
          isPublished: true,
          publishedAt: new Date('2026-09-28T09:00:00Z'),
        },
      ],
    });
    console.log('✓ Public News and Announcements seeded');
  }

  // Check if events exist
  const existingEvents = await prisma.collegeEvent.count();
  if (existingEvents === 0) {
    await prisma.collegeEvent.createMany({
      data: [
        {
          title: 'New Student Orientation Week',
          description: 'A comprehensive week of introductory sessions, campus tours, ICT portal training, and faculty introductions for all new intakes.',
          venue: 'Main Campus Assembly Hall, 19 Bockarie Gbay Street, Kenema',
          startDate: new Date('2026-10-20T09:00:00Z'),
          endDate: new Date('2026-10-24T15:00:00Z'),
          timeString: '09:00 AM - 03:00 PM Daily',
          category: 'ORIENTATION',
          isPublished: true,
        },
        {
          title: 'Official Matriculation Ceremony 2026/2027',
          description: 'The formal academic ceremony where new students sign the matriculation register and take the institutional pledge under the motto "Non Sibi Sed Patriae".',
          venue: 'KICTAM College Main Grounds, Kenema',
          startDate: new Date('2026-11-06T10:00:00Z'),
          endDate: new Date('2026-11-06T14:00:00Z'),
          timeString: '10:00 AM - 02:00 PM',
          category: 'MATRICULATION',
          isPublished: true,
        },
        {
          title: 'Application Deadline for September Regular Intake',
          description: 'Final date for prospective applicants to complete and submit their online application forms and uploaded credentials for the September Intake.',
          venue: 'Online Application Portal / Admissions Registry',
          startDate: new Date('2026-11-30T23:59:00Z'),
          endDate: new Date('2026-11-30T23:59:00Z'),
          timeString: '11:59 PM',
          category: 'ADMISSION',
          isPublished: true,
        },
        {
          title: 'ICT Career & Technical Innovation Workshop',
          description: 'An interactive seminar featuring regional industry leaders, software practitioners, and business managers exploring emerging technology careers.',
          venue: 'KICTAMC ICT Complex, Kenema',
          startDate: new Date('2026-12-10T11:00:00Z'),
          endDate: new Date('2026-12-10T16:00:00Z'),
          timeString: '11:00 AM - 04:00 PM',
          category: 'WORKSHOP',
          isPublished: true,
        },
      ],
    });
    console.log('✓ Public Events seeded');
  }

  console.log('✓ Public content verified successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding public content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
