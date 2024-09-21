import { Router } from 'express';
import * as userController from 'src/backend/controllers/userController';
import { validate } from 'src/backend/middleware/validate';
import * as userValidation from 'src/backend/validations/userValidation';
import { authenticate, authorize } from 'src/backend/middleware/auth';
import { UserRole } from 'src/shared/types/index';

const router = Router();

// Get a paginated list of users
router.get(
  '/',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.getUsers),
  userController.getUsers
);

// Get a specific user by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.getUserById),
  userController.getUserById
);

// Create a new user
router.post(
  '/',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.createUser),
  userController.createUser
);

// Update an existing user
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.updateUser),
  userController.updateUser
);

// Delete a user
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.deleteUser),
  userController.deleteUser
);

// Update a user's role
router.patch(
  '/:id/role',
  authenticate,
  authorize([UserRole.Admin]),
  validate(userValidation.updateUserRole),
  userController.updateUserRole
);

// Get the current authenticated user's profile
router.get('/me', authenticate, userController.getCurrentUser);

// Update the current authenticated user's profile
router.put(
  '/me',
  authenticate,
  validate(userValidation.updateCurrentUser),
  userController.updateCurrentUser
);

export default router;