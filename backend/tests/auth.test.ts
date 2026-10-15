import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Auth & User Module Tests', () => {
  const testEmail = `test.applicant.${Date.now()}@kictamc.edu.sl`;
  const testPhone = `+232${Math.floor(10000000 + Math.random() * 90000000)}`;
  let accessToken = '';

  afterAll(async () => {
    // Cleanup created test user
    await prisma.user.deleteMany({
      where: { email: { contains: 'test.applicant.' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new applicant successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Sahr',
          middleName: 'Emmanuel',
          surname: 'Kamara',
          email: testEmail,
          phone: testPhone,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          acceptTerms: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe('APPLICANT');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.verificationCode).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      accessToken = res.body.data.accessToken;
    });

    it('should reject registration if email is duplicate', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Sahr',
          surname: 'Kamara',
          email: testEmail,
          phone: `+232${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          acceptTerms: true,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration when validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: '',
          surname: '',
          email: 'invalid-email',
          phone: '123',
          password: 'pass',
          confirmPassword: 'other',
          acceptTerms: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.profile).toBeDefined();
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update student profile fields', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          townCity: 'Kenema',
          district: 'Kenema',
          regionProvince: 'Eastern Province',
          residentialAddress: '25 Blama Road',
          parentFullName: 'Pa Sahr Kamara',
          parentPhone: '+23276999888',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.townCity).toBe('Kenema');
      expect(res.body.data.parentFullName).toBe('Pa Sahr Kamara');
    });
  });
});
