-- Up migration
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    subscription_start DATE NOT NULL,
    subscription_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_industry ON organizations(industry);
CREATE INDEX idx_organizations_subscription_end ON organizations(subscription_end);

-- Add check constraint for subscription dates
ALTER TABLE organizations
ADD CONSTRAINT chk_subscription_dates
CHECK (subscription_end >= subscription_start);

-- Add unique constraint for organization name
ALTER TABLE organizations
ADD CONSTRAINT uq_organization_name UNIQUE (name);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger on organizations table
CREATE TRIGGER update_organizations_modtime
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Add comments to table and columns
COMMENT ON TABLE organizations IS 'Stores information about organizations using the ERM platform';
COMMENT ON COLUMN organizations.id IS 'Unique identifier for the organization';
COMMENT ON COLUMN organizations.name IS 'Name of the organization';
COMMENT ON COLUMN organizations.industry IS 'Industry sector of the organization';
COMMENT ON COLUMN organizations.subscription_start IS 'Start date of the organization''s subscription';
COMMENT ON COLUMN organizations.subscription_end IS 'End date of the organization''s subscription';
COMMENT ON COLUMN organizations.created_at IS 'Timestamp when the organization record was created';
COMMENT ON COLUMN organizations.updated_at IS 'Timestamp when the organization record was last updated';

-- Down migration
DROP TABLE IF EXISTS organizations;
DROP FUNCTION IF EXISTS update_modified_column();