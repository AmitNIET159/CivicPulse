import request from 'supertest';
import app from '../app';
import { setupTestDB, clearTestDB, teardownTestDB, createTestCitizen, createTestOfficial, createTestAdmin, createTestIssue } from './setup';
import Notification from '../models/Notification';
import Issue from '../models/Issue';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

describe('Notification System & Assignment Workflow', () => {
  it('creates a notification when admin assigns an issue to an official', async () => {
    const admin = await createTestAdmin();
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    expect(res.status).toBe(200);

    const notifications = await Notification.find({ recipient: official._id });
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('assignment');
    expect(notifications[0].title).toBe('New Task Assigned');
    expect(notifications[0].relatedIssue?.toString()).toBe(issue._id.toString());
    expect(notifications[0].isRead).toBe(false);
  });

  it('does not create duplicate notifications for repeated assignment of the same official', async () => {
    const admin = await createTestAdmin();
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    // Assign once
    await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    // Assign again to same official
    await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    const notifications = await Notification.find({ recipient: official._id });
    expect(notifications.length).toBe(1); // Still 1
  });

  it('creates a new notification when issue is reassigned to a different official', async () => {
    const admin = await createTestAdmin();
    const official1 = await createTestOfficial();
    const official2 = await createTestOfficial({ email: 'o2@test.com' });
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    // Assign to 1
    await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official1._id });

    // Reassign to 2
    await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official2._id });

    const notifications1 = await Notification.find({ recipient: official1._id });
    const notifications2 = await Notification.find({ recipient: official2._id });
    
    expect(notifications1.length).toBe(1); // O1 shouldn't get a new one
    expect(notifications2.length).toBe(1); // O2 gets one
  });

  describe('GET /api/notifications', () => {
    it('allows a user to retrieve their own notifications', async () => {
      const official = await createTestOfficial();
      await Notification.create({
        recipient: official._id,
        type: 'general',
        title: 'Test Notification',
        message: 'Hello'
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${official.accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBe(1);
      expect(res.body.unreadCount).toBe(1);
    });

    it('prevents a user from retrieving another users notifications', async () => {
      const official1 = await createTestOfficial();
      const official2 = await createTestOfficial({ email: 'o2@test.com' });

      await Notification.create({
        recipient: official1._id,
        type: 'general',
        title: 'Test',
        message: 'Hello'
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${official2.accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBe(0); // O2 sees nothing
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('allows marking a notification as read', async () => {
      const official = await createTestOfficial();
      const notif = await Notification.create({
        recipient: official._id,
        type: 'general',
        title: 'Test',
        message: 'Hello'
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${official.accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);

      // Verify unread count is updated
      const getRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${official.accessToken}`);
      expect(getRes.body.unreadCount).toBe(0);
    });

    it('prevents marking another users notification as read', async () => {
      const official1 = await createTestOfficial();
      const official2 = await createTestOfficial({ email: 'o2@test.com' });

      const notif = await Notification.create({
        recipient: official1._id,
        type: 'general',
        title: 'Test',
        message: 'Hello'
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${official2.accessToken}`);
      
      expect(res.status).toBe(404); // Not found for this user
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('marks all of the users notifications as read', async () => {
      const official = await createTestOfficial();
      await Notification.insertMany([
        { recipient: official._id, type: 'general', title: '1', message: 'm1' },
        { recipient: official._id, type: 'general', title: '2', message: 'm2' }
      ]);

      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${official.accessToken}`);
      
      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${official.accessToken}`);
      expect(getRes.body.unreadCount).toBe(0);
      expect(getRes.body.notifications[0].isRead).toBe(true);
      expect(getRes.body.notifications[1].isRead).toBe(true);
    });
  });
});
