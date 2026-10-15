import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/tokens';
import { Role } from '@prisma/client';

describe('Document Upload, Security & Verification Module Tests', () => {
  let applicantToken = '';
  let admissionsToken = '';
  let unauthorizedToken = '';
  let applicationId = '';
  let documentId = '';

  beforeAll(async () => {
    const applicantUser = await prisma.user.findFirst({
      where: { role: Role.APPLICANT },
    });
    const admissionsUser = await prisma.user.findFirst({
      where: { role: Role.ADMISSIONS_OFFICER },
    });
    const otherUser = await prisma.user.create({
      data: {
        email: `doc.unauth.${Date.now()}@kictamc.edu.sl`,
        phone: `+232${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: 'dummy',
        firstName: 'Unauthorized',
        surname: 'Person',
        role: Role.APPLICANT,
      },
    });

    if (applicantUser) {
      applicantToken = generateAccessToken({
        userId: applicantUser.id,
        email: applicantUser.email,
        role: applicantUser.role,
      });

      // Get or create draft application for applicant
      const draftRes = await request(app)
        .post('/api/v1/applications/draft')
        .set('Authorization', `Bearer ${applicantToken}`);
      applicationId = draftRes.body.data.id;
    }

    if (admissionsUser) {
      admissionsToken = generateAccessToken({
        userId: admissionsUser.id,
        email: admissionsUser.email,
        role: admissionsUser.role,
      });
    }

    unauthorizedToken = generateAccessToken({
      userId: otherUser.id,
      email: otherUser.email,
      role: otherUser.role,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'doc.unauth.' } },
    });
    await prisma.$disconnect();
  });

  describe('Document Upload & Security Validation', () => {
    it('should reject file upload when signature does not match claimed PDF MIME type', async () => {
      // Fake PDF with invalid text content
      const fakeBuffer = Buffer.from('This is a fake text file disguised as a PDF');

      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/documents`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .field('documentType', 'EXAM_RESULT')
        .attach('file', fakeBuffer, {
          filename: 'fake_wassce.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('signature');
    });

    it('should accept valid PDF file with authentic %PDF signature', async () => {
      // Authentic minimal PDF header
      const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/documents`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .field('documentType', 'EXAM_RESULT')
        .attach('file', validPdfBuffer, {
          filename: 'valid_wassce_slip.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documentType).toBe('EXAM_RESULT');
      expect(res.body.data.status).toBe('PENDING');

      documentId = res.body.data.id;
    });

    it('should prevent unauthorized applicant from accessing private document file', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/file`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow document owner to stream their private document file', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/file`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('should allow admissions officer to stream the document file for review', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${documentId}/file`)
        .set('Authorization', `Bearer ${admissionsToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Admissions Officer Verification Workflow', () => {
    it('should allow admissions officer to reject a document with a mandatory reason', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${admissionsToken}`)
        .send({
          reason: 'Document image is blurred. Candidate name is illegible.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REJECTED');
      expect(res.body.data.rejectionReason).toContain('blurred');
    });

    it('should allow admissions officer to verify a valid document', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/documents/${documentId}/verify`)
        .set('Authorization', `Bearer ${admissionsToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('VERIFIED');
      expect(res.body.data.verifiedAt).toBeDefined();
    });
  });
});
