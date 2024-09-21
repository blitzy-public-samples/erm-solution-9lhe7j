import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { ApiResponse, UserRole, PaginatedResponse } from '../../shared/types';
import bcrypt from 'bcrypt';

export const userController = {
  getUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const offset = (page - 1) * pageSize;

      const [users, totalCount] = await Promise.all([
        User.findAll({
          where: filters,
          limit: pageSize,
          offset: offset,
          attributes: { exclude: ['password'] }
        }),
        User.count({ where: filters })
      ]);

      const response: PaginatedResponse<User> = {
        data: users,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      };

      res.status(200).json({ success: true, ...response });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, organizationId, role } = req.body;

      // Input validation
      if (!email || !password || !name || !organizationId || !role) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'User with this email already exists' });
        return;
      }

      // Check if organization exists
      const organization = await Organization.findByPk(organizationId);
      if (!organization) {
        res.status(404).json({ success: false, message: 'Organization not found' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await User.create({
        email,
        password: hashedPassword,
        name,
        organizationId,
        role
      });

      const userWithoutPassword = { ...newUser.get(), password: undefined };
      res.status(201).json({ success: true, data: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { email, password, name, organizationId, role } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Check email uniqueness if it's being updated
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          res.status(409).json({ success: false, message: 'Email already in use' });
          return;
        }
      }

      // Check organization if it's being updated
      if (organizationId && organizationId !== user.organizationId) {
        const organization = await Organization.findByPk(organizationId);
        if (!organization) {
          res.status(404).json({ success: false, message: 'Organization not found' });
          return;
        }
      }

      // Update user fields
      user.email = email || user.email;
      user.name = name || user.name;
      user.organizationId = organizationId || user.organizationId;
      user.role = role || user.role;

      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      const userWithoutPassword = { ...user.get(), password: undefined };
      res.status(200).json({ success: true, data: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await User.findByPk(userId);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      await user.destroy();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  updateUserRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid user role' });
        return;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      user.role = role;
      await user.save();

      res.status(200).json({ success: true, data: { id: user.id, role: user.role } });
    } catch (error) {
      next(error);
    }
  }
};