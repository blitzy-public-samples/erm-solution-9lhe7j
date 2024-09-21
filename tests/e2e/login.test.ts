import { User } from '../../src/shared/types/index';

const testUser: User = {
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('header').should('contain', testUser.email);
  });

  it('should display error message with invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.error-message').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should validate email format', () => {
    cy.get('input[type="email"]').type('invalidemail');
    cy.get('.email-error').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should validate password length', () => {
    cy.get('input[type="password"]').type('short');
    cy.get('.password-error').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should allow user to toggle password visibility', () => {
    cy.get('input[type="password"]').type('TestPassword123!');
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
    
    cy.get('.toggle-password').click();
    cy.get('input[type="password"]').should('have.attr', 'type', 'text');
    
    cy.get('.toggle-password').click();
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
  });

  it("should redirect to forgot password page when clicking 'Forgot Password' link", () => {
    cy.get('a').contains('Forgot Password').click();
    cy.url().should('include', '/forgot-password');
  });
});