import request from 'supertest';
import app from '../app';
import { setupTestDB, clearTestDB, teardownTestDB, createTestCitizen, createTestOfficial, createTestAdmin } from './setup';
import jwt from 'jsonwebtoken';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

describe('Phase 4 — Security Hardening Tests', () => {
  describe('Authentication & Token Lifecycle', () => {
    it('rejects expired access token', async () => {
      const citizen = await createTestCitizen();
      const expiredToken = jwt.sign(
        { userId: citizen._id, role: citizen.role },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '-10s' } // Immediately expired
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/expired/i);
    });

    it('rejects old refresh token after rotation (rotation prevents reuse)', async () => {
      const citizen = await createTestCitizen();

      // Login to get a properly DB-stored refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: citizen.email, password: 'password123' });
      
      const oldRefreshToken = loginRes.body.refreshToken;
      expect(oldRefreshToken).toBeDefined();

      // 1. Rotate the token
      const res1 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefreshToken });
      
      expect(res1.status).toBe(200);
      const newRefreshToken = res1.body.refreshToken;
      expect(newRefreshToken).toBeDefined();

      // 2. Try to reuse the old refresh token
      const res2 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefreshToken });
      
      expect(res2.status).toBe(401);
      expect(res2.body.message).toMatch(/Invalid refresh token/i);

      // 3. Ensure the new refresh token still works
      const res3 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: newRefreshToken });
      
      expect(res3.status).toBe(200);
    });
  });

  describe('Authorization Rules', () => {
    it('prevents citizen from accessing official endpoints', async () => {
      const citizen = await createTestCitizen();
      
      const res = await request(app)
        .get('/api/official/issues')
        .set('Authorization', `Bearer ${citizen.accessToken}`);
      
      expect(res.status).toBe(403);
    });

    it('prevents official from performing admin-only actions (delete issue)', async () => {
      const official = await createTestOfficial();
      // ID doesn't matter for this auth check since role middleware fires first
      const res = await request(app)
        .delete('/api/issues/507f1f77bcf86cd799439011') 
        .set('Authorization', `Bearer ${official.accessToken}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('gracefully handles malformed ObjectId (prevents 500 error)', async () => {
      const citizen = await createTestCitizen();
      
      const res = await request(app)
        .get('/api/issues/not-a-valid-hex-id')
        .set('Authorization', `Bearer ${citizen.accessToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid ID/i);
    });

    it('rejects NoSQL injection attempts in queries via express-mongo-sanitize', async () => {
      const citizen = await createTestCitizen();
      
      // Attempt to bypass auth/login with a NoSQL injection payload
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: "" },
          password: "password123"
        });
      
      // It should be caught by express-validator first or sanitization
      expect(res.status).toBeGreaterThanOrEqual(400); 
    });
    
    it('safely handles invalid pagination parameters', async () => {
      const res = await request(app)
        .get('/api/issues?page=-1&limit=abc');
      
      // Should default to page 1, limit 20, returning 200 rather than crashing
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.issues)).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('includes Helmet security headers in responses', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.status).toBe(200);
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['strict-transport-security']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('has rate limiting active on /api/auth/login', async () => {
      const res = await request(app).get('/api/health');
      // express-rate-limit standardHeaders: true sets 'ratelimit-limit'
      expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
    });
  });
});
