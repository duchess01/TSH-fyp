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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserting sample data
-- Insert a sample user with a hashed password
INSERT INTO users (name, email, password)
VALUES 
('John Doe', 'john@example.com', crypt('password123', gen_salt('bf'))),
('Jane Smith', 'jane@example.com', crypt('securepassword', gen_salt('bf')));