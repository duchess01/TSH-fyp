-- Switch to the chat_db database
\c chat_db;

-- Creating the tables
-- Create the chat table
CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    chat_session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,  -- To store the application response
    topic VARCHAR(255),  -- To store the identified topic
    machine VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample chat messages
INSERT INTO chat (user_id, chat_session_id, title, message, response, topic, machine)
VALUES 
(1, '1', 'why is machine x breaking down so often?', 'why is machine x breaking down so often?','', 'top1', 'machine x'),
(2, '1', 'Hi there!', 'Hi there!', 'Hello! How can I help you today?', 'top2', 'machine y'),
(1, '1', 'why is machine x breaking down so often?', 'why is machine y breaking down so often?', 'replace y with z', 'top2', 'machine y'),
(1, '2', 'what is the status of machine x?', 'what is the status of machine x?', 'machine x is working fine', 'top1', 'machine x'),
(2, '1', 'Hi there!', 'what is the status of machine y?', 'machine y is broken','top1', 'machine y'),
(3, '1', 'what is the status of machine z?', 'what is the status of machine z?', 'machine z is working fine', 'top2' ,'machine z');
