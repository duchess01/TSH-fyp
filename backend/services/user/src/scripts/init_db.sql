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
('Rebecca Adams', 'rebecca.adams@example.com', crypt('SecurePass3490!', gen_salt('bf')), 'Manager', 'Manager Dashboard'),
('Laura Green', 'laura.green@example.com', crypt('Password123!', gen_salt('bf')), 'Operator', 'Ask Questions'),
('James Smith', 'james.smith@example.com', crypt('Secure1234!', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Nancy Drew', 'nancy.drew@example.com', crypt('Mystery!2024', gen_salt('bf')), 'Supervisor', 'Input Answers'),
('Oscar Wilde', 'oscar.wilde@example.com', crypt('Literature!2024', gen_salt('bf')), 'Manager', 'Manager Dashboard'),
('Sophia Turner', 'sophia.turner@example.com', crypt('Creative@123', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Ethan Hunt', 'ethan.hunt@example.com', crypt('MissionImpossible!', gen_salt('bf')), 'Admin', 'System Admin'),
('Olivia Brown', 'olivia.brown@example.com', crypt('NatureLover99', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Liam Johnson', 'liam.johnson@example.com', crypt('TechSavvy#2024', gen_salt('bf')), 'Supervisor', 'Input Answers'),
('Emma Watson', 'emma.watson@example.com', crypt('WizardingWorld#1', gen_salt('bf')), 'Admin', 'System Admin'),
('Noah White', 'noah.white@example.com', crypt('Summer2024!', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Ava Garcia', 'ava.garcia@example.com', crypt('Fitness@2024', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Mason Lee', 'mason.lee@example.com', crypt('Finance1234!', gen_salt('bf')), 'Operator', 'Ask Questions'),
('Isabella Martinez', 'isabella.martinez@example.com', crypt('Artistic2024!', gen_salt('bf')), 'Manager', 'Manager Dashboard'),
('Lucas Wilson', 'lucas.wilson@example.com', crypt('Adventure@2024', gen_salt('bf')), 'Technician', 'Input Answers'),
('Mia Taylor', 'mia.taylor@example.com', crypt('ChefLife#2024', gen_salt('bf')), 'Operator', 'Ask Questions');
