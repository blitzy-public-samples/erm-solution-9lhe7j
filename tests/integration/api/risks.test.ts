import request from 'supertest';
import app from 'src/backend/app';
import { Risk } from 'src/backend/models/Risk';
import { User } from 'src/backend/models/User';
import { RiskCategory } from 'src/backend/models/RiskCategory';
import jwt from 'jsonwebtoken';
import config from 'src/backend/config/config';

const testUser = {
  email: 'riskmanager@example.com',
  password: 'RiskManager123!',
  name: 'Risk Manager',
  role: 'RiskManager'
};

const testRisk = {
  title: 'Test Risk',
  description: 'This is a test risk for integration testing',
  status: 'IDENTIFIED',
  categoryId: null,
  ownerId: null
};

let authToken: string;
let testUserId: string;
let testCategoryId: string;

describe('Risks API', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Risk.deleteMany({});
    await RiskCategory.deleteMany({});

    const user = await User.create(testUser);
    testUserId = user._id.toString();

    const category = await RiskCategory.create({ name: 'Test Category' });
    testCategoryId = category._id.toString();

    authToken = jwt.sign({ userId: testUserId }, config.jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Risk.deleteMany({});
    await RiskCategory.deleteMany({});
  });

  it('should create a new risk', async () => {
    const response = await request(app)
      .post('/api/risks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...testRisk, categoryId: testCategoryId, ownerId: testUserId });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(testRisk.title);
    expect(response.body.description).toBe(testRisk.description);
    expect(response.body.status).toBe(testRisk.status);
    expect(response.body.categoryId).toBe(testCategoryId);
    expect(response.body.ownerId).toBe(testUserId);

    const savedRisk = await Risk.findById(response.body.id);
    expect(savedRisk).toBeTruthy();
  });

  it('should get all risks', async () => {
    await Risk.create([
      { ...testRisk, categoryId: testCategoryId, ownerId: testUserId },
      { ...testRisk, title: 'Another Risk', categoryId: testCategoryId, ownerId: testUserId }
    ]);

    const response = await request(app)
      .get('/api/risks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should get a single risk by ID', async () => {
    const risk = await Risk.create({ ...testRisk, categoryId: testCategoryId, ownerId: testUserId });

    const response = await request(app)
      .get(`/api/risks/${risk._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(risk._id.toString());
    expect(response.body.title).toBe(risk.title);
  });

  it('should update an existing risk', async () => {
    const risk = await Risk.create({ ...testRisk, categoryId: testCategoryId, ownerId: testUserId });
    const updatedData = { title: 'Updated Risk Title' };

    const response = await request(app)
      .put(`/api/risks/${risk._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedData.title);

    const updatedRisk = await Risk.findById(risk._id);
    expect(updatedRisk?.title).toBe(updatedData.title);
  });

  it('should delete a risk', async () => {
    const risk = await Risk.create({ ...testRisk, categoryId: testCategoryId, ownerId: testUserId });

    const response = await request(app)
      .delete(`/api/risks/${risk._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);

    const deletedRisk = await Risk.findById(risk._id);
    expect(deletedRisk).toBeNull();
  });

  it('should handle errors when getting a non-existent risk', async () => {
    const nonExistentId = '5f5e7f5c9d5d5e5d5c5b5a5a';
    const response = await request(app)
      .get(`/api/risks/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('not found');
  });

  it('should handle validation errors when creating a risk', async () => {
    const invalidRisk = { title: '' };

    const response = await request(app)
      .post('/api/risks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidRisk);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it('should enforce authentication for risk operations', async () => {
    const responses = await Promise.all([
      request(app).get('/api/risks'),
      request(app).post('/api/risks').send(testRisk),
      request(app).get(`/api/risks/${testUserId}`),
      request(app).put(`/api/risks/${testUserId}`).send({ title: 'Updated' }),
      request(app).delete(`/api/risks/${testUserId}`)
    ]);

    responses.forEach(response => {
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('authentication');
    });
  });
});