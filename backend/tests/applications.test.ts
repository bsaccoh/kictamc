import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/tokens';
import { Role } from '@prisma/client';

describe('Applications & Drafts Module Tests', () => {
  let applicantToken = '';
  let otherApplicantToken = '';
  let applicationId = '';

  beforeAll(async () => {
    // 1. Get or create primary test applicant
    const applicantUser = await prisma.user.findFirst({
      where: { role: Role.APPLICANT },
    });

    if (applicantUser) {
      applicantToken = generateAccessToken({
        userId: applicantUser.id,
        email: applicantUser.email,
        role: applicantUser.role,
      });
    }

    // 2. Create second applicant for object-level permission checking
    const otherUser = await prisma.user.create({
      data: {
        email: `other.student.${Date.now()}@kictamc.edu.sl`,
        phone: `+232${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: 'dummyhash',
        firstName: 'Joe',
        surname: 'Cole',
        role: Role.APPLICANT,
      },
    });

    otherApplicantToken = generateAccessToken({
      userId: otherUser.id,
      email: otherUser.email,
      role: otherUser.role,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'other.student.' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/applications/draft', () => {
    it('should get or create active draft application', async () => {
      const res = await request(app)
        .post('/api/v1/applications/draft')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.applicationReference).toMatch(/^KICTAMC-\d{4}-\d{6}$/);
      expect(res.body.data.status).toBe('DRAFT');

      applicationId = res.body.data.id;
    });
  });

  describe('PATCH /api/v1/applications/:id (Draft Updates)', () => {
    it('should update draft personal and address details', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          currentStep: 2,
          personal: {
            dateOfBirth: '2004-06-12T00:00:00.000Z',
            gender: 'Female',
            nationality: 'Sierra Leonean',
            maritalStatus: 'Single',
          },
          contact: {
            residentialAddress: '10 Dama Road',
            townCity: 'Kenema',
            district: 'Kenema',
            regionProvince: 'Eastern Province',
          },
          parent: {
            parentFullName: 'Alpha Bangura',
            parentRelationship: 'Father',
            parentPhone: '+23277112233',
          },
          emergency: {
            emergencyFullName: 'Alpha Bangura',
            emergencyRelationship: 'Father',
            emergencyPhone: '+23277112233',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStep).toBe(2);
      expect(res.body.data.applicant.studentProfile.townCity).toBe('Kenema');
    });

    it('should prevent other applicants from modifying this draft (Object-level auth)', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${otherApplicantToken}`)
        .send({
          currentStep: 3,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST & DELETE /api/v1/applications/:id/educations', () => {
    let educationId = '';

    it('should add educational background with subjects and grades', async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/educations`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          institutionName: 'Kenema Government Secondary School',
          institutionLocation: 'Kenema City',
          examinationType: 'WASSCE',
          examinationYear: 2024,
          candidateNumber: '1040201099',
          qualificationObtained: 'West African Senior School Certificate',
          completionStatus: 'COMPLETED',
          subjectsAndGrades: [
            { subject: 'English Language', grade: 'B3' },
            { subject: 'Mathematics', grade: 'B2' },
            { subject: 'Physics', grade: 'B3' },
            { subject: 'Chemistry', grade: 'C4' },
            { subject: 'Biology', grade: 'C5' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.institutionName).toBe('Kenema Government Secondary School');
      expect(Array.isArray(res.body.data.subjectsAndGrades)).toBe(true);
      expect(res.body.data.subjectsAndGrades.length).toBe(5);

      educationId = res.body.data.id;
    });

    it('should delete educational record when requested by owner', async () => {
      const res = await request(app)
        .delete(`/api/v1/applications/${applicationId}/educations/${educationId}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
