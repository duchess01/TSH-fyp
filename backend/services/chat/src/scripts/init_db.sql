-- Switch to the chat_db database
\c chat_db;

-- Creating the tables
-- Create the chat table
CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,  -- To store the application response
    topic VARCHAR(255),  -- To store the identified topic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample chat messages
INSERT INTO chat (user_id, message, response, topic)
VALUES 
(1, 'why is machine x breaking down so often?', '', 'machine x'),
(2, 'Hi there!', NULL, NULL),
(3, 'why is machine y breaking down so often?', 'replace y with z', 'machine y'),
(4, 'what is the status of machine x?', 'machine x is working fine', 'machine x'),
(5, 'what is the status of machine y?', 'machine y is broken', 'machine y'),
(6, 'what is the status of machine z?', 'machine z is working fine', 'machine z');
