import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/tokens';
import { Role } from '@prisma/client';

describe('Academic Catalog & Courses Module Tests', () => {
  let adminToken = '';
  let applicantToken = '';
  let sampleCourseId = '';
  let departmentId = '';

  beforeAll(async () => {
    const adminUser = await prisma.user.findFirst({
      where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.SYSTEM_ADMIN] } },
    });
    const applicantUser = await prisma.user.findFirst({
      where: { role: Role.APPLICANT },
    });
    const dept = await prisma.department.findFirst();

    if (adminUser) {
      adminToken = generateAccessToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      });
    }

    if (applicantUser) {
      applicantToken = generateAccessToken({
        userId: applicantUser.id,
        email: applicantUser.email,
        role: applicantUser.role,
      });
    }

    if (dept) {
      departmentId = dept.id;
    }
  });

  afterAll(async () => {
    // Cleanup any test created courses
    await prisma.course.deleteMany({
      where: { code: 'TEST-COURSE-99' },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/academic-years', () => {
    it('should list active academic years', async () => {
      const res = await request(app).get('/api/v1/academic-years');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].intakes).toBeDefined();
    });
  });

  describe('GET /api/v1/courses', () => {
    it('should return courses list across qualification levels', async () => {
      const res = await request(app).get('/api/v1/courses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(7);

      sampleCourseId = res.body.data[0].id;
    });

    it('should filter courses by qualification level DEGREE', async () => {
      const res = await request(app).get('/api/v1/courses?qualificationLevel=DEGREE');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((c: any) => {
        expect(c.qualificationLevel).toBe('DEGREE');
      });
    });

    it('should get course details with document requirements', async () => {
      const res = await request(app).get(`/api/v1/courses/${sampleCourseId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleCourseId);
      expect(res.body.data.documentRequirements).toBeDefined();
      expect(res.body.data.documentRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('RBAC Controls on Course Creation', () => {
    it('should reject unauthenticated request to create course', async () => {
      const res = await request(app).post('/api/v1/courses').send({
        name: 'Unauth Course',
        code: 'TEST-UA',
        departmentId,
        qualificationLevel: 'DEGREE',
        applicationFeeMinor: 25000,
      });

      expect(res.status).toBe(401);
    });

    it('should reject applicant trying to create a course', async () => {
      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          name: 'Hacker Course',
          code: 'TEST-HC',
          departmentId,
          qualificationLevel: 'DEGREE',
          applicationFeeMinor: 25000,
        });

      expect(res.status).toBe(403);
    });

    it('should allow system administrator to create and configure a course', async () => {
      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Diploma in Telecommunications & Cloud Systems',
          code: 'TEST-COURSE-99',
          departmentId,
          qualificationLevel: 'HIGHER_DIPLOMA',
          description: 'Network protocols and cloud architecture in modern organizations.',
          admissionRequirements: '4 WASSCE credits',
          applicationFeeMinor: 25000,
          currency: 'SLE',
          studyModes: 'Full-Time',
          preferredCampuses: 'Kenema Main Campus',
          documentRequirements: [
            {
              documentType: 'EXAM_RESULT',
              name: 'WASSCE Certificate',
              isMandatory: true,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('TEST-COURSE-99');
      expect(res.body.data.applicationFeeMinor).toBe(25000);
    });
  });
});
