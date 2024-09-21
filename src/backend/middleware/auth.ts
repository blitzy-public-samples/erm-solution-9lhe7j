import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/config';
import { UserRole } from '../../shared/types/index';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Invalid token format');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    if (!decoded) {
      throw new ApiError(401, 'Invalid token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'User not authorized');
    }

    next();
  };
};