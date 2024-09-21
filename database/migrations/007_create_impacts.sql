-- Create impacts table
CREATE TABLE impacts (
    id SERIAL PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique indexes
CREATE UNIQUE INDEX idx_impacts_level ON impacts(level);
CREATE UNIQUE INDEX idx_impacts_score ON impacts(score);

-- Add check constraint for score range
ALTER TABLE impacts ADD CONSTRAINT chk_impacts_score CHECK (score >= 1 AND score <= 5);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_impacts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_impacts_timestamp
BEFORE UPDATE ON impacts
FOR EACH ROW
EXECUTE FUNCTION update_impacts_timestamp();

-- Add comments to table and columns
COMMENT ON TABLE impacts IS 'Stores impact levels for risk assessments';
COMMENT ON COLUMN impacts.level IS 'The name of the impact level';
COMMENT ON COLUMN impacts.score IS 'Numeric score associated with the impact level (1-5)';
COMMENT ON COLUMN impacts.description IS 'Detailed description of the impact level';

-- Insert default impact levels
INSERT INTO impacts (level, score, description) VALUES
('Negligible', 1, 'Minimal impact, no disruption to operations'),
('Minor', 2, 'Minor impact, slight disruption to operations'),
('Moderate', 3, 'Moderate impact, noticeable disruption to operations'),
('Major', 4, 'Significant impact, major disruption to operations'),
('Severe', 5, 'Critical impact, severe disruption to operations');

-- Down migration
-- DROP TABLE IF EXISTS impacts;