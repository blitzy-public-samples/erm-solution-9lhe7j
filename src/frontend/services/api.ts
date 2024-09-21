import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from 'src/shared/constants/index';
import { ApiResponse } from 'src/shared/types/index';

// Create Axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the authentication token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

// Function to handle API errors
const handleApiError = (error: any): ApiResponse<null> => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      success: false,
      data: null,
      message: axiosError.response?.data?.message || 'An error occurred',
      status: axiosError.response?.status || 500,
    };
  }
  return {
    success: false,
    data: null,
    message: 'An unexpected error occurred',
    status: 500,
  };
};

// API object with methods for making requests
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default api;