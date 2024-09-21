/**
 * This file contains shared TypeScript type definitions used across the ERM Experts Risk Management Platform.
 * It defines interfaces and types for common entities, API responses, and utility types.
 */

/**
 * Represents a user in the system
 */
export interface User {
  id: number;
  organizationId: number;
  username: string;
  email: string;
  role: UserRole;
  lastLogin: Date;
}

/**
 * Represents an organization in the system
 */
export interface Organization {
  id: number;
  name: string;
  industry: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
}

/**
 * Represents a risk in the system
 */
export interface Risk {
  id: number;
  organizationId: number;
  ownerId: number;
  categoryId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: RiskStatus;
}

/**
 * Represents a risk assessment
 */
export interface Assessment {
  id: number;
  riskId: number;
  likelihoodId: number;
  impactId: number;
  assessmentDate: Date;
  assessorId: number;
}

/**
 * Represents a risk category
 */
export interface RiskCategory {
  id: number;
  organizationId: number;
  name: string;
  parentCategoryId: number | null;
}

/**
 * Represents a likelihood level for risk assessment
 */
export interface Likelihood {
  id: number;
  level: string;
  score: number;
}

/**
 * Represents an impact level for risk assessment
 */
export interface Impact {
  id: number;
  level: string;
  score: number;
}

/**
 * Represents a comment on a risk
 */
export interface Comment {
  id: number;
  riskId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

/**
 * Represents a mitigation action for a risk
 */
export interface MitigationAction {
  id: number;
  riskId: number;
  assignedTo: number;
  description: string;
  dueDate: Date;
  status: MitigationStatus;
}

/**
 * Generic type for API responses
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

/**
 * Type for paginated API responses
 */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Enum for user roles in the system
 */
export enum UserRole {
  Admin = 'Admin',
  RiskManager = 'RiskManager',
  DepartmentHead = 'DepartmentHead',
  RiskOwner = 'RiskOwner',
  Auditor = 'Auditor',
  ReadOnly = 'ReadOnly'
}

/**
 * Enum for risk statuses
 */
export enum RiskStatus {
  Identified = 'Identified',
  Assessed = 'Assessed',
  Mitigating = 'Mitigating',
  Monitored = 'Monitored',
  Closed = 'Closed'
}

/**
 * Enum for mitigation action statuses
 */
export enum MitigationStatus {
  Planned = 'Planned',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Overdue = 'Overdue'
}