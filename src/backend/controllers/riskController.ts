import { Request, Response, NextFunction } from 'express';
import { Risk } from '../models/Risk';
import { RiskCategory } from '../models/RiskCategory';
import { User } from '../models/User';
import { ApiResponse, RiskStatus, PaginatedResponse } from '../../shared/types';

export const riskController = {
  getRisks: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const risks = await Risk.findAndCountAll({
        where: filters,
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

      const response: PaginatedResponse<Risk> = {
        items: risks.rows,
        total: risks.count,
        page,
        pageSize: limit,
        totalPages: Math.ceil(risks.count / limit),
      };

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  },

  getRiskById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const riskId = parseInt(req.params.id);
      const risk = await Risk.findByPk(riskId);

      if (!risk) {
        res.status(404).json({ success: false, message: 'Risk not found' });
        return;
      }

      res.status(200).json({ success: true, data: risk });
    } catch (error) {
      next(error);
    }
  },

  createRisk: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const riskData = req.body;

      // Validate risk data
      if (!riskData.title || !riskData.description || !riskData.categoryId || !riskData.ownerId) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      // Check if risk category exists
      const category = await RiskCategory.findByPk(riskData.categoryId);
      if (!category) {
        res.status(400).json({ success: false, message: 'Invalid risk category' });
        return;
      }

      // Check if risk owner exists
      const owner = await User.findByPk(riskData.ownerId);
      if (!owner) {
        res.status(400).json({ success: false, message: 'Invalid risk owner' });
        return;
      }

      const newRisk = await Risk.create(riskData);
      res.status(201).json({ success: true, data: newRisk });
    } catch (error) {
      next(error);
    }
  },

  updateRisk: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const riskId = parseInt(req.params.id);
      const riskData = req.body;

      const risk = await Risk.findByPk(riskId);
      if (!risk) {
        res.status(404).json({ success: false, message: 'Risk not found' });
        return;
      }

      if (riskData.categoryId) {
        const category = await RiskCategory.findByPk(riskData.categoryId);
        if (!category) {
          res.status(400).json({ success: false, message: 'Invalid risk category' });
          return;
        }
      }

      if (riskData.ownerId) {
        const owner = await User.findByPk(riskData.ownerId);
        if (!owner) {
          res.status(400).json({ success: false, message: 'Invalid risk owner' });
          return;
        }
      }

      await risk.update(riskData);
      res.status(200).json({ success: true, data: risk });
    } catch (error) {
      next(error);
    }
  },

  deleteRisk: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const riskId = parseInt(req.params.id);
      const risk = await Risk.findByPk(riskId);

      if (!risk) {
        res.status(404).json({ success: false, message: 'Risk not found' });
        return;
      }

      await risk.destroy();
      res.status(200).json({ success: true, message: 'Risk deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};