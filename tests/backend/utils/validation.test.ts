import {
  validateEmail,
  validatePassword,
  validateDate,
  validateNumber,
  validateString,
  validateEnum
} from 'src/backend/utils/validation';

const mockEnum = {
  OPTION1: 'OPTION1',
  OPTION2: 'OPTION2',
  OPTION3: 'OPTION3'
};

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should correctly validate email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('invalid@email@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should correctly validate passwords', () => {
      expect(validatePassword('StrongPass1!')).toBe(true);
      expect(validatePassword('WeakPass')).toBe(false);
      expect(validatePassword('nouppercase1!')).toBe(false);
      expect(validatePassword('NOLOWERCASE1!')).toBe(false);
      expect(validatePassword('NoNumber!')).toBe(false);
      expect(validatePassword('NoSpecialChar1')).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should correctly validate date strings', () => {
      expect(validateDate('2023-05-15')).toBe(true);
      expect(validateDate('2023/05/15')).toBe(true);
      expect(validateDate('15-05-2023')).toBe(true);
      expect(validateDate('invalid-date')).toBe(false);
      expect(validateDate('2023-13-01')).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should correctly validate numbers and ranges', () => {
      expect(validateNumber(5)).toBe(true);
      expect(validateNumber(5, 1, 10)).toBe(true);
      expect(validateNumber(0, 1, 10)).toBe(false);
      expect(validateNumber(11, 1, 10)).toBe(false);
      expect(validateNumber('5')).toBe(false);
    });
  });

  describe('validateString', () => {
    it('should correctly validate strings and lengths', () => {
      expect(validateString('test')).toBe(true);
      expect(validateString('test', 3, 5)).toBe(true);
      expect(validateString('toolong', 3, 5)).toBe(false);
      expect(validateString('short', 10)).toBe(false);
      expect(validateString('')).toBe(false);
    });
  });

  describe('validateEnum', () => {
    it('should correctly validate enum values', () => {
      expect(validateEnum('OPTION1', mockEnum)).toBe(true);
      expect(validateEnum('OPTION2', mockEnum)).toBe(true);
      expect(validateEnum('INVALID_OPTION', mockEnum)).toBe(false);
    });
  });

  // Additional edge cases and error handling tests
  describe('Edge cases and error handling', () => {
    it('should handle null and undefined inputs', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
      expect(validateDate(null)).toBe(false);
      expect(validateNumber(undefined)).toBe(false);
      expect(validateString(null)).toBe(false);
      expect(validateEnum(undefined, mockEnum)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(validateEmail('')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validateDate('')).toBe(false);
      expect(validateString('')).toBe(false);
    });

    it('should not modify input values', () => {
      const email = 'test@example.com';
      validateEmail(email);
      expect(email).toBe('test@example.com');

      const password = 'StrongPass1!';
      validatePassword(password);
      expect(password).toBe('StrongPass1!');
    });
  });
});