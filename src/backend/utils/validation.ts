import validator from 'validator';
import { ApiError } from 'src/backend/utils/ApiError';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  // Check if password length is at least 8 characters
  if (password.length < 8) return false;

  // Check if password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // Check if password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // Check if password contains at least one number
  if (!/\d/.test(password)) return false;

  // Check if password contains at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

  return true;
};

export const validateDate = (date: string): boolean => {
  return validator.isDate(date);
};

export const validateNumber = (value: any, min?: number, max?: number): boolean => {
  if (isNaN(Number(value))) return false;

  const numValue = Number(value);
  if (min !== undefined && numValue < min) return false;
  if (max !== undefined && numValue > max) return false;

  return true;
};

export const validateString = (value: any, minLength?: number, maxLength?: number): boolean => {
  if (typeof value !== 'string') return false;

  if (minLength !== undefined && value.length < minLength) return false;
  if (maxLength !== undefined && value.length > maxLength) return false;

  return true;
};

export const validateEnum = (value: any, enumObject: object): boolean => {
  return Object.values(enumObject).includes(value);
};