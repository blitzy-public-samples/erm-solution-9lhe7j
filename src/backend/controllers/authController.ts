import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/config';
import { ApiResponse, UserRole } from '../../shared/types/index';

const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      await user.update({ lastLogin: new Date() });

      const response: ApiResponse<{ token: string; user: Partial<User> }> = {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
        },
        message: 'Login successful',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }

      const newUser = await User.create({
        email,
        password,
        name,
        role: role || UserRole.RiskOwner,
      });

      const response: ApiResponse<Partial<User>> = {
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        message: 'User registered successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // For JWT-based authentication, we don't need to do anything server-side
      // The client should remove the token from storage

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Logout successful',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user.id; // Assuming the user ID is attached to the request by authentication middleware

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedNewPassword });

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Password changed successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};

export default authController;