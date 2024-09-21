import { UserRole, RiskStatus, MitigationStatus } from 'src/shared/types/index';

// Base URL for API endpoints
export const API_BASE_URL = '/api/v1';

// Pagination settings
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Local storage keys
export const TOKEN_STORAGE_KEY = 'erm_auth_token';
export const USER_STORAGE_KEY = 'erm_user_data';

// Date and time formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Risk levels
export const RISK_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// Human-readable labels for user roles
export const USER_ROLE_LABELS = {
  [UserRole.Admin]: 'Administrator',
  [UserRole.RiskManager]: 'Risk Manager',
  [UserRole.DepartmentHead]: 'Department Head',
  [UserRole.RiskOwner]: 'Risk Owner',
  [UserRole.Auditor]: 'Auditor',
  [UserRole.ReadOnly]: 'Read-Only User',
};

// Human-readable labels for risk statuses
export const RISK_STATUS_LABELS = {
  [RiskStatus.Identified]: 'Identified',
  [RiskStatus.Assessed]: 'Assessed',
  [RiskStatus.Mitigating]: 'Mitigating',
  [RiskStatus.Monitored]: 'Monitored',
  [RiskStatus.Closed]: 'Closed',
};

// Human-readable labels for mitigation statuses
export const MITIGATION_STATUS_LABELS = {
  [MitigationStatus.Planned]: 'Planned',
  [MitigationStatus.InProgress]: 'In Progress',
  [MitigationStatus.Completed]: 'Completed',
  [MitigationStatus.Overdue]: 'Overdue',
};

// Common error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RISK_REGISTER: '/risks',
  RISK_DETAILS: '/risks/:id',
  ASSESSMENTS: '/assessments',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};