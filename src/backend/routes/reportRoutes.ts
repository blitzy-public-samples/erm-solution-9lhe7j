import { Router } from 'express';
import * as reportController from 'src/backend/controllers/reportController';
import { validate } from 'src/backend/middleware/validate';
import * as reportValidation from 'src/backend/validations/reportValidation';
import { authenticate, authorize } from 'src/backend/middleware/auth';
import { UserRole } from 'src/shared/types/index';

const router = Router();

// Get a paginated list of report configurations
router.get(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.Auditor]),
  validate(reportValidation.getReports),
  reportController.getReports
);

// Get a specific report configuration by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.Auditor]),
  validate(reportValidation.getReportById),
  reportController.getReportById
);

// Create a new report configuration
router.post(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager]),
  validate(reportValidation.createReport),
  reportController.createReport
);

// Update an existing report configuration
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager]),
  validate(reportValidation.updateReport),
  reportController.updateReport
);

// Delete a report configuration
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager]),
  validate(reportValidation.deleteReport),
  reportController.deleteReport
);

// Generate a report based on a specific configuration
router.post(
  '/:id/generate',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.Auditor]),
  validate(reportValidation.generateReport),
  reportController.generateReport
);

// Get a list of available report templates
router.get(
  '/templates',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.Auditor]),
  reportController.getReportTemplates
);

export default router;