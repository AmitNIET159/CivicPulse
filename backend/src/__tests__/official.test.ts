import request from 'supertest';
import app from '../app';
import Issue from '../models/Issue';
import {
  setupTestDB, clearTestDB, teardownTestDB,
  createTestCitizen, createTestOfficial, createTestAdmin,
  createTestIssue,
} from './setup';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

// ═══════════════════════════════════════════════════════════════════
//  ASSIGNMENT — Critical for upcoming notification system
// ═══════════════════════════════════════════════════════════════════

describe('PUT /api/official/issues/:id/assign', () => {
  it('admin can assign issue to a verified official', async () => {
    const admin = await createTestAdmin();
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    expect(res.status).toBe(200);
    expect(res.body.issue).toBeDefined();
    expect(res.body.issue.assignedTo).toBeDefined();
    expect(res.body.issue.assignedTo._id).toBe(official._id);
  });

  it('verifies correct issue is assigned', async () => {
    const admin = await createTestAdmin();
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue1 = await createTestIssue(citizen._id, { title: 'Issue Alpha' });
    await createTestIssue(citizen._id, { title: 'Issue Beta' });

    const res = await request(app)
      .put(`/api/official/issues/${issue1._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    expect(res.status).toBe(200);
    expect(res.body.issue._id).toBe(issue1._id.toString());
    expect(res.body.issue.title).toBe('Issue Alpha');
  });

  it('official can assign issue to another official', async () => {
    const officialA = await createTestOfficial({ email: 'offA@test.com' });
    const officialB = await createTestOfficial({ email: 'offB@test.com' });
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${officialA.accessToken}`)
      .send({ officialId: officialB._id });

    expect(res.status).toBe(200);
    expect(res.body.issue.assignedTo._id).toBe(officialB._id);
  });

  it('citizen CANNOT assign issues', async () => {
    const citizen = await createTestCitizen();
    const official = await createTestOfficial();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send({ officialId: official._id });

    expect(res.status).toBe(403);
  });

  it('rejects assignment without auth token', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .send({ officialId: official._id });

    expect(res.status).toBe(401);
  });

  it('rejects assignment to non-existent official', async () => {
    const admin = await createTestAdmin();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: '507f1f77bcf86cd799439011' });

    expect(res.status).toBe(400);
  });

  it('rejects assignment to a citizen user', async () => {
    const admin = await createTestAdmin();
    const citizenTarget = await createTestCitizen({ email: 'target@test.com' });
    const citizenReporter = await createTestCitizen({ email: 'reporter@test.com' });
    const issue = await createTestIssue(citizenReporter._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: citizenTarget._id });

    expect(res.status).toBe(400);
  });

  it('rejects assignment of non-existent issue', async () => {
    const admin = await createTestAdmin();
    const official = await createTestOfficial();

    const res = await request(app)
      .put('/api/official/issues/507f1f77bcf86cd799439011/assign')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: official._id });

    expect(res.status).toBe(404);
  });

  it('re-assigning issue to different official updates assignedTo', async () => {
    const admin = await createTestAdmin();
    const officialA = await createTestOfficial({ email: 'reassignA@test.com' });
    const officialB = await createTestOfficial({ email: 'reassignB@test.com' });
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    // First assignment
    await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: officialA._id });

    // Re-assignment
    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ officialId: officialB._id });

    expect(res.status).toBe(200);
    expect(res.body.issue.assignedTo._id).toBe(officialB._id);

    // Verify DB
    const dbIssue = await Issue.findById(issue._id);
    expect(dbIssue!.assignedTo!.toString()).toBe(officialB._id);
  });
});

// ═══════════════════════════════════════════════════════════════════
//  STATUS UPDATES
// ═══════════════════════════════════════════════════════════════════

describe('PUT /api/official/issues/:id/status', () => {
  it('official can update status to under_review', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'under_review', comment: 'Reviewing this issue' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('under_review');
  });

  it('official can update status to in_progress', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('in_progress');
  });

  it('resolving sets resolvedAt timestamp', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'resolved', comment: 'Fixed the pothole' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('resolved');
    expect(res.body.issue.resolvedAt).toBeDefined();
  });

  it('rejecting stores rejectionReason', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'rejected', rejectionReason: 'Duplicate report' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('rejected');
    expect(res.body.issue.rejectionReason).toBe('Duplicate report');
  });

  it('status change appends to statusHistory', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'under_review' });

    const dbIssue = await Issue.findById(issue._id);
    // Original pending + new under_review = 2 entries
    expect(dbIssue!.statusHistory.length).toBe(2);
    expect(dbIssue!.statusHistory[1].status).toBe('under_review');
  });

  it('stores officialComment when provided', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'in_progress', comment: 'Working on it' });

    const dbIssue = await Issue.findById(issue._id);
    expect(dbIssue!.officialComment).toBe('Working on it');
  });

  it('citizen CANNOT update status', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send({ status: 'under_review' });

    expect(res.status).toBe(403);
  });

  it('rejects invalid status value', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .put(`/api/official/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${official.accessToken}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════
//  OFFICIAL ISSUE LIST & TEAM
// ═══════════════════════════════════════════════════════════════════

describe('GET /api/official/issues', () => {
  it('official can retrieve issues', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    await createTestIssue(citizen._id, { ward: official.name === 'Test Official' ? 'Ward-1' : '' });

    const res = await request(app)
      .get('/api/official/issues')
      .set('Authorization', `Bearer ${official.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.issues).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('citizen CANNOT retrieve official issues', async () => {
    const citizen = await createTestCitizen();

    const res = await request(app)
      .get('/api/official/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/official/team', () => {
  it('official can see team members', async () => {
    const official = await createTestOfficial();

    const res = await request(app)
      .get('/api/official/team')
      .set('Authorization', `Bearer ${official.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.officials).toBeDefined();
  });

  it('citizen CANNOT see team', async () => {
    const citizen = await createTestCitizen();

    const res = await request(app)
      .get('/api/official/team')
      .set('Authorization', `Bearer ${citizen.accessToken}`);

    expect(res.status).toBe(403);
  });
});
