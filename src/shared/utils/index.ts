import moment from 'moment';
import { DATE_FORMAT, DATETIME_FORMAT, RISK_LEVELS } from 'src/shared/constants/index';
import { Assessment } from 'src/shared/types/index';

export const formatDate = (date: string | Date): string => {
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    throw new Error('Invalid date provided');
  }
  return momentDate.format(DATE_FORMAT);
};

export const formatDateTime = (date: string | Date): string => {
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    throw new Error('Invalid date provided');
  }
  return momentDate.format(DATETIME_FORMAT);
};

export const calculateRiskScore = (assessment: Assessment): number => {
  return assessment.likelihoodId * assessment.impactId;
};

export const getRiskLevel = (score: number): string => {
  if (score <= RISK_LEVELS.LOW) return 'LOW';
  if (score <= RISK_LEVELS.MEDIUM) return 'MEDIUM';
  if (score <= RISK_LEVELS.HIGH) return 'HIGH';
  return 'CRITICAL';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func: Function, wait: number): Function => {
  let timeout: NodeJS.Timeout | null = null;
  let lastInvokeTime: number = 0;

  return function (this: any, ...args: any[]) {
    const context = this;
    const currentTime = Date.now();

    if (timeout) {
      clearTimeout(timeout);
    }

    lastInvokeTime = currentTime;

    timeout = setTimeout(() => {
      if (currentTime - lastInvokeTime >= wait) {
        func.apply(context, args);
      }
    }, wait);
  };
};