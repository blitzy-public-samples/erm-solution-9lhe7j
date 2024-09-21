-- Up migration
CREATE TABLE risks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    owner_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES risk_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risks_organization_id ON risks(organization_id);
CREATE INDEX idx_risks_owner_id ON risks(owner_id);
CREATE INDEX idx_risks_category_id ON risks(category_id);
CREATE INDEX idx_risks_status ON risks(status);

-- Down migration
DROP TABLE IF EXISTS risks;