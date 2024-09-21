import request from 'supertest';
import app from 'src/backend/app';
import { User } from 'src/backend/models/User';
import { authController } from 'src/backend/controllers/authController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from 'src/backend/config/config';

const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'RiskManager'
};

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.create({
      ...mockUser,
      password: await bcrypt.hash(mockUser.password, 10)
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user successfully', async () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'newpassword123',
      name: 'New User',
      role: 'RiskOwner'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('email', newUser.email);
    expect(response.body.user).toHaveProperty('name', newUser.name);
    expect(response.body.user).toHaveProperty('role', newUser.role);
    expect(response.body.user).not.toHaveProperty('password');

    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser).toBeTruthy();
  });

  it('should not register a user with an existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(mockUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Email already exists');
  });

  it('should login a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', mockUser.email);

    const decodedToken = jwt.verify(response.body.token, config.jwtSecret);
    expect(decodedToken).toHaveProperty('id');
    expect(decodedToken).toHaveProperty('email', mockUser.email);
  });

  it('should not login with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid credentials');
  });

  it('should logout a user successfully', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    const token = loginResponse.body.token;

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toHaveProperty('message');
    expect(logoutResponse.body.message).toContain('Logged out successfully');
  });

  it('should change user password successfully', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    const token = loginResponse.body.token;
    const newPassword = 'newpassword123';

    const changePasswordResponse = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: mockUser.password,
        newPassword: newPassword
      });

    expect(changePasswordResponse.status).toBe(200);
    expect(changePasswordResponse.body).toHaveProperty('message');
    expect(changePasswordResponse.body.message).toContain('Password changed successfully');

    const updatedUser = await User.findOne({ email: mockUser.email });
    const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password);
    expect(passwordMatch).toBe(true);
  });
});