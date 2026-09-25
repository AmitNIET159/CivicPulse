import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import Issue from '../models/Issue';

describe('Phase 9 — Admin API Tests', () => {
  let adminToken: string;
  let officialToken: string;
  let citizenToken: string;
  let adminId: string;
  let citizenId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    await User.deleteMany({});
    await Issue.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id.toString();
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;

    // Create Official
    await User.create({
      name: 'Official User',
      email: 'official@test.com',
      password: 'password123',
      role: 'official',
    });
    const officialLogin = await request(app).post('/api/auth/login').send({ email: 'official@test.com', password: 'password123' });
    officialToken = officialLogin.body.accessToken;

    // Create Citizen
    const citizen = await User.create({
      name: 'Citizen User',
      email: 'citizen@test.com',
      password: 'password123',
      role: 'citizen',
    });
    citizenId = citizen._id.toString();
    const citizenLogin = await request(app).post('/api/auth/login').send({ email: 'citizen@test.com', password: 'password123' });
    citizenToken = citizenLogin.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authorization', () => {
    it('prevents citizen from accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${citizenToken}`);
      expect(res.status).toBe(403);
    });

    it('prevents official from accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${officialToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(3);
    });
  });

  describe('User Management', () => {
    it('can change a users role', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${citizenId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'official', department: 'Sanitation' });
      
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('official');
      
      const dbUser = await User.findById(citizenId);
      expect(dbUser?.department).toBe('Sanitation');
    });

    it('can verify a user', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${citizenId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true });
      
      expect(res.status).toBe(200);
      expect(res.body.user.isVerified).toBe(true);
    });

    it('can delete a user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${citizenId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      const dbUser = await User.findById(citizenId);
      expect(dbUser).toBeNull();
    });
  });

  describe('System Stats', () => {
    it('returns system statistics', async () => {
      const res = await request(app)
        .get('/api/admin/system-stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBe(2); // 3 original minus 1 deleted
      expect(res.body.totalIssues).toBe(0);
      expect(Array.isArray(res.body.issuesByStatus)).toBe(true);
    });
  });
});
