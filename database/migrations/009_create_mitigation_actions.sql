-- Up migration
CREATE TABLE mitigation_actions (
    id SERIAL PRIMARY KEY,
    risk_id INTEGER NOT NULL REFERENCES risks(id),
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mitigation_actions_risk_id ON mitigation_actions(risk_id);
CREATE INDEX idx_mitigation_actions_assigned_to ON mitigation_actions(assigned_to);
CREATE INDEX idx_mitigation_actions_due_date ON mitigation_actions(due_date);
CREATE INDEX idx_mitigation_actions_status ON mitigation_actions(status);

-- Add check constraint for status values
ALTER TABLE mitigation_actions
ADD CONSTRAINT chk_mitigation_actions_status
CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Overdue'));

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_mitigation_actions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mitigation_actions_timestamp
BEFORE UPDATE ON mitigation_actions
FOR EACH ROW
EXECUTE FUNCTION update_mitigation_actions_timestamp();

-- Add comments to table and columns
COMMENT ON TABLE mitigation_actions IS 'Stores mitigation actions for risks';
COMMENT ON COLUMN mitigation_actions.id IS 'Unique identifier for the mitigation action';
COMMENT ON COLUMN mitigation_actions.risk_id IS 'Foreign key referencing the associated risk';
COMMENT ON COLUMN mitigation_actions.assigned_to IS 'Foreign key referencing the user assigned to the action';
COMMENT ON COLUMN mitigation_actions.description IS 'Detailed description of the mitigation action';
COMMENT ON COLUMN mitigation_actions.due_date IS 'Date by which the action should be completed';
COMMENT ON COLUMN mitigation_actions.status IS 'Current status of the mitigation action';
COMMENT ON COLUMN mitigation_actions.created_at IS 'Timestamp when the action was created';
COMMENT ON COLUMN mitigation_actions.updated_at IS 'Timestamp when the action was last updated';

-- Down migration
DROP TRIGGER IF EXISTS update_mitigation_actions_timestamp ON mitigation_actions;
DROP FUNCTION IF EXISTS update_mitigation_actions_timestamp();
DROP TABLE IF EXISTS mitigation_actions;