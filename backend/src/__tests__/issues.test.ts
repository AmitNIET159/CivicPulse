import request from 'supertest';
import app from '../app';
import User from '../models/User';
import {
  setupTestDB, clearTestDB, teardownTestDB,
  createTestCitizen, createTestOfficial, createTestAdmin,
  createTestIssue,
} from './setup';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

const validIssueBody = {
  title: 'Pothole on Main Rd',
  description: 'A large pothole causing problems on the main road near the intersection area.',
  category: 'pothole',
  coordinates: { lat: 28.6139, lng: 77.209 },
  address: '123 Main Road, Delhi',
  ward: 'Ward-1',
  photos: [{ url: 'https://example.com/photo.jpg', publicId: 'test_id', thumbnail: 'https://example.com/thumb.jpg' }],
};

// ─── Issue Creation ─────────────────────────────────────────────────

describe('POST /api/issues', () => {
  it('creates issue successfully with valid data', async () => {
    const citizen = await createTestCitizen();
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(validIssueBody);
    expect(res.status).toBe(201);
    expect(res.body.issue).toBeDefined();
    expect(res.body.issue.title).toBe('Pothole on Main Rd');
    expect(res.body.issue.status).toBe('pending');
  });

  it('rejects creation without auth', async () => {
    const res = await request(app).post('/api/issues').send(validIssueBody);
    expect(res.status).toBe(401);
  });

  it('rejects missing description', async () => {
    const citizen = await createTestCitizen();
    const body = { ...validIssueBody, description: '' };
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('rejects missing coordinates', async () => {
    const citizen = await createTestCitizen();
    const { coordinates, ...rest } = validIssueBody;
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(rest);
    expect(res.status).toBe(400);
  });

  it('rejects missing photos', async () => {
    const citizen = await createTestCitizen();
    const body = { ...validIssueBody, photos: [] };
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('rejects invalid category', async () => {
    const citizen = await createTestCitizen();
    const body = { ...validIssueBody, category: 'invalid_cat' };
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('stores correct GeoJSON coordinates', async () => {
    const citizen = await createTestCitizen();
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(validIssueBody);
    expect(res.status).toBe(201);
    // GeoJSON: [lng, lat]
    expect(res.body.issue.location.coordinates[0]).toBe(77.209);
    expect(res.body.issue.location.coordinates[1]).toBe(28.6139);
  });

  it('increments reporter reportCount', async () => {
    const citizen = await createTestCitizen();
    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizen.accessToken}`)
      .send(validIssueBody);
    const user = await User.findById(citizen._id);
    expect(user!.reportCount).toBe(1);
  });
});

// ─── Issue Retrieval ────────────────────────────────────────────────

describe('GET /api/issues', () => {
  it('returns paginated list', async () => {
    const citizen = await createTestCitizen();
    await createTestIssue(citizen._id);
    await createTestIssue(citizen._id, { title: 'Second Issue' });

    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body.issues).toBeDefined();
    expect(res.body.issues.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('filters by category', async () => {
    const citizen = await createTestCitizen();
    await createTestIssue(citizen._id, { category: 'pothole' });
    await createTestIssue(citizen._id, { category: 'garbage' });

    const res = await request(app).get('/api/issues?category=pothole');
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(1);
    expect(res.body.issues[0].category).toBe('pothole');
  });

  it('filters by status', async () => {
    const citizen = await createTestCitizen();
    await createTestIssue(citizen._id, { status: 'pending' });
    await createTestIssue(citizen._id, { status: 'resolved' });

    const res = await request(app).get('/api/issues?status=pending');
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBe(1);
  });
});

describe('GET /api/issues/:id', () => {
  it('returns single issue', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app).get(`/api/issues/${issue._id}`);
    expect(res.status).toBe(200);
    expect(res.body.issue).toBeDefined();
    expect(res.body.issue._id).toBe(issue._id.toString());
  });

  it('returns 404 for non-existent issue', async () => {
    const res = await request(app).get('/api/issues/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});

// ─── Voting ─────────────────────────────────────────────────────────

describe('POST /api/issues/:id/vote', () => {
  it('vote increases voteCount', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .post(`/api/issues/${issue._id}/vote`)
      .set('Authorization', `Bearer ${citizen.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.voteCount).toBe(1);
    expect(res.body.isVoted).toBe(true);
  });

  it('second vote (toggle) removes vote', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    // Vote once
    await request(app)
      .post(`/api/issues/${issue._id}/vote`)
      .set('Authorization', `Bearer ${citizen.accessToken}`);

    // Vote again (toggle off)
    const res = await request(app)
      .post(`/api/issues/${issue._id}/vote`)
      .set('Authorization', `Bearer ${citizen.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.voteCount).toBe(0);
    expect(res.body.isVoted).toBe(false);
  });

  it('rejects vote without auth', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app).post(`/api/issues/${issue._id}/vote`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent issue', async () => {
    const citizen = await createTestCitizen();
    const res = await request(app)
      .post('/api/issues/507f1f77bcf86cd799439011/vote')
      .set('Authorization', `Bearer ${citizen.accessToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── Issue Deletion ─────────────────────────────────────────────────

describe('DELETE /api/issues/:id', () => {
  it('admin can delete issue', async () => {
    const admin = await createTestAdmin();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .delete(`/api/issues/${issue._id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(res.status).toBe(200);
  });

  it('citizen cannot delete issue', async () => {
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .delete(`/api/issues/${issue._id}`)
      .set('Authorization', `Bearer ${citizen.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('official cannot delete issue', async () => {
    const official = await createTestOfficial();
    const citizen = await createTestCitizen();
    const issue = await createTestIssue(citizen._id);

    const res = await request(app)
      .delete(`/api/issues/${issue._id}`)
      .set('Authorization', `Bearer ${official.accessToken}`);
    expect(res.status).toBe(403);
  });
});
