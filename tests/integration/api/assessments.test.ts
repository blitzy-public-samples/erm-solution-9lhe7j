import request from 'supertest';
import { app } from 'src/backend/app';
import { Assessment } from 'src/backend/models/Assessment';
import { Risk } from 'src/backend/models/Risk';
import { User } from 'src/backend/models/User';
import { Likelihood } from 'src/backend/models/Likelihood';
import { Impact } from 'src/backend/models/Impact';
import jwt from 'jsonwebtoken';
import config from 'src/backend/config/config';

const testUser = {
  email: 'assessor@example.com',
  password: 'Assessor123!',
  name: 'Test Assessor',
  role: 'RiskManager'
};

const testAssessment = {
  riskId: null,
  likelihoodId: null,
  impactId: null,
  assessmentDate: '2023-05-01T00:00:00Z',
  assessorId: null,
  notes: 'This is a test assessment for integration testing'
};

let authToken: string;
let testRisk: any;
let testLikelihood: any;
let testImpact: any;

describe('Assessments API', () => {
  beforeAll(async () => {
    await connectToTestDatabase();
    await clearTestCollections();
    const user = await User.create(testUser);
    testRisk = await Risk.create({ title: 'Test Risk', description: 'Test Description' });
    testLikelihood = await Likelihood.create({ level: 'Medium', score: 3 });
    testImpact = await Impact.create({ level: 'Moderate', score: 3 });
    testAssessment.riskId = testRisk.id;
    testAssessment.likelihoodId = testLikelihood.id;
    testAssessment.impactId = testImpact.id;
    testAssessment.assessorId = user.id;
    authToken = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);
  });

  afterAll(async () => {
    await clearTestCollections();
    await disconnectFromTestDatabase();
  });

  it('should create a new assessment', async () => {
    const response = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testAssessment);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.riskId).toBe(testAssessment.riskId);
    expect(response.body.likelihoodId).toBe(testAssessment.likelihoodId);
    expect(response.body.impactId).toBe(testAssessment.impactId);
    expect(response.body.assessorId).toBe(testAssessment.assessorId);
    expect(response.body.notes).toBe(testAssessment.notes);

    const savedAssessment = await Assessment.findById(response.body.id);
    expect(savedAssessment).toBeTruthy();
  });

  it('should get all assessments', async () => {
    await Assessment.create(testAssessment);
    await Assessment.create({ ...testAssessment, notes: 'Another test assessment' });

    const response = await request(app)
      .get('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('riskId');
    expect(response.body[0]).toHaveProperty('likelihoodId');
    expect(response.body[0]).toHaveProperty('impactId');
    expect(response.body[0]).toHaveProperty('assessorId');
    expect(response.body[0]).toHaveProperty('notes');
  });

  it('should get a single assessment by ID', async () => {
    const assessment = await Assessment.create(testAssessment);

    const response = await request(app)
      .get(`/api/assessments/${assessment.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(assessment.id);
    expect(response.body.riskId).toBe(testAssessment.riskId);
    expect(response.body.likelihoodId).toBe(testAssessment.likelihoodId);
    expect(response.body.impactId).toBe(testAssessment.impactId);
    expect(response.body.assessorId).toBe(testAssessment.assessorId);
    expect(response.body.notes).toBe(testAssessment.notes);
  });

  it('should update an existing assessment', async () => {
    const assessment = await Assessment.create(testAssessment);
    const updatedNotes = 'Updated test assessment notes';

    const response = await request(app)
      .put(`/api/assessments/${assessment.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...testAssessment, notes: updatedNotes });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(assessment.id);
    expect(response.body.notes).toBe(updatedNotes);

    const updatedAssessment = await Assessment.findById(assessment.id);
    expect(updatedAssessment?.notes).toBe(updatedNotes);
  });

  it('should delete an assessment', async () => {
    const assessment = await Assessment.create(testAssessment);

    const response = await request(app)
      .delete(`/api/assessments/${assessment.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);

    const deletedAssessment = await Assessment.findById(assessment.id);
    expect(deletedAssessment).toBeNull();
  });

  it('should handle errors when getting a non-existent assessment', async () => {
    const nonExistentId = '000000000000000000000000';

    const response = await request(app)
      .get(`/api/assessments/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('not found');
  });

  it('should handle validation errors when creating an assessment', async () => {
    const invalidAssessment = { ...testAssessment, riskId: null };

    const response = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidAssessment);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should enforce authentication for assessment operations', async () => {
    const responses = await Promise.all([
      request(app).get('/api/assessments'),
      request(app).post('/api/assessments').send(testAssessment),
      request(app).get(`/api/assessments/${testAssessment.id}`),
      request(app).put(`/api/assessments/${testAssessment.id}`).send(testAssessment),
      request(app).delete(`/api/assessments/${testAssessment.id}`)
    ]);

    responses.forEach(response => {
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('authentication');
    });
  });
});

// Helper functions (implement these based on your test setup)
async function connectToTestDatabase() {
  // Implementation to connect to the test database
}

async function clearTestCollections() {
  await Assessment.deleteMany({});
  await Risk.deleteMany({});
  await User.deleteMany({});
  await Likelihood.deleteMany({});
  await Impact.deleteMany({});
}

async function disconnectFromTestDatabase() {
  // Implementation to disconnect from the test database
}