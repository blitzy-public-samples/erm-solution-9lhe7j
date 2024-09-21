import request from 'supertest';
import app from 'src/backend/app';
import User from 'src/backend/models/User';
import jwt from 'jsonwebtoken';
import config from 'src/backend/config/config';

const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  role: 'RiskManager'
};

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to the test database
    await connectToTestDatabase();
    // Clear the User collection
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clear the User collection
    await User.deleteMany({});
    // Disconnect from the test database
    await disconnectFromTestDatabase();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('email', testUser.email);
    expect(response.body.user).toHaveProperty('name', testUser.name);
    expect(response.body.user).toHaveProperty('role', testUser.role);
    expect(response.body.user).not.toHaveProperty('password');

    const savedUser = await User.findOne({ email: testUser.email });
    expect(savedUser).toBeTruthy();
  });

  it('should not register a user with an existing email', async () => {
    // Register the test user first
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Attempt to register again with the same email
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Email already exists');
  });

  it('should login a user and return a valid JWT', async () => {
    // Register the test user first
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    const decodedToken = jwt.verify(response.body.token, config.jwtSecret);
    expect(decodedToken).toHaveProperty('id');
    expect(decodedToken).toHaveProperty('email', testUser.email);
  });

  it('should not login with incorrect credentials', async () => {
    // Register the test user first
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid credentials');
  });

  it('should logout a user', async () => {
    // Register and login the test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const token = loginResponse.body.token;

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toHaveProperty('message');
    expect(logoutResponse.body.message).toContain('Logged out successfully');

    // Attempt to use the same token for an authenticated request
    const authenticatedResponse = await request(app)
      .get('/api/some-protected-route')
      .set('Authorization', `Bearer ${token}`);

    expect(authenticatedResponse.status).toBe(401);
  });

  it('should change user password', async () => {
    // Register and login the test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const token = loginResponse.body.token;
    const newPassword = 'NewTestPassword123!';

    const changePasswordResponse = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: testUser.password,
        newPassword: newPassword
      });

    expect(changePasswordResponse.status).toBe(200);

    // Attempt to login with the old password
    const oldPasswordLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(oldPasswordLoginResponse.status).toBe(401);

    // Login with the new password
    const newPasswordLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword
      });

    expect(newPasswordLoginResponse.status).toBe(200);
    expect(newPasswordLoginResponse.body).toHaveProperty('token');
  });
});