-- Switch to the chat_db database
\c chat_db;

-- Creating the tables
-- Create the chat table
CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample chat message
INSERT INTO chat (user_id, message)
VALUES 
(1, 'Hello, world!'),
(2, 'Hi there!');
