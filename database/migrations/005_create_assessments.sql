-- Up migration
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    risk_id INTEGER NOT NULL REFERENCES risks(id),
    likelihood_id INTEGER NOT NULL REFERENCES likelihoods(id),
    impact_id INTEGER NOT NULL REFERENCES impacts(id),
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assessor_id INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_risk_id ON assessments(risk_id);
CREATE INDEX idx_assessments_likelihood_id ON assessments(likelihood_id);
CREATE INDEX idx_assessments_impact_id ON assessments(impact_id);
CREATE INDEX idx_assessments_assessor_id ON assessments(assessor_id);
CREATE INDEX idx_assessments_assessment_date ON assessments(assessment_date);

-- Add composite index for efficient querying of latest assessments
CREATE INDEX idx_assessments_risk_date ON assessments(risk_id, assessment_date);

-- Add comments to table and columns
COMMENT ON TABLE assessments IS 'Stores risk assessments performed by users';
COMMENT ON COLUMN assessments.risk_id IS 'Reference to the associated risk';
COMMENT ON COLUMN assessments.likelihood_id IS 'Reference to the likelihood level of the risk';
COMMENT ON COLUMN assessments.impact_id IS 'Reference to the impact level of the risk';
COMMENT ON COLUMN assessments.assessment_date IS 'Date and time when the assessment was performed';
COMMENT ON COLUMN assessments.assessor_id IS 'Reference to the user who performed the assessment';
COMMENT ON COLUMN assessments.notes IS 'Additional notes or comments about the assessment';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_assessment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessment_timestamp
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION update_assessment_timestamp();

-- Add constraint to ensure assessment_date is not in the future
ALTER TABLE assessments ADD CONSTRAINT check_assessment_date_not_future 
CHECK (assessment_date <= CURRENT_TIMESTAMP);

-- Down migration
DROP TABLE IF EXISTS assessments;
DROP FUNCTION IF EXISTS update_assessment_timestamp();