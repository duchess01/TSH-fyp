-- Switch to the chat_db database
\c qna_db;

-- Creating the tables
-- Create the qna table
CREATE TABLE qna (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    topic VARCHAR(255),
    question VARCHAR(255),
    solution TEXT,
    solution_image BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    qna_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_value BOOLEAN NOT NULL, -- true for thumbs up, false for thumbs down
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qna_id) REFERENCES qna(id) ON DELETE CASCADE,
    UNIQUE (qna_id, user_id) -- Ensure a user can only rate a question once
);


-- Insert sample chat messages
-- INSERT INTO chat (user_id, chat_session_id, title, message, response, topic, machine, created_at)
-- VALUES 
-- (1, '1', 'why is machine x breaking down so often?', 'why is machine x breaking down so often?','', 'top1', 'machine x', '2024-08-01 10:00:00'),
-- (2, '1', 'Hi there!', 'Hi there!', 'Hello! How can I help you today?', 'top2', 'machine y', '2024-09-01 10:00:00'),
-- (1, '1', 'why is machine x breaking down so often?', 'why is machine y breaking down so often?', 'replace y with z', 'top2', 'machine y', '2024-08-01 10:00:00'),
-- (1, '2', 'what is the status of machine x?', 'what is the status of machine x?', 'machine x is working fine', 'top1', 'machine x', '2024-09-01 10:00:00'),
-- (2, '1', 'Hi there!', 'what is the status of machine y?', 'machine y is broken','top1', 'machine y', '2024-09-01 10:00:00'),
-- (3, '1', 'what is the status of machine z?', 'what is the status of machine z?', 'machine z is working fine', 'top2' ,'machine z', '2024-10-28 10:00:00');
