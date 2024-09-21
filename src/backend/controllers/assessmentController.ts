import { Request, Response, NextFunction } from 'express';
import { Assessment } from '../models/Assessment';
import { Risk } from '../models/Risk';
import { User } from '../models/User';
import { Likelihood } from '../models/Likelihood';
import { Impact } from '../models/Impact';
import { ApiResponse, PaginatedResponse } from '../../shared/types';

export const assessmentController = {
  async getAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const { rows, count } = await Assessment.findAndCountAll({
        where: filters,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        include: [{ model: Risk }, { model: User }, { model: Likelihood }, { model: Impact }],
      });

      const response: PaginatedResponse<Assessment> = {
        items: rows,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };

      res.json({ success: true, data: response } as ApiResponse<PaginatedResponse<Assessment>>);
    } catch (error) {
      next(error);
    }
  },

  async getAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessmentId = parseInt(req.params.id);
      const assessment = await Assessment.findByPk(assessmentId, {
        include: [{ model: Risk }, { model: User }, { model: Likelihood }, { model: Impact }],
      });

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' } as ApiResponse<null>);
        return;
      }

      res.json({ success: true, data: assessment } as ApiResponse<Assessment>);
    } catch (error) {
      next(error);
    }
  },

  async createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessmentData = req.body;

      // Validate assessment data
      // TODO: Implement input validation

      // Check if associated entities exist
      const [risk, assessor, likelihood, impact] = await Promise.all([
        Risk.findByPk(assessmentData.riskId),
        User.findByPk(assessmentData.assessorId),
        Likelihood.findByPk(assessmentData.likelihoodId),
        Impact.findByPk(assessmentData.impactId),
      ]);

      if (!risk || !assessor || !likelihood || !impact) {
        res.status(400).json({ success: false, message: 'Invalid associated entities' } as ApiResponse<null>);
        return;
      }

      const assessment = await Assessment.create(assessmentData);

      // Update risk status if necessary
      // TODO: Implement risk status update logic

      res.status(201).json({ success: true, data: assessment } as ApiResponse<Assessment>);
    } catch (error) {
      next(error);
    }
  },

  async updateAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessmentId = parseInt(req.params.id);
      const assessmentData = req.body;

      // Validate assessment data
      // TODO: Implement input validation

      const assessment = await Assessment.findByPk(assessmentId);

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' } as ApiResponse<null>);
        return;
      }

      // Check if associated entities exist
      if (assessmentData.riskId || assessmentData.assessorId || assessmentData.likelihoodId || assessmentData.impactId) {
        const [risk, assessor, likelihood, impact] = await Promise.all([
          assessmentData.riskId ? Risk.findByPk(assessmentData.riskId) : null,
          assessmentData.assessorId ? User.findByPk(assessmentData.assessorId) : null,
          assessmentData.likelihoodId ? Likelihood.findByPk(assessmentData.likelihoodId) : null,
          assessmentData.impactId ? Impact.findByPk(assessmentData.impactId) : null,
        ]);

        if (
          (assessmentData.riskId && !risk) ||
          (assessmentData.assessorId && !assessor) ||
          (assessmentData.likelihoodId && !likelihood) ||
          (assessmentData.impactId && !impact)
        ) {
          res.status(400).json({ success: false, message: 'Invalid associated entities' } as ApiResponse<null>);
          return;
        }
      }

      await assessment.update(assessmentData);

      // Update risk status if necessary
      // TODO: Implement risk status update logic

      res.json({ success: true, data: assessment } as ApiResponse<Assessment>);
    } catch (error) {
      next(error);
    }
  },

  async deleteAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessmentId = parseInt(req.params.id);
      const assessment = await Assessment.findByPk(assessmentId);

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' } as ApiResponse<null>);
        return;
      }

      await assessment.destroy();

      // Update risk status if necessary
      // TODO: Implement risk status update logic

      res.json({ success: true, message: 'Assessment deleted successfully' } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  },
};