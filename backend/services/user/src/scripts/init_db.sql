-- Switch to the user_db database
\c user_db;

-- Enable the pgcrypto extension (only needs to be done once per database)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Creating the users table with privileges array
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    privileges TEXT[] DEFAULT ARRAY['Ask Questions'],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Inserting sample data with array privileges
INSERT INTO users (name, email, password, role, privileges)
VALUES 
(
    'John Doe', 
    'john.doe@example.com', 
    crypt('Password!123', gen_salt('bf')), 
    'Admin', 
    ARRAY['System Admin', 'View Dashboard', 'Ask Questions', 'Input Answers']
),
(
    'Alice Johnson', 
    'alice.johnson@example.com', 
    crypt('StrongPass2024!', gen_salt('bf')), 
    'Operator', 
    ARRAY['Ask Questions']
),
(
    'Michael Scott', 
    'michael.scott@example.com', 
    crypt('DwightSchruteRules!', gen_salt('bf')), 
    'Supervisor', 
    ARRAY['Ask Questions', 'Input Answers']
),
(
    'Rebecca Adams', 
    'rebecca.adams@example.com', 
    crypt('SecurePass3490!', gen_salt('bf')), 
    'Manager', 
    ARRAY['Ask Questions', 'Input Answers', 'View Dashboard']
);