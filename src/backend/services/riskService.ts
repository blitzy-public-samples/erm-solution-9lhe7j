import { Risk } from '../models/Risk';
import { RiskCategory } from '../models/RiskCategory';
import { User } from '../models/User';
import { Assessment } from '../models/Assessment';
import { MitigationAction } from '../models/MitigationAction';
import { ApiError } from '../utils/ApiError';
import { PaginatedResponse, RiskStatus } from '../../shared/types/index';

export const riskService = {
  async getRisks(page: number, pageSize: number, filters: object): Promise<PaginatedResponse<Risk>> {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = { ...filters };

      const risks = await Risk.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [['createdAt', 'DESC']],
      });

      const totalCount = await Risk.count({ where: whereClause });

      return {
        items: risks,
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      throw new ApiError(500, 'Error retrieving risks');
    }
  },

  async getRiskById(id: number): Promise<Risk> {
    const risk = await Risk.findByPk(id);
    if (!risk) {
      throw new ApiError(404, 'Risk not found');
    }
    return risk;
  },

  async createRisk(riskData: Partial<Risk>): Promise<Risk> {
    try {
      if (riskData.categoryId) {
        const category = await RiskCategory.findByPk(riskData.categoryId);
        if (!category) {
          throw new ApiError(400, 'Invalid risk category');
        }
      }

      if (riskData.ownerId) {
        const owner = await User.findByPk(riskData.ownerId);
        if (!owner) {
          throw new ApiError(400, 'Invalid risk owner');
        }
      }

      const risk = await Risk.create(riskData);
      return risk;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error creating risk');
    }
  },

  async updateRisk(id: number, riskData: Partial<Risk>): Promise<Risk> {
    const risk = await Risk.findByPk(id);
    if (!risk) {
      throw new ApiError(404, 'Risk not found');
    }

    try {
      if (riskData.categoryId) {
        const category = await RiskCategory.findByPk(riskData.categoryId);
        if (!category) {
          throw new ApiError(400, 'Invalid risk category');
        }
      }

      if (riskData.ownerId) {
        const owner = await User.findByPk(riskData.ownerId);
        if (!owner) {
          throw new ApiError(400, 'Invalid risk owner');
        }
      }

      await risk.update(riskData);
      return risk;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error updating risk');
    }
  },

  async deleteRisk(id: number): Promise<void> {
    const risk = await Risk.findByPk(id);
    if (!risk) {
      throw new ApiError(404, 'Risk not found');
    }

    try {
      await Assessment.destroy({ where: { riskId: id } });
      await MitigationAction.destroy({ where: { riskId: id } });
      await risk.destroy();
    } catch (error) {
      throw new ApiError(500, 'Error deleting risk');
    }
  },

  async calculateRiskScore(riskId: number): Promise<number> {
    const latestAssessment = await Assessment.findOne({
      where: { riskId },
      order: [['createdAt', 'DESC']],
    });

    if (!latestAssessment) {
      throw new ApiError(404, 'No assessment found for this risk');
    }

    // Implement your risk score calculation logic here
    // This is a placeholder implementation
    const riskScore = latestAssessment.likelihood * latestAssessment.impact;
    return riskScore;
  },

  async updateRiskStatus(riskId: number, newStatus: RiskStatus): Promise<Risk> {
    const risk = await Risk.findByPk(riskId);
    if (!risk) {
      throw new ApiError(404, 'Risk not found');
    }

    if (!Object.values(RiskStatus).includes(newStatus)) {
      throw new ApiError(400, 'Invalid risk status');
    }

    try {
      await risk.update({ status: newStatus });
      return risk;
    } catch (error) {
      throw new ApiError(500, 'Error updating risk status');
    }
  },
};