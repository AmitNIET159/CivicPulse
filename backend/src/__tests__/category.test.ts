import request from 'supertest';
import app from '../app';
import { setupTestDB, clearTestDB, teardownTestDB, createTestCitizen } from './setup';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

const VALID_CATEGORIES = [
  'pothole',
  'streetlight',
  'garbage',
  'drainage',
  'water_supply',
  'encroachment',
  'noise',
  'stray_animals',
  'other'
];

describe('Phase 6 — Category Consistency Tests', () => {
  describe('Backend Validation', () => {
    let accessToken: string;
    
    beforeEach(async () => {
      const citizen = await createTestCitizen();
      accessToken = citizen.accessToken;
    });

    test.each(VALID_CATEGORIES)(
      'Should accept valid category: %s',
      async (category) => {
        const res = await request(app)
          .post('/api/issues')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: `Test ${category} issue`,
            description: `This is a test description for ${category} that meets length requirements.`,
            category,
            coordinates: { lat: 28.6139, lng: 77.2090 },
            address: 'Test Address',
            photos: [{ url: 'http://test.com/img.jpg', publicId: 'test_123', thumbnail: 'http://test.com/thumb.jpg' }]
          });

        if (res.status !== 201) console.log(res.body);
        expect(res.status).toBe(201);
        expect(res.body.issue.category).toBe(category);
      }
    );

    it('Should reject invalid category', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test invalid issue',
          description: 'This is a test description for an invalid category that meets length requirements.',
          category: 'invalid_category_xyz',
          coordinates: { lat: 28.6139, lng: 77.2090 },
          address: 'Test Address'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/invalid/i);
    });
  });

  describe('Filtering', () => {
    it('Should correctly filter issues by each category', async () => {
      const citizen = await createTestCitizen();
      const accessToken = citizen.accessToken;

      // Create one issue for each category
      for (const category of VALID_CATEGORIES) {
        await request(app)
          .post('/api/issues')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: `Filter test ${category}`,
            description: `Filter test description for ${category} meeting the limit.`,
            category,
            coordinates: { lat: 28.6139, lng: 77.2090 },
            photos: [{ url: 'http://test.com/img.jpg', publicId: 'test_123', thumbnail: 'http://test.com/thumb.jpg' }]
          });
      }

      // Verify filter works for each
      for (const category of VALID_CATEGORIES) {
        const res = await request(app)
          .get(`/api/issues?category=${category}`)
          .expect(200);

        expect(res.body.issues.length).toBeGreaterThan(0);
        expect(res.body.issues[0].category).toBe(category);
      }
    });
  });
});
