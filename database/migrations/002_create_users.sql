-- Up migration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Add check constraint for role values
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('Admin', 'RiskManager', 'DepartmentHead', 'RiskOwner', 'Auditor', 'ReadOnly'));

-- Add comments to table and columns
COMMENT ON TABLE users IS 'Stores user information for the ERM platform';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.organization_id IS 'Foreign key referencing the organization the user belongs to';
COMMENT ON COLUMN users.username IS 'Unique username for the user';
COMMENT ON COLUMN users.email IS 'Unique email address for the user';
COMMENT ON COLUMN users.password IS 'Hashed password for the user';
COMMENT ON COLUMN users.role IS 'User role defining permissions (Admin, RiskManager, DepartmentHead, RiskOwner, Auditor, ReadOnly)';
COMMENT ON COLUMN users.last_login IS 'Timestamp of the user''s last login';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the user record was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the user record was last updated';

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Down migration
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS update_users_updated_at();