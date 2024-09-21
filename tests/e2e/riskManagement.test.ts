import cypress from 'cypress';
import { Risk, User } from 'src/shared/types/index';

const testUser: User = {
  email: 'riskmanager@example.com',
  password: 'RiskManager123!'
};

const testRisk: Risk = {
  title: 'Test Risk',
  description: 'This is a test risk for E2E testing',
  status: 'IDENTIFIED',
  category: 'Operational',
  owner: 'John Doe'
};

describe('Risk Management', () => {
  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/risk-management');
  });

  it('should display the risk list', () => {
    cy.get('[data-testid="risk-list-table"]').should('be.visible');
    cy.get('[data-testid="risk-list-header"]').should('contain', 'Title').and('contain', 'Status').and('contain', 'Category').and('contain', 'Owner');
    cy.get('[data-testid="risk-list-row"]').should('have.length.greaterThan', 0);
  });

  it('should create a new risk', () => {
    cy.get('[data-testid="add-risk-button"]').click();
    cy.get('[data-testid="risk-form-title"]').type(testRisk.title);
    cy.get('[data-testid="risk-form-description"]').type(testRisk.description);
    cy.get('[data-testid="risk-form-status"]').select(testRisk.status);
    cy.get('[data-testid="risk-form-category"]').select(testRisk.category);
    cy.get('[data-testid="risk-form-owner"]').type(testRisk.owner);
    cy.get('[data-testid="risk-form-submit"]').click();

    cy.get('[data-testid="risk-list-row"]').should('contain', testRisk.title);
    cy.contains(testRisk.title).click();
    cy.get('[data-testid="risk-details"]').should('contain', testRisk.description).and('contain', testRisk.status).and('contain', testRisk.category).and('contain', testRisk.owner);
  });

  it('should edit an existing risk', () => {
    const updatedTitle = 'Updated Test Risk';
    cy.get('[data-testid="risk-list-row"]').first().find('[data-testid="edit-risk-button"]').click();
    cy.get('[data-testid="risk-form-title"]').clear().type(updatedTitle);
    cy.get('[data-testid="risk-form-submit"]').click();

    cy.get('[data-testid="risk-list-row"]').first().should('contain', updatedTitle);
    cy.contains(updatedTitle).click();
    cy.get('[data-testid="risk-details"]').should('contain', updatedTitle);
  });

  it('should delete a risk', () => {
    cy.get('[data-testid="risk-list-row"]').first().find('[data-testid="delete-risk-button"]').click();
    cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-delete-button"]').click();

    cy.get('[data-testid="risk-list-row"]').first().should('not.contain', testRisk.title);
    cy.get('[data-testid="risk-search-input"]').type(testRisk.title);
    cy.get('[data-testid="risk-list-row"]').should('have.length', 0);
  });

  it('should filter risks', () => {
    const filterTerm = 'Test';
    cy.get('[data-testid="risk-search-input"]').type(filterTerm);
    cy.get('[data-testid="risk-list-row"]').each(($el) => {
      cy.wrap($el).should('contain', filterTerm);
    });

    cy.get('[data-testid="risk-search-input"]').clear();
    cy.get('[data-testid="risk-list-row"]').should('have.length.greaterThan', 0);
  });

  it('should sort risks', () => {
    cy.get('[data-testid="risk-list-header-title"]').click();
    cy.get('[data-testid="risk-list-row"]').then(($rows) => {
      const titles = $rows.map((_, el) => el.querySelector('[data-testid="risk-title"]').textContent).get();
      expect(titles).to.deep.equal([...titles].sort());
    });

    cy.get('[data-testid="risk-list-header-title"]').click();
    cy.get('[data-testid="risk-list-row"]').then(($rows) => {
      const titles = $rows.map((_, el) => el.querySelector('[data-testid="risk-title"]').textContent).get();
      expect(titles).to.deep.equal([...titles].sort().reverse());
    });
  });

  it('should navigate to risk details page', () => {
    cy.get('[data-testid="risk-list-row"]').first().find('[data-testid="risk-title"]').click();
    cy.url().should('include', '/risk/');
    cy.get('[data-testid="risk-details"]').should('be.visible');
  });

  it('should paginate through risks', () => {
    cy.get('[data-testid="pagination-control"]').should('be.visible');
    cy.get('[data-testid="next-page-button"]').click();
    cy.get('[data-testid="risk-list-row"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="previous-page-button"]').click();
    cy.get('[data-testid="risk-list-row"]').should('have.length.greaterThan', 0);
  });
});