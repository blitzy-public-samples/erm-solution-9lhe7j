-- Seed data for likelihoods table

INSERT INTO likelihoods (level, score, description) VALUES
('Rare', 1, 'The event may occur only in exceptional circumstances'),
('Unlikely', 2, 'The event could occur at some time but is not expected'),
('Possible', 3, 'The event might occur at some time'),
('Likely', 4, 'The event will probably occur in most circumstances'),
('Almost Certain', 5, 'The event is expected to occur in most circumstances');