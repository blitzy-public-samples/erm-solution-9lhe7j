import request from 'supertest';
import app from 'src/backend/app';
import { Risk } from 'src/backend/models/Risk';
import { riskController } from 'src/backend/controllers/riskController';
import { User } from 'src/backend/models/User';
import { RiskCategory } from 'src/backend/models/RiskCategory';

const mockRisk = {
  title: "Test Risk",
  description: "This is a test risk",
  status: "IDENTIFIED",
  categoryId: "mockCategoryId",
  ownerId: "mockUserId"
};

const mockUser = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
  role: "RiskManager"
};

const mockCategory = {
  name: "Test Category",
  description: "This is a test category"
};

describe('Risk Controller', () => {
  let testUser: User;
  let testCategory: RiskCategory;
  let testRisk: Risk;

  beforeEach(async () => {
    await Risk.deleteMany({});
    await User.deleteMany({});
    await RiskCategory.deleteMany({});

    testUser = await User.create(mockUser);
    testCategory = await RiskCategory.create({ ...mockCategory, organizationId: testUser.organizationId });
    testRisk = await Risk.create({ ...mockRisk, categoryId: testCategory.id, ownerId: testUser.id });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get all risks', async () => {
    const response = await request(app).get('/api/risks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toBe(testRisk.title);
  });

  it('should get a single risk by ID', async () => {
    const response = await request(app).get(`/api/risks/${testRisk.id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(testRisk.title);
    expect(response.body.description).toBe(testRisk.description);
  });

  it('should create a new risk', async () => {
    const newRisk = {
      title: "New Test Risk",
      description: "This is a new test risk",
      status: "IDENTIFIED",
      categoryId: testCategory.id,
      ownerId: testUser.id
    };

    const response = await request(app)
      .post('/api/risks')
      .send(newRisk);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(newRisk.title);
    
    const savedRisk = await Risk.findById(response.body.id);
    expect(savedRisk).toBeTruthy();
    expect(savedRisk!.title).toBe(newRisk.title);
  });

  it('should update an existing risk', async () => {
    const updatedData = {
      title: "Updated Test Risk",
      description: "This is an updated test risk"
    };

    const response = await request(app)
      .put(`/api/risks/${testRisk.id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedData.title);
    
    const updatedRisk = await Risk.findById(testRisk.id);
    expect(updatedRisk!.title).toBe(updatedData.title);
    expect(updatedRisk!.description).toBe(updatedData.description);
  });

  it('should delete a risk', async () => {
    const response = await request(app).delete(`/api/risks/${testRisk.id}`);
    expect(response.status).toBe(204);

    const deletedRisk = await Risk.findById(testRisk.id);
    expect(deletedRisk).toBeNull();
  });

  it('should handle errors when getting a non-existent risk', async () => {
    const nonExistentId = '5f7b5f9d8e1f8c001f1e1b1a';
    const response = await request(app).get(`/api/risks/${nonExistentId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Risk not found');
  });

  it('should handle validation errors when creating a risk', async () => {
    const invalidRisk = {
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/risks')
      .send(invalidRisk);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors.title).toBe('Title is required');
  });
});