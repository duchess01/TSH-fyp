-- Switch to the chat_db database
\c qna_db;

-- Creating the tables
-- Create the qna table
CREATE TABLE qna (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    topic VARCHAR(255),
    machine VARCHAR(255),
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

-- Insert sample qna solutions
INSERT INTO qna (user_id, topic, machine, question, solution, solution_image)
VALUES
    (1, 'Installation', 'Machine A', 'How to install Machine A?', 'Follow the installation guide provided in the manual.', NULL),
    (2, 'Troubleshooting', 'Machine A', 'Why is Machine A not starting?', 'Check the power supply and ensure all connections are secure.', NULL),
    (3, 'Maintenance', 'Machine B', 'How often should Machine B be serviced?', 'Machine B should be serviced every 6 months.', NULL),
    (4, 'Operation', 'Machine C', 'What is the maximum load for Machine C?', 'The maximum load for Machine C is 500 kg.', NULL),
    (5, 'Safety', 'Machine A', 'What safety precautions should be taken with Machine A?', 'Always wear protective gear and follow the safety manual.', NULL),
    
    -- Same machine and question but different solutions
    (6, 'Troubleshooting', 'Machine A', 'Why is Machine A not starting?', 'Ensure the machine is plugged in and check the fuse.', NULL),
    (7, 'Troubleshooting', 'Machine A', 'Why is Machine A not starting?', 'Verify that the emergency stop is disengaged.', NULL),

    (8, 'Installation', 'Machine B', 'What tools are needed to install Machine B?', 'You will need a screwdriver, a wrench, and a level.', NULL),
    (9, 'Operation', 'Machine C', 'How to calibrate Machine A?', 'Refer to the calibration section in the user manual.', NULL),
    (10, 'Maintenance', 'Machine C', 'How to clean Machine C?', 'Use a soft cloth and appropriate cleaning solution for maintenance.', NULL);

-- Insert sample ratings ensuring each Q&A has different total counts for likes and dislikes
-- Insert sample ratings ensuring each Q&A has different total counts for likes and dislikes
INSERT INTO ratings (qna_id, user_id, rating_value)
VALUES
    (1, 1, TRUE),   -- Like for Q&A id 1 by User 1 (John Doe)
    (1, 2, TRUE),   -- Like for Q&A id 1 by User 2 (Alice Johnson)
    (1, 3, FALSE),  -- Dislike for Q&A id 1 by User 3 (Michael Scott)

    (2, 4, TRUE),   -- Like for Q&A id 2 by User 4 (Rebecca Adams)
    (2, 1, TRUE),   -- Like for Q&A id 2 by User 1 (John Doe)
    (2, 2, FALSE),  -- Dislike for Q&A id 2 by User 2 (Alice Johnson)
    (2, 3, FALSE),  -- Dislike for Q&A id 2 by User 3 (Michael Scott)

    (3, 1, TRUE),   -- Like for Q&A id 3 by User 1 (John Doe)
    (3, 2, TRUE),   -- Like for Q&A id 3 by User 2 (Alice Johnson)
    (3, 4, FALSE),  -- Dislike for Q&A id 3 by User 4 (Rebecca Adams)

    (4, 3, TRUE),   -- Like for Q&A id 4 by User 3 (Michael Scott)
    (4, 4, TRUE),   -- Like for Q&A id 4 by User 4 (Rebecca Adams)
    (4, 1, FALSE),  -- Dislike for Q&A id 4 by User 1 (John Doe)

    (5, 2, TRUE),   -- Like for Q&A id 5 by User 2 (Alice Johnson)
    (5, 3, FALSE),  -- Dislike for Q&A id 5 by User 3 (Michael Scott)
    (5, 4, TRUE),   -- Like for Q&A id 5 by User 4 (Rebecca Adams)

    (6, 1, TRUE),   -- Like for Q&A id 6 by User 1 (John Doe)
    (6, 2, FALSE),  -- Dislike for Q&A id 6 by User 2 (Alice Johnson)

    (7, 3, TRUE),   -- Like for Q&A id 7 by User 3 (Michael Scott)
    (7, 4, TRUE),   -- Like for Q&A id 7 by User 4 (Rebecca Adams)
    (7, 1, FALSE),  -- Dislike for Q&A id 7 by User 1 (John Doe)

    (8, 2, TRUE),   -- Like for Q&A id 8 by User 2 (Alice Johnson)
    (8, 1, TRUE),   -- Like for Q&A id 8 by User 1 (John Doe)
    (8, 4, FALSE),  -- Dislike for Q&A id 8 by User 4 (Rebecca Adams)

    (9, 3, TRUE),   -- Like for Q&A id 9 by User 3 (Michael Scott)
    (9, 4, FALSE),  -- Dislike for Q&A id 9 by User 4 (Rebecca Adams)

    (10, 1, TRUE),  -- Like for Q&A id 10 by User 1 (John Doe)
    (10, 2, TRUE),  -- Like for Q&A id 10 by User 2 (Alice Johnson)
    (10, 3, FALSE); -- Dislike for Q&A id 10 by User 3 (Michael Scott)
