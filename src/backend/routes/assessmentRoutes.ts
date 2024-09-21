import { Router } from 'express';
import * as assessmentController from 'src/backend/controllers/assessmentController';
import { validate } from 'src/backend/middleware/validate';
import * as assessmentValidation from 'src/backend/validations/assessmentValidation';
import { authenticate, authorize } from 'src/backend/middleware/auth';
import { UserRole } from 'src/shared/types/index';

const router = Router();

// Get a paginated list of assessments
router.get(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(assessmentValidation.getAssessments),
  assessmentController.getAssessments
);

// Get a specific assessment by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(assessmentValidation.getAssessmentById),
  assessmentController.getAssessmentById
);

// Create a new assessment
router.post(
  '/',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner]),
  validate(assessmentValidation.createAssessment),
  assessmentController.createAssessment
);

// Update an existing assessment
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner]),
  validate(assessmentValidation.updateAssessment),
  assessmentController.updateAssessment
);

// Delete an assessment
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager]),
  validate(assessmentValidation.deleteAssessment),
  assessmentController.deleteAssessment
);

// Get assessments for a specific risk
router.get(
  '/risk/:riskId',
  authenticate,
  authorize([UserRole.Admin, UserRole.RiskManager, UserRole.DepartmentHead, UserRole.RiskOwner, UserRole.Auditor]),
  validate(assessmentValidation.getAssessmentsByRisk),
  assessmentController.getAssessmentsByRisk
);

export default router;