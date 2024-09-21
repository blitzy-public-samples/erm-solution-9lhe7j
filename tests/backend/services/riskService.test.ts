import mongoose from 'mongoose';
import { riskService } from 'src/backend/services/riskService';
import { Risk } from 'src/backend/models/Risk';
import { RiskCategory } from 'src/backend/models/RiskCategory';
import { User } from 'src/backend/models/User';
import { ApiError } from 'src/backend/utils/ApiError';

const mockRisk = {
  title: "Test Risk",
  description: "This is a test risk",
  status: "IDENTIFIED",
  categoryId: "mockCategoryId",
  ownerId: "mockUserId"
};

const mockUser = {
  id: "mockUserId",
  name: "Test User",
  email: "test@example.com",
  role: "RiskManager"
};

const mockCategory = {
  id: "mockCategoryId",
  name: "Test Category",
  description: "This is a test category"
};

describe('Risk Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Risk.deleteMany({});
    await User.deleteMany({});
    await RiskCategory.deleteMany({});

    await User.create(mockUser);
    await RiskCategory.create(mockCategory);
    await Risk.create(mockRisk);
  });

  it('should get risks with pagination', async () => {
    const page = 1;
    const pageSize = 10;
    const result = await riskService.getRisks(page, pageSize);

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(page);
    expect(result.pageSize).toBe(pageSize);
  });

  it('should get a single risk by ID', async () => {
    const createdRisk = await Risk.findOne({ title: mockRisk.title });
    if (!createdRisk) throw new Error('Test risk not found');

    const result = await riskService.getRiskById(createdRisk._id);

    expect(result.title).toBe(mockRisk.title);
    expect(result.category.id).toBe(mockRisk.categoryId);
    expect(result.owner.id).toBe(mockRisk.ownerId);
  });

  it('should create a new risk', async () => {
    const newRiskData = {
      ...mockRisk,
      title: 'New Test Risk'
    };

    const result = await riskService.createRisk(newRiskData);

    expect(result.title).toBe(newRiskData.title);
    const savedRisk = await Risk.findById(result.id);
    expect(savedRisk).toBeTruthy();
  });

  it('should update an existing risk', async () => {
    const createdRisk = await Risk.findOne({ title: mockRisk.title });
    if (!createdRisk) throw new Error('Test risk not found');

    const updatedData = {
      ...mockRisk,
      title: 'Updated Test Risk'
    };

    const result = await riskService.updateRisk(createdRisk._id, updatedData);

    expect(result.title).toBe(updatedData.title);
    const updatedRisk = await Risk.findById(createdRisk._id);
    expect(updatedRisk?.title).toBe(updatedData.title);
  });

  it('should delete a risk', async () => {
    const createdRisk = await Risk.findOne({ title: mockRisk.title });
    if (!createdRisk) throw new Error('Test risk not found');

    await riskService.deleteRisk(createdRisk._id);

    const deletedRisk = await Risk.findById(createdRisk._id);
    expect(deletedRisk).toBeNull();
  });

  it('should throw an error when getting a non-existent risk', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await expect(riskService.getRiskById(nonExistentId)).rejects.toThrow(ApiError);
  });

  it('should throw an error when creating a risk with invalid data', async () => {
    const invalidRiskData = {
      ...mockRisk,
      title: '' // Invalid: empty title
    };

    await expect(riskService.createRisk(invalidRiskData)).rejects.toThrow(ApiError);
  });

  it('should calculate risk score correctly', async () => {
    const mockAssessment = {
      likelihood: { score: 3 },
      impact: { score: 4 }
    };

    const result = await riskService.calculateRiskScore(mockAssessment);

    expect(result).toBe(12); // 3 * 4 = 12
  });
});