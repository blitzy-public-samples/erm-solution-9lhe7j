import request from 'supertest';
import { app } from 'src/backend/app';
import { Report } from 'src/backend/models/Report';
import { User } from 'src/backend/models/User';
import { Risk } from 'src/backend/models/Risk';
import { Assessment } from 'src/backend/models/Assessment';
import jwt from 'jsonwebtoken';
import config from 'src/backend/config/config';

const testUser = {
  email: 'reporter@example.com',
  password: 'Reporter123!',
  name: 'Test Reporter',
  role: 'RiskManager'
};

const testReportConfig = {
  name: 'Test Report',
  description: 'This is a test report configuration for integration testing',
  type: 'RiskSummary',
  filters: {
    status: ['IDENTIFIED', 'ASSESSED'],
    dateRange: {
      start: '2023-01-01',
      end: '2023-12-31'
    }
  },
  format: 'PDF'
};

let authToken: string;

describe('Reports API', () => {
  beforeAll(async () => {
    await connectToTestDatabase();
    await clearCollections();
    const user = await User.create(testUser);
    authToken = jwt.sign({ id: user.id }, config.jwtSecret);
    await createSampleData();
  });

  afterAll(async () => {
    await clearCollections();
    await disconnectFromTestDatabase();
  });

  it('should create a new report configuration', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testReportConfig);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(testReportConfig.name);

    const savedConfig = await Report.findById(response.body.id);
    expect(savedConfig).toBeTruthy();
  });

  it('should get all report configurations', async () => {
    await Report.create(testReportConfig);
    await Report.create({ ...testReportConfig, name: 'Another Test Report' });

    const response = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should get a single report configuration by ID', async () => {
    const createdConfig = await Report.create(testReportConfig);

    const response = await request(app)
      .get(`/api/reports/${createdConfig.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdConfig.id);
    expect(response.body.name).toBe(testReportConfig.name);
  });

  it('should update an existing report configuration', async () => {
    const createdConfig = await Report.create(testReportConfig);
    const updatedConfig = { ...testReportConfig, name: 'Updated Test Report' };

    const response = await request(app)
      .put(`/api/reports/${createdConfig.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedConfig);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedConfig.name);

    const savedConfig = await Report.findById(createdConfig.id);
    expect(savedConfig?.name).toBe(updatedConfig.name);
  });

  it('should delete a report configuration', async () => {
    const createdConfig = await Report.create(testReportConfig);

    const response = await request(app)
      .delete(`/api/reports/${createdConfig.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);

    const deletedConfig = await Report.findById(createdConfig.id);
    expect(deletedConfig).toBeNull();
  });

  it('should generate a report based on a configuration', async () => {
    const createdConfig = await Report.create(testReportConfig);

    const response = await request(app)
      .post(`/api/reports/${createdConfig.id}/generate`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reportUrl');
    // Additional checks for report content would depend on the implementation details
  });

  it('should handle errors when getting a non-existent report configuration', async () => {
    const nonExistentId = '000000000000000000000000';

    const response = await request(app)
      .get(`/api/reports/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('should handle validation errors when creating a report configuration', async () => {
    const invalidConfig = { ...testReportConfig, name: '' };

    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidConfig);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should enforce authentication for report operations', async () => {
    const responses = await Promise.all([
      request(app).get('/api/reports'),
      request(app).post('/api/reports').send(testReportConfig),
      request(app).get(`/api/reports/${testReportConfig.id}`),
      request(app).put(`/api/reports/${testReportConfig.id}`).send(testReportConfig),
      request(app).delete(`/api/reports/${testReportConfig.id}`),
      request(app).post(`/api/reports/${testReportConfig.id}/generate`)
    ]);

    responses.forEach(response => {
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
});

async function connectToTestDatabase() {
  // Implementation depends on your database setup
}

async function disconnectFromTestDatabase() {
  // Implementation depends on your database setup
}

async function clearCollections() {
  await Report.deleteMany({});
  await User.deleteMany({});
  await Risk.deleteMany({});
  await Assessment.deleteMany({});
}

async function createSampleData() {
  // Create sample risks and assessments for report generation
  // Implementation depends on your data model
}