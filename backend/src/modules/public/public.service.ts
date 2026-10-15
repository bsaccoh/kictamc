import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const publicService = {
  async getOverview() {
    const [
      activeYear,
      activeIntakes,
      courses,
      faculties,
      recentNews,
      upcomingEvents,
    ] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { isActive: true },
        include: { intakes: { where: { isActive: true } } },
      }),
      prisma.admissionIntake.findMany({
        where: { isActive: true },
        include: { academicYear: true },
        orderBy: { applicationDeadline: 'asc' },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        include: {
          department: true,
          faculty: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.faculty.findMany({
        where: { isActive: true },
        include: {
          departments: { where: { isActive: true } },
          courses: { where: { isActive: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.newsArticle.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      }),
      prisma.collegeEvent.findMany({
        where: { isPublished: true },
        orderBy: { startDate: 'asc' },
        take: 4,
      }),
    ]);

    return {
      academicYear: activeYear,
      activeIntakes,
      coursesCount: courses.length,
      facultiesCount: faculties.length,
      featuredCourses: courses.slice(0, 6),
      recentNews,
      upcomingEvents,
      collegeInfo: {
        name: 'Kenema ICT & Management College',
        shortName: 'KICTAMC',
        motto: 'NON SIBI SED PATRIAE',
        location: '19 Bockarie Gbay Street, Kenema, Sierra Leone',
        email: 'info@kictamc.edu.sl',
        admissionsEmail: 'admissions@kictamc.edu.sl',
        phone: '+232 76 612 345',
        phoneAlt: '+232 78 200 010',
        crestUrl: '/kictamc-logo.png',
        heroImageUrl: '/kictamc-college-front.jpg',
        affiliation: {
          enabled: true,
          partnerName: 'Eastern Technical University of Sierra Leone',
          partnerShortName: 'ETU-SL',
          partnerHistoricalName: 'Eastern Polytechnic',
          partnerLocation: 'Kenema, Sierra Leone',
          partnerWebsiteUrl: 'https://etusl.edu.sl',
          statement: 'KICTAM College — Affiliated with Eastern Technical University of Sierra Leone (ETU-SL), Kenema.',
        },
      },
    };
  },

  async getNewsArticles(category?: string, query?: string) {
    const where: any = { isPublished: true };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { summary: { contains: query.trim(), mode: 'insensitive' } },
        { content: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  },

  async getNewsArticleBySlug(slug: string) {
    return prisma.newsArticle.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isPublished: true,
      },
    });
  },

  async getCollegeEvents(category?: string) {
    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    return prisma.collegeEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  },

  async submitEnquiry(data: {
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    if (!data.fullName || !data.email || !data.subject || !data.message) {
      throw new Error('Please provide your name, email, subject, and enquiry message.');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Please provide a valid email address.');
    }

    const enquiry = await prisma.publicEnquiry.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'PENDING',
      },
    });

    return {
      referenceId: enquiry.id.slice(0, 8).toUpperCase(),
      message: 'Thank you for reaching out to KICTAMC. Your enquiry has been received and our admissions registry will contact you shortly.',
    };
  },
};
