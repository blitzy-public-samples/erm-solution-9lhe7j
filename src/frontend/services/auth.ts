import { api } from 'src/frontend/services/api';
import { User, ApiResponse } from 'src/shared/types/index';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from 'src/shared/constants/index';

export const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post<ApiResponse<User>>('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data.user));
      api.setAuthToken(response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

export const register = async (user: { email: string; password: string; name: string }): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post<ApiResponse<User>>('/auth/register', user);
    if (response.data.success) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data.user));
      api.setAuthToken(response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error('Registration failed. Please try again.');
  }
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  api.setAuthToken(null);
  // Optionally, make a request to the backend to invalidate the token
  // api.post('/auth/logout');
};

export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem(USER_STORAGE_KEY);
  if (userString) {
    try {
      return JSON.parse(userString) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_STORAGE_KEY);
};