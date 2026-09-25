import request from 'supertest';
import app from '../app';
import { setupTestDB, clearTestDB, teardownTestDB, createTestCitizen, createTestIssue } from './setup';
import mongoose from 'mongoose';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

describe('Phase 5 — Comments API Tests', () => {
  describe('POST /api/issues/:id/comments', () => {
    it('Authenticated user can create a comment on an issue', async () => {
      const citizen = await createTestCitizen();
      const issue = await createTestIssue(citizen._id);

      const res = await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'This is a test comment.' });

      expect(res.status).toBe(201);
      expect(res.body.comment.content).toBe('This is a test comment.');
      expect(res.body.comment.issue.toString()).toBe(issue._id.toString());
      expect(res.body.comment.author._id.toString()).toBe(citizen._id.toString());
    });

    it('Unauthenticated user cannot create comment', async () => {
      const citizen = await createTestCitizen();
      const issue = await createTestIssue(citizen._id);

      const res = await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .send({ content: 'This should fail.' });

      expect(res.status).toBe(401);
    });

    it('Empty comment rejected', async () => {
      const citizen = await createTestCitizen();
      const issue = await createTestIssue(citizen._id);

      const res = await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/empty/i);
    });

    it('Excessively long comment rejected', async () => {
      const citizen = await createTestCitizen();
      const issue = await createTestIssue(citizen._id);

      const res = await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'A'.repeat(501) });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/exceed 500/i);
    });

    it('Invalid issue ID rejected', async () => {
      const citizen = await createTestCitizen();

      const res = await request(app)
        .post(`/api/issues/not-a-valid-id/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'Hello' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/issues/:id/comments', () => {
    it('Comments can be retrieved for an issue with correct ordering', async () => {
      const citizen = await createTestCitizen();
      const issue = await createTestIssue(citizen._id);

      // Create two comments
      await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'First comment' });
      
      await request(app)
        .post(`/api/issues/${issue._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'Second comment' });

      // Fetch comments
      const res = await request(app).get(`/api/issues/${issue._id}/comments`);
      
      expect(res.status).toBe(200);
      expect(res.body.comments.length).toBe(2);
      expect(res.body.comments[0].content).toBe('First comment');
      expect(res.body.comments[1].content).toBe('Second comment');
      
      // Ensure no sensitive data is leaked (only name, role, avatar)
      expect(res.body.comments[0].author.email).toBeUndefined();
      expect(res.body.comments[0].author.password).toBeUndefined();
    });

    it('Comments belong only to the requested issue', async () => {
      const citizen = await createTestCitizen();
      const issue1 = await createTestIssue(citizen._id);
      const issue2 = await createTestIssue(citizen._id);

      await request(app)
        .post(`/api/issues/${issue1._id}/comments`)
        .set('Authorization', `Bearer ${citizen.accessToken}`)
        .send({ content: 'For issue 1' });

      const res = await request(app).get(`/api/issues/${issue2._id}/comments`);
      
      expect(res.status).toBe(200);
      expect(res.body.comments.length).toBe(0);
    });

    it('Invalid issue ID handled correctly', async () => {
      const res = await request(app).get(`/api/issues/invalid-id/comments`);
      expect(res.status).toBe(400);
    });
  });
});
