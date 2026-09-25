import request from 'supertest';
import app from '../app';
import {
  setupTestDB, clearTestDB, teardownTestDB,
  createTestCitizen,
} from './setup';

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await teardownTestDB(); });

// ─── Registration ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('registers a citizen successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'alice@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.role).toBe('citizen');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    // password must never be returned
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'dup@test.com', password: 'pass1234',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice2', email: 'dup@test.com', password: 'pass5678',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'x@test.com', password: 'pass1234',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'X', email: 'not-an-email', password: 'pass1234',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects short password (<6 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'a@test.com', password: '123',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── Login ──────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Register a user so we can log in
    await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'bob@test.com', password: 'pass1234',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe('bob@test.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(401);
  });
});

// ─── Token Refresh ──────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('refreshes token successfully', async () => {
    // Register to get a real stored refresh token
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Carol', email: 'carol@test.com', password: 'pass1234',
    });
    const { refreshToken } = reg.body;

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({
      refreshToken: 'totally-invalid-token',
    });
    // Phase 2 bug fix: Invalid JWT now returns 401 instead of 500
    expect(res.status).toBe(401);
  });

  it('rejects expired refresh token', async () => {
    // Generate an intentionally expired token
    const jwt = await import('jsonwebtoken');
    const expiredToken = jwt.sign({ userId: '123' }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '-1h' });
    
    const res = await request(app).post('/api/auth/refresh').send({
      refreshToken: expiredToken,
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it('rejects missing refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

// ─── Get Me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const citizen = await createTestCitizen();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${citizen.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(citizen.email);
  });

  it('rejects without auth token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

// ─── Logout ─────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('logs out successfully', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Dave', email: 'dave@test.com', password: 'pass1234',
    });
    const { accessToken, refreshToken } = reg.body;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(res.status).toBe(200);
  });

  it('rejects logout without auth', async () => {
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: 'x' });
    expect(res.status).toBe(401);
  });
});
