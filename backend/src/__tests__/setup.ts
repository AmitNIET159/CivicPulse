import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import User from '../models/User';

let mongoServer: MongoMemoryServer;

// Set required env vars for tests
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-jest';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jest';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';

/**
 * Connect to in-memory MongoDB before all tests in a suite.
 */
export async function setupTestDB(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

/**
 * Clear all collections between tests.
 */
export async function clearTestDB(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Disconnect and stop in-memory MongoDB after all tests.
 */
export async function teardownTestDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

// ─── Test Data Helpers ───────────────────────────────────────────────

export interface TestUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a citizen user and return credentials.
 */
export async function createTestCitizen(overrides: Partial<{ name: string; email: string; password: string }> = {}): Promise<TestUser> {
  const data = {
    name: overrides.name || 'Test Citizen',
    email: overrides.email || `citizen-${Date.now()}@test.com`,
    password: overrides.password || 'password123',
    role: 'citizen',
    isVerified: true,
  };

  const user = new User(data);
  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: 900 }
  );
  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: 604800 }
  );

  return {
    _id: user._id.toString(),
    name: data.name,
    email: data.email,
    role: user.role,
    accessToken,
    refreshToken,
  };
}

/**
 * Create a verified official user and return credentials.
 */
export async function createTestOfficial(overrides: Partial<{ name: string; email: string; ward: string; department: string }> = {}): Promise<TestUser> {
  const data = {
    name: overrides.name || 'Test Official',
    email: overrides.email || `official-${Date.now()}@test.com`,
    password: 'password123',
    role: 'official' as const,
    ward: overrides.ward || 'Ward-1',
    department: overrides.department || 'Public Works',
    isVerified: true,
  };

  const user = new User(data);
  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: 900 }
  );
  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: 604800 }
  );

  return {
    _id: user._id.toString(),
    name: data.name,
    email: data.email,
    role: user.role,
    accessToken,
    refreshToken,
  };
}

/**
 * Create an admin user and return credentials.
 */
export async function createTestAdmin(overrides: Partial<{ name: string; email: string }> = {}): Promise<TestUser> {
  const data = {
    name: overrides.name || 'Test Admin',
    email: overrides.email || `admin-${Date.now()}@test.com`,
    password: 'password123',
    role: 'admin' as const,
    isVerified: true,
  };

  const user = new User(data);
  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: 900 }
  );
  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: 604800 }
  );

  return {
    _id: user._id.toString(),
    name: data.name,
    email: data.email,
    role: user.role,
    accessToken,
    refreshToken,
  };
}

/**
 * Create a test issue via direct model insertion.
 */
export async function createTestIssue(reportedBy: string, overrides: Partial<any> = {}): Promise<any> {
  const Issue = (await import('../models/Issue')).default;

  const issueData = {
    title: overrides.title || 'Test Pothole Issue',
    description: overrides.description || 'A large pothole on the main road causing traffic problems.',
    category: overrides.category || 'pothole',
    location: overrides.location || {
      type: 'Point',
      coordinates: [77.209, 28.6139], // [lng, lat] — Delhi
    },
    address: overrides.address || '123 Test Street, Delhi',
    ward: overrides.ward || 'Ward-1',
    photos: overrides.photos || [{ url: 'https://example.com/photo.jpg', publicId: 'test123', thumbnail: 'https://example.com/thumb.jpg' }],
    reportedBy,
    status: overrides.status || 'pending',
    priority: overrides.priority ?? 30,
    statusHistory: overrides.statusHistory || [
      { status: 'pending', changedBy: reportedBy, changedAt: new Date(), note: 'Issue reported' },
    ],
    ...overrides,
  };

  const issue = new Issue(issueData);
  await issue.save();
  return issue;
}
