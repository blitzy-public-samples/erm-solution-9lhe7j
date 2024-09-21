-- Seed data for impacts table

-- Clear existing data (if any)
TRUNCATE TABLE impacts RESTART IDENTITY CASCADE;

-- Insert impact levels
INSERT INTO impacts (level, score, description) VALUES
('Insignificant', 1, 'Minimal impact on operations, financial loss < $10,000, no regulatory concerns'),
('Minor', 2, 'Minor impact on operations, financial loss $10,000 - $100,000, minor regulatory concerns'),
('Moderate', 3, 'Moderate impact on operations, financial loss $100,000 - $1,000,000, moderate regulatory concerns'),
('Major', 4, 'Major impact on operations, financial loss $1,000,000 - $10,000,000, major regulatory concerns'),
('Catastrophic', 5, 'Severe impact on operations, financial loss > $10,000,000, severe regulatory concerns');

-- Add a comment to explain the purpose of this seed file
COMMENT ON TABLE impacts IS 'Predefined impact levels for risk assessment';

-- Create a function to prevent duplicate inserts
CREATE OR REPLACE FUNCTION insert_impact_if_not_exists(
    p_level VARCHAR,
    p_score INTEGER,
    p_description TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM impacts WHERE level = p_level) THEN
        INSERT INTO impacts (level, score, description)
        VALUES (p_level, p_score, p_description);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Use the function to safely insert data
SELECT insert_impact_if_not_exists('Insignificant', 1, 'Minimal impact on operations, financial loss < $10,000, no regulatory concerns');
SELECT insert_impact_if_not_exists('Minor', 2, 'Minor impact on operations, financial loss $10,000 - $100,000, minor regulatory concerns');
SELECT insert_impact_if_not_exists('Moderate', 3, 'Moderate impact on operations, financial loss $100,000 - $1,000,000, moderate regulatory concerns');
SELECT insert_impact_if_not_exists('Major', 4, 'Major impact on operations, financial loss $1,000,000 - $10,000,000, major regulatory concerns');
SELECT insert_impact_if_not_exists('Catastrophic', 5, 'Severe impact on operations, financial loss > $10,000,000, severe regulatory concerns');

-- Drop the function after use
DROP FUNCTION IF EXISTS insert_impact_if_not_exists;