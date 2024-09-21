import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/backend/app';
import { User } from '../../src/backend/models/User';
import { authenticate, authorize } from '../../src/backend/middleware/auth';
import { config } from '../../src/backend/config/config';

const mockUser = {
  id: 'mockUserId',
  email: 'test@example.com',
  role: 'RiskManager'
};

const mockToken = jwt.sign(mockUser, config.jwt.secret);

describe('Auth Middleware', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.create(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should authenticate a valid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${mockToken}`
      }
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(expect.objectContaining(mockUser));
  });

  it('should reject requests without a token', async () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 401,
      message: 'No token provided'
    }));
  });

  it('should reject requests with an invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 401,
      message: 'Invalid token'
    }));
  });

  it('should authorize a user with correct role', async () => {
    const req = {
      user: mockUser
    };
    const res = {};
    const next = jest.fn();

    authorize(['RiskManager'])(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should reject a user with incorrect role', async () => {
    const req = {
      user: { ...mockUser, role: 'User' }
    };
    const res = {};
    const next = jest.fn();

    authorize(['Admin'])(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 403,
      message: 'Unauthorized'
    }));
  });

  it('should handle expired tokens', async () => {
    const expiredToken = jwt.sign(mockUser, config.jwt.secret, { expiresIn: '0s' });
    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 401,
      message: 'Token expired'
    }));
  });
});