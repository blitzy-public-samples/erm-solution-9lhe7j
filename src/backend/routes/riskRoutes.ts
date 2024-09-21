import { Router } from 'express';
import * as riskController from 'src/backend/controllers/riskController';
import { validate } from 'src/backend/middleware/validate';
import * as riskValidation from 'src/backend/validations/riskValidation';
import { authenticate, authorize } from 'src/backend/middleware/auth';
import { UserRole } from 'src/shared/types/index';

const router = Router();

// Get a paginated list of risks
router.get(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(riskValidation.getRisks),
  riskController.getRisks
);

// Get a specific risk by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(riskValidation.getRiskById),
  riskController.getRiskById
);

// Create a new risk
router.post(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead]),
  validate(riskValidation.createRisk),
  riskController.createRisk
);

// Update an existing risk
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner]),
  validate(riskValidation.updateRisk),
  riskController.updateRisk
);

// Delete a risk
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager]),
  validate(riskValidation.deleteRisk),
  riskController.deleteRisk
);

// Get assessments for a specific risk
router.get(
  '/:id/assessments',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(riskValidation.getRiskAssessments),
  riskController.getRiskAssessments
);

// Get mitigation actions for a specific risk
router.get(
  '/:id/mitigations',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(riskValidation.getRiskMitigations),
  riskController.getRiskMitigations
);

export default router;