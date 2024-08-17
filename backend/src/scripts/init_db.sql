-- Create the database named tsh_fyp
-- (This command should be run separately if the database does not exist)
CREATE DATABASE tsh_fyp;

-- Switch to the tsh_fyp database
\c tsh_fyp;

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

-- Create the chat table
CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)

);


-- Inserting sample data
-- Insert a sample user with a hashed password
INSERT INTO users (name, email, password)
VALUES 
('John Doe', 'john@example.com', crypt('password123', gen_salt('bf'))),
('Jane Smith', 'jane@example.com', crypt('securepassword', gen_salt('bf')));

-- Insert a sample chat message
INSERT INTO chat (user_id, message)
VALUES 
(1, 'Hello, world!'),
(2, 'Hi there!');
