-- Seed data for organizations table

INSERT INTO organizations (name, industry, subscription_start, subscription_end) VALUES
('Acme Corporation', 'Manufacturing', '2023-01-01', '2024-01-01'),
('TechNova Solutions', 'Information Technology', '2023-02-15', '2024-02-15'),
('GreenLeaf Energies', 'Renewable Energy', '2023-03-01', '2024-03-01'),
('Global Finance Group', 'Financial Services', '2023-04-01', '2024-04-01'),
('HealthCare Plus', 'Healthcare', '2023-05-01', '2024-05-01');

-- Additional organizations for a more diverse dataset
INSERT INTO organizations (name, industry, subscription_start, subscription_end) VALUES
('EduTech Innovations', 'Education', '2023-06-01', '2024-12-01'),
('AgriGrow Systems', 'Agriculture', '2023-07-15', '2025-07-15'),
('SecureNet Solutions', 'Cybersecurity', '2023-08-01', '2024-08-01'),
('EcoFriendly Packaging', 'Packaging', '2023-09-01', '2025-03-01'),
('SmartCity Planners', 'Urban Planning', '2023-10-15', '2024-10-15');

-- Organizations with different subscription lengths
INSERT INTO organizations (name, industry, subscription_start, subscription_end) VALUES
('QuickServe Logistics', 'Transportation', '2023-11-01', '2023-12-31'),
('InnovateTech Labs', 'Research and Development', '2023-12-01', '2025-12-01');

-- Prevent duplicate insertions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Acme Corporation') THEN
        INSERT INTO organizations (name, industry, subscription_start, subscription_end) VALUES
        ('Acme Corporation', 'Manufacturing', '2023-01-01', '2024-01-01');
    END IF;
    -- Repeat for other organizations...
END $$;