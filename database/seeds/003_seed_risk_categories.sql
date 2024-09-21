-- Seed data for risk_categories table

-- Clear existing data (if needed)
TRUNCATE TABLE risk_categories RESTART IDENTITY CASCADE;

-- Insert seed data
INSERT INTO risk_categories (organization_id, name, description, parent_category_id) VALUES
(1, 'Strategic', 'Risks related to high-level goals, aligned with and supporting the organization''s mission', NULL),
(1, 'Operational', 'Risks related to the organization''s operational and administrative procedures', NULL),
(1, 'Financial', 'Risks related to the organization''s financial procedures and assets', NULL),
(1, 'Compliance', 'Risks related to legal and regulatory compliance', NULL),
(1, 'Reputational', 'Risks that affect the organization''s reputation or brand', NULL),
(1, 'Market Risk', 'Risks related to market fluctuations and competition', 1),
(1, 'Technology Risk', 'Risks related to technology failures or obsolescence', 2),
(1, 'Human Resources Risk', 'Risks related to employee management and workforce issues', 2),
(1, 'Liquidity Risk', 'Risks related to the organization''s ability to meet its financial obligations', 3),
(1, 'Credit Risk', 'Risks related to the failure of debtors to repay loans or meet contractual obligations', 3),
(2, 'Strategic', 'Risks related to high-level goals, aligned with and supporting the organization''s mission', NULL),
(2, 'Operational', 'Risks related to the organization''s operational and administrative procedures', NULL),
(2, 'Financial', 'Risks related to the organization''s financial procedures and assets', NULL),
(2, 'Compliance', 'Risks related to legal and regulatory compliance', NULL),
(2, 'Cybersecurity', 'Risks related to information security and data protection', 2),
(2, 'Project Risk', 'Risks related to the execution and delivery of projects', 2),
(2, 'Market Risk', 'Risks related to market fluctuations and competition', 1);

-- Add a function to prevent duplicate insertions
CREATE OR REPLACE FUNCTION insert_risk_category_if_not_exists(
    p_organization_id INT,
    p_name VARCHAR(100),
    p_description TEXT,
    p_parent_category_id INT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM risk_categories 
        WHERE organization_id = p_organization_id AND name = p_name
    ) THEN
        INSERT INTO risk_categories (organization_id, name, description, parent_category_id)
        VALUES (p_organization_id, p_name, p_description, p_parent_category_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Use the function to insert data safely
SELECT insert_risk_category_if_not_exists(1, 'Strategic', 'Risks related to high-level goals, aligned with and supporting the organization''s mission', NULL);
SELECT insert_risk_category_if_not_exists(1, 'Operational', 'Risks related to the organization''s operational and administrative procedures', NULL);
-- ... (repeat for all categories)

-- Drop the function after use
DROP FUNCTION IF EXISTS insert_risk_category_if_not_exists;