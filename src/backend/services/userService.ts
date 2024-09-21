import { User } from 'src/backend/models/User';
import { Organization } from 'src/backend/models/Organization';
import { ApiError } from 'src/backend/utils/ApiError';
import { PaginatedResponse, UserRole } from 'src/shared/types/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'src/backend/config/config';

export const userService = {
  async getUsers(page: number, pageSize: number, filters: object): Promise<PaginatedResponse<User>> {
    const offset = (page - 1) * pageSize;
    const whereClause = { ...filters };

    const users = await User.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    });

    const totalCount = await User.count({ where: whereClause });

    return {
      items: users,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  },

  async getUserById(id: number): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    // Validate user data
    if (!userData.email || !userData.password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Check if the specified organization exists
    if (userData.organizationId) {
      const organization = await Organization.findByPk(userData.organizationId);
      if (!organization) {
        throw new ApiError(404, 'Organization not found');
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword as User;
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // If email is updated, check for uniqueness
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new ApiError(409, 'Email already in use');
      }
    }

    // If organization is updated, verify its existence
    if (userData.organizationId && userData.organizationId !== user.organizationId) {
      const organization = await Organization.findByPk(userData.organizationId);
      if (!organization) {
        throw new ApiError(404, 'Organization not found');
      }
    }

    // If password is updated, hash the new password
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Update user
    await user.update(userData);

    // Return updated user without password
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword as User;
  },

  async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    await user.destroy();
  },

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError(400, 'Invalid user role');
    }

    await user.update({ role });

    // Return updated user without password
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword as User;
  },

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpirationInterval }
    );

    await user.update({ lastLogin: new Date() });

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return { user: userWithoutPassword as User, token };
  },
};