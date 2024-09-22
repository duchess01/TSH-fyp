-- Switch to the user_db database
\c user_db;

-- Enable the pgcrypto extension (only needs to be done once per database)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Creating the tables
-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    privilege VARCHAR(20) DEFAULT 'ask questions',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Inserting sample data
-- Insert sample users with hashed passwords
INSERT INTO users (name, email, password, role, privilege)
VALUES 
('John Doe', 'john.doe@example.com', crypt('Password!123', gen_salt('bf')), 'Admin', 'System Admin'),
('Alice Johnson', 'alice.johnson@example.com', crypt('StrongPass2024!', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Michael Scott', 'michael.scott@example.com', crypt('DwightSchruteRules!', gen_salt('bf')), 'Supervisor', 'Input Answers'),
('Rebecca Adams', 'rebecca.adams@example.com', crypt('SecurePass3490!', gen_salt('bf')), 'Manager', 'Manager Dashboard');
