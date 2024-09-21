-- Create likelihoods table
CREATE TABLE likelihoods (
    id SERIAL PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique indexes
CREATE UNIQUE INDEX idx_likelihoods_level ON likelihoods(level);
CREATE UNIQUE INDEX idx_likelihoods_score ON likelihoods(score);

-- Add check constraint for score range
ALTER TABLE likelihoods ADD CONSTRAINT check_score_range CHECK (score >= 1 AND score <= 5);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_likelihoods_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likelihoods_timestamp
BEFORE UPDATE ON likelihoods
FOR EACH ROW
EXECUTE FUNCTION update_likelihoods_timestamp();

-- Add comments to table and columns
COMMENT ON TABLE likelihoods IS 'Stores likelihood levels for risk assessments';
COMMENT ON COLUMN likelihoods.level IS 'The name of the likelihood level';
COMMENT ON COLUMN likelihoods.score IS 'Numeric score associated with the likelihood level (1-5)';
COMMENT ON COLUMN likelihoods.description IS 'Detailed description of the likelihood level';

-- Insert default likelihood levels
INSERT INTO likelihoods (level, score, description) VALUES
('Very Low', 1, 'Highly unlikely to occur'),
('Low', 2, 'Unlikely to occur'),
('Medium', 3, 'May occur occasionally'),
('High', 4, 'Likely to occur'),
('Very High', 5, 'Highly likely to occur');

-- Down migration
-- DROP TABLE IF EXISTS likelihoods;