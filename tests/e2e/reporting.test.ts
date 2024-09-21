import { User, ReportConfig } from 'src/shared/types/index';

const testUser: User = {
  email: 'reporter@example.com',
  password: 'Reporter123!'
};

const testReportConfig: ReportConfig = {
  name: 'Test Report',
  type: 'RiskSummary',
  filters: {
    status: ['IDENTIFIED', 'ASSESSED'],
    dateRange: {
      start: '2023-01-01',
      end: '2023-12-31'
    }
  },
  format: 'PDF'
};

describe('Reporting', () => {
  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/reports');
  });

  it('should display the report configuration list', () => {
    cy.get('[data-testid="report-config-list"]').should('be.visible');
    cy.get('[data-testid="report-config-item"]').should('have.length.greaterThan', 0);
  });

  it('should create a new report configuration', () => {
    cy.get('[data-testid="create-report-btn"]').click();
    cy.get('[data-testid="report-name-input"]').type(testReportConfig.name);
    cy.get('[data-testid="report-type-select"]').select(testReportConfig.type);
    cy.get('[data-testid="report-status-filter"]').select(testReportConfig.filters.status);
    cy.get('[data-testid="report-date-start"]').type(testReportConfig.filters.dateRange.start);
    cy.get('[data-testid="report-date-end"]').type(testReportConfig.filters.dateRange.end);
    cy.get('[data-testid="report-format-select"]').select(testReportConfig.format);
    cy.get('[data-testid="submit-report-config"]').click();

    cy.get('[data-testid="report-config-list"]').contains(testReportConfig.name).should('be.visible');
    cy.get('[data-testid="report-config-item"]').last().as('newConfig');
    cy.get('@newConfig').contains(testReportConfig.type).should('be.visible');
    cy.get('@newConfig').contains(testReportConfig.format).should('be.visible');
  });

  it('should edit an existing report configuration', () => {
    const updatedName = 'Updated Test Report';
    cy.get('[data-testid="report-config-item"]').first().find('[data-testid="edit-report-btn"]').click();
    cy.get('[data-testid="report-name-input"]').clear().type(updatedName);
    cy.get('[data-testid="submit-report-config"]').click();

    cy.get('[data-testid="report-config-list"]').contains(updatedName).should('be.visible');
    cy.get('[data-testid="report-config-details"]').contains(updatedName).should('be.visible');
  });

  it('should delete a report configuration', () => {
    cy.get('[data-testid="report-config-item"]').first().as('firstConfig');
    cy.get('@firstConfig').find('[data-testid="delete-report-btn"]').click();
    cy.get('[data-testid="confirm-delete-btn"]').click();

    cy.get('@firstConfig').should('not.exist');
  });

  it('should generate a report', () => {
    cy.get('[data-testid="report-config-item"]').first().find('[data-testid="generate-report-btn"]').click();
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist');
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="download-report-btn"]').should('be.visible');
  });

  it('should preview a report', () => {
    cy.get('[data-testid="report-config-item"]').first().find('[data-testid="preview-report-btn"]').click();
    cy.get('[data-testid="report-preview-modal"]').should('be.visible');
    cy.get('[data-testid="report-preview-content"]').should('not.be.empty');
  });

  it('should filter report configurations', () => {
    const searchTerm = 'Risk';
    cy.get('[data-testid="report-filter-input"]').type(searchTerm);
    cy.get('[data-testid="report-config-item"]').each(($el) => {
      cy.wrap($el).should('contain', searchTerm);
    });

    cy.get('[data-testid="report-filter-input"]').clear();
    cy.get('[data-testid="report-config-item"]').should('have.length.greaterThan', 0);
  });

  it('should handle report generation errors', () => {
    cy.intercept('POST', '/api/reports/generate', {
      statusCode: 400,
      body: { error: 'Invalid date range' }
    }).as('generateReport');

    cy.get('[data-testid="report-config-item"]').first().find('[data-testid="generate-report-btn"]').click();
    cy.wait('@generateReport');
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'Invalid date range');
    cy.get('[data-testid="dismiss-error-btn"]').click();
    cy.get('[data-testid="error-message"]').should('not.exist');
  });
});