import { Assessment } from '../models/Assessment';
import { Risk } from '../models/Risk';
import { User } from '../models/User';
import { Likelihood } from '../models/Likelihood';
import { Impact } from '../models/Impact';
import { ApiError } from '../utils/ApiError';
import { PaginatedResponse } from '../../shared/types';
import { riskService } from './riskService';

export const assessmentService = {
  async getAssessments(page: number, pageSize: number, filters: object): Promise<PaginatedResponse<Assessment>> {
    const offset = (page - 1) * pageSize;
    const where = { ...filters };

    const [assessments, totalCount] = await Promise.all([
      Assessment.findAll({
        where,
        limit: pageSize,
        offset,
        include: [{ model: Risk }, { model: User }, { model: Likelihood }, { model: Impact }],
      }),
      Assessment.count({ where }),
    ]);

    return {
      items: assessments,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  },

  async getAssessmentById(id: number): Promise<Assessment> {
    const assessment = await Assessment.findByPk(id, {
      include: [{ model: Risk }, { model: User }, { model: Likelihood }, { model: Impact }],
    });

    if (!assessment) {
      throw new ApiError(404, 'Assessment not found');
    }

    return assessment;
  },

  async createAssessment(assessmentData: Partial<Assessment>): Promise<Assessment> {
    const { riskId, assessorId, likelihoodId, impactId } = assessmentData;

    const [risk, assessor, likelihood, impact] = await Promise.all([
      Risk.findByPk(riskId),
      User.findByPk(assessorId),
      Likelihood.findByPk(likelihoodId),
      Impact.findByPk(impactId),
    ]);

    if (!risk) throw new ApiError(404, 'Associated risk not found');
    if (!assessor) throw new ApiError(404, 'Assessor not found');
    if (!likelihood) throw new ApiError(404, 'Likelihood not found');
    if (!impact) throw new ApiError(404, 'Impact not found');

    const assessment = await Assessment.create(assessmentData);

    await riskService.updateRiskScore(risk.id);
    await riskService.updateRiskStatus(risk.id);

    return assessment;
  },

  async updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment> {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new ApiError(404, 'Assessment not found');

    const { riskId, assessorId, likelihoodId, impactId } = assessmentData;

    if (riskId) {
      const risk = await Risk.findByPk(riskId);
      if (!risk) throw new ApiError(404, 'Associated risk not found');
    }

    if (assessorId) {
      const assessor = await User.findByPk(assessorId);
      if (!assessor) throw new ApiError(404, 'Assessor not found');
    }

    if (likelihoodId) {
      const likelihood = await Likelihood.findByPk(likelihoodId);
      if (!likelihood) throw new ApiError(404, 'Likelihood not found');
    }

    if (impactId) {
      const impact = await Impact.findByPk(impactId);
      if (!impact) throw new ApiError(404, 'Impact not found');
    }

    await assessment.update(assessmentData);

    await riskService.updateRiskScore(assessment.riskId);
    await riskService.updateRiskStatus(assessment.riskId);

    return assessment;
  },

  async deleteAssessment(id: number): Promise<void> {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new ApiError(404, 'Assessment not found');

    const riskId = assessment.riskId;

    await assessment.destroy();

    await riskService.updateRiskScore(riskId);
    await riskService.updateRiskStatus(riskId);
  },

  async getLatestAssessmentForRisk(riskId: number): Promise<Assessment | null> {
    const latestAssessment = await Assessment.findOne({
      where: { riskId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Likelihood }, { model: Impact }],
    });

    return latestAssessment;
  },
};