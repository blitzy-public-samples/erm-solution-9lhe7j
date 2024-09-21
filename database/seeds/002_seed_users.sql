-- Seed data for users table

-- Acme Corporation (organization_id: 1)
INSERT INTO users (organization_id, username, email, password, role) VALUES
(1, 'john_doe', 'john.doe@acme.com', '$2a$10$XQhE7GzMZc4lGzWtWqZzUeVkZGJZdHAX/KmG0Ow8ZJrhf4X0K3Tg6', 'Admin'),
(1, 'jane_smith', 'jane.smith@acme.com', '$2a$10$1Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'RiskManager');

-- TechNova Solutions (organization_id: 2)
INSERT INTO users (organization_id, username, email, password, role) VALUES
(2, 'alice_johnson', 'alice.johnson@technova.com', '$2a$10$2Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'RiskManager'),
(2, 'bob_wilson', 'bob.wilson@technova.com', '$2a$10$3Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'RiskOwner');

-- GreenLeaf Energies (organization_id: 3)
INSERT INTO users (organization_id, username, email, password, role) VALUES
(3, 'carol_brown', 'carol.brown@greenleaf.com', '$2a$10$4Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'Admin'),
(3, 'david_lee', 'david.lee@greenleaf.com', '$2a$10$5Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'Auditor');

-- Global Finance Group (organization_id: 4)
INSERT INTO users (organization_id, username, email, password, role) VALUES
(4, 'eva_garcia', 'eva.garcia@globalfinance.com', '$2a$10$6Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'RiskManager'),
(4, 'frank_miller', 'frank.miller@globalfinance.com', '$2a$10$7Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'DepartmentHead');

-- HealthCare Plus (organization_id: 5)
INSERT INTO users (organization_id, username, email, password, role) VALUES
(5, 'grace_chen', 'grace.chen@healthcareplus.com', '$2a$10$8Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'Admin'),
(5, 'henry_taylor', 'henry.taylor@healthcareplus.com', '$2a$10$9Ym3QZGGxRtLVQYD5jGwZOxs1Y9Z9Xm5K5Y5X5Y5X5Y5X5Y5X5Y5X', 'RiskOwner');

-- Note: The passwords used here are bcrypt hashed. In a real scenario, you would generate these hashes securely.
-- The actual passwords used for these hashes are not provided for security reasons.
-- Ensure to use strong, unique passwords for each user in a production environment.

-- This seed data provides a diverse set of users across different organizations and roles,
-- which should be sufficient for initial testing and development purposes.