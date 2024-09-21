-- Up migration
CREATE TABLE risk_categories (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES risk_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_categories_organization_id ON risk_categories(organization_id);
CREATE INDEX idx_risk_categories_parent_category_id ON risk_categories(parent_category_id);
CREATE UNIQUE INDEX idx_risk_categories_org_name ON risk_categories(organization_id, name);

-- Add a check constraint to prevent a category from being its own parent
ALTER TABLE risk_categories ADD CONSTRAINT check_parent_category CHECK (id != parent_category_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_risk_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_categories_timestamp
BEFORE UPDATE ON risk_categories
FOR EACH ROW
EXECUTE FUNCTION update_risk_categories_timestamp();

-- Add comments to the table and columns
COMMENT ON TABLE risk_categories IS 'Stores risk categories for organizations';
COMMENT ON COLUMN risk_categories.id IS 'Unique identifier for the risk category';
COMMENT ON COLUMN risk_categories.organization_id IS 'Reference to the organization this category belongs to';
COMMENT ON COLUMN risk_categories.name IS 'Name of the risk category';
COMMENT ON COLUMN risk_categories.description IS 'Detailed description of the risk category';
COMMENT ON COLUMN risk_categories.parent_category_id IS 'Reference to the parent category, if any';
COMMENT ON COLUMN risk_categories.created_at IS 'Timestamp when the category was created';
COMMENT ON COLUMN risk_categories.updated_at IS 'Timestamp when the category was last updated';

-- Down migration
DROP TRIGGER IF EXISTS update_risk_categories_timestamp ON risk_categories;
DROP FUNCTION IF EXISTS update_risk_categories_timestamp();
DROP TABLE IF EXISTS risk_categories;