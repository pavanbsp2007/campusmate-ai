-- ========================================================
-- CampusMate AI - Seed Data
-- Demo Student and Sample Data for Testing
-- ========================================================

-- Passwords hashed with bcrypt (campusmate123 -> $2a$10$wT5g8.u1G2/6Vq8XU7v45exzZqQJ9/oB6Xq1K0l6jT8xN1N1b4r2y)
-- We will also handle plain/hashed password checking in the auth service for seamless login.

INSERT INTO users (id, email, password_hash, role) VALUES 
('usr_student_01', 'student@campusmate.ai', '$2a$10$7Z2v6yG6N0W0J1Vw/s3hbe5v5wP8B2aN7n.2eK9cT1t8R8jE2z.ea', 'student'),
('usr_admin_01', 'admin@campusmate.ai', '$2a$10$7Z2v6yG6N0W0J1Vw/s3hbe5v5wP8B2aN7n.2eK9cT1t8R8jE2z.ea', 'admin'),
('usr_pro_01', 'pro@campusmate.ai', '$2a$10$7Z2v6yG6N0W0J1Vw/s3hbe5v5wP8B2aN7n.2eK9cT1t8R8jE2z.ea', 'student');

INSERT INTO student_profiles (id, user_id, full_name, college_name, course, semester, academic_year, avatar_url, bio) VALUES
('prf_01', 'usr_student_01', 'Aarav Sharma', 'National Institute of Technology', 'B.Tech Computer Science & Engineering', 5, '2024-2028', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'CS undergrad passionate about full-stack development and distributed systems.'),
('prf_02', 'usr_admin_01', 'Dr. Sarah Jenkins', 'National Institute of Technology', 'Administration & Academic Oversight', 8, '2024-2028', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'CampusMate System Administrator and Academic Affairs Dean.'),
('prf_03', 'usr_pro_01', 'Priya Patel', 'Indian Institute of Technology', 'B.Tech Artificial Intelligence & Data Science', 6, '2024-2028', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Student Pro Member researching Large Language Models.');

INSERT INTO subscriptions (id, user_id, plan_tier, status, ai_queries_used_today, ai_queries_limit) VALUES
('sub_01', 'usr_student_01', 'free', 'active', 2, 10),
('sub_02', 'usr_admin_01', 'pro', 'active', 0, 500),
('sub_03', 'usr_pro_01', 'pro', 'active', 12, 500);

-- Subjects for student 01
INSERT INTO subjects (id, user_id, code, name, credits, professor, color, semester, target_attendance_pct) VALUES
('sub_cs501', 'usr_student_01', 'CS501', 'Database Management Systems', 4, 'Prof. Ramesh Gupta', '#4F46E5', 5, 75),
('sub_cs502', 'usr_student_01', 'CS502', 'Operating Systems', 4, 'Dr. Sunita Rao', '#06B6D4', 5, 75),
('sub_cs503', 'usr_student_01', 'CS503', 'Computer Networks', 3, 'Prof. Alan Turing', '#10B981', 5, 75),
('sub_cs504', 'usr_student_01', 'CS504', 'Design & Analysis of Algorithms', 4, 'Dr. Rajesh Verma', '#F59E0B', 5, 75),
('sub_cs505', 'usr_student_01', 'CS505', 'Cloud Computing & DevOps', 3, 'Prof. Elena Rostova', '#EC4899', 5, 75);

-- Attendance Records
INSERT INTO attendance (id, user_id, subject_id, total_classes, attended_classes) VALUES
('att_01', 'usr_student_01', 'sub_cs501', 32, 28), -- 87.5%
('att_02', 'usr_student_01', 'sub_cs502', 30, 21), -- 70.0% (Warning!)
('att_03', 'usr_student_01', 'sub_cs503', 28, 25), -- 89.2%
('att_04', 'usr_student_01', 'sub_cs504', 35, 27), -- 77.1%
('att_05', 'usr_student_01', 'sub_cs505', 24, 20); -- 83.3%

-- Timetable (Weekly Schedule)
INSERT INTO timetables (id, user_id, subject_id, day_of_week, start_time, end_time, room_number, building, instructor) VALUES
('tt_01', 'usr_student_01', 'sub_cs501', 'Monday', '09:00', '10:00', 'LH-201', 'Tech Block A', 'Prof. Ramesh Gupta'),
('tt_02', 'usr_student_01', 'sub_cs502', 'Monday', '10:15', '11:15', 'Lab-3', 'Computer Center', 'Dr. Sunita Rao'),
('tt_03', 'usr_student_01', 'sub_cs504', 'Monday', '11:30', '12:30', 'LH-201', 'Tech Block A', 'Dr. Rajesh Verma'),

('tt_04', 'usr_student_01', 'sub_cs503', 'Tuesday', '09:00', '10:00', 'LH-104', 'Tech Block B', 'Prof. Alan Turing'),
('tt_05', 'usr_student_01', 'sub_cs505', 'Tuesday', '10:15', '11:15', 'LH-104', 'Tech Block B', 'Prof. Elena Rostova'),
('tt_06', 'usr_student_01', 'sub_cs501', 'Tuesday', '14:00', '16:00', 'DB-Lab', 'Computer Center', 'Prof. Ramesh Gupta'),

('tt_07', 'usr_student_01', 'sub_cs502', 'Wednesday', '09:00', '10:00', 'LH-201', 'Tech Block A', 'Dr. Sunita Rao'),
('tt_08', 'usr_student_01', 'sub_cs504', 'Wednesday', '10:15', '11:15', 'LH-201', 'Tech Block A', 'Dr. Rajesh Verma'),
('tt_09', 'usr_student_01', 'sub_cs503', 'Wednesday', '11:30', '12:30', 'Networks-Lab', 'Computer Center', 'Prof. Alan Turing'),

('tt_10', 'usr_student_01', 'sub_cs501', 'Thursday', '09:00', '10:00', 'LH-201', 'Tech Block A', 'Prof. Ramesh Gupta'),
('tt_11', 'usr_student_01', 'sub_cs505', 'Thursday', '10:15', '11:15', 'LH-104', 'Tech Block B', 'Prof. Elena Rostova'),
('tt_12', 'usr_student_01', 'sub_cs504', 'Thursday', '14:00', '15:00', 'LH-201', 'Tech Block A', 'Dr. Rajesh Verma'),

('tt_13', 'usr_student_01', 'sub_cs503', 'Friday', '09:00', '10:00', 'LH-104', 'Tech Block B', 'Prof. Alan Turing'),
('tt_14', 'usr_student_01', 'sub_cs502', 'Friday', '10:15', '11:15', 'LH-201', 'Tech Block A', 'Dr. Sunita Rao'),
('tt_15', 'usr_student_01', 'sub_cs505', 'Friday', '11:30', '13:30', 'Cloud-Lab', 'Computer Center', 'Prof. Elena Rostova');

-- Assignments
INSERT INTO assignments (id, user_id, subject_id, title, description, due_date, priority, status) VALUES
('asn_01', 'usr_student_01', 'sub_cs501', 'B+ Tree Indexing Implementation', 'Implement B+ Tree insertion and range search in C++ or Python with benchmark tests.', '2026-11-14 23:59:59', 'urgent', 'in_progress'),
('asn_02', 'usr_student_01', 'sub_cs502', 'Process Scheduling Simulation', 'Simulate Round Robin and Multi-Level Feedback Queue with turnaround time calculation.', '2026-11-18 23:59:59', 'high', 'pending'),
('asn_03', 'usr_student_01', 'sub_cs503', 'Packet Sniffer using Raw Sockets', 'Capture and parse Ethernet, IPv4, and TCP header fields in Wireshark format.', '2026-11-25 18:00:00', 'medium', 'pending'),
('asn_04', 'usr_student_01', 'sub_cs504', 'Dynamic Programming Problem Set', 'Solve 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication with proof.', '2026-11-10 23:59:59', 'urgent', 'completed');

-- Examinations Countdown
INSERT INTO examinations (id, user_id, subject_id, exam_name, exam_date, start_time, duration_minutes, room_number, syllabus_topics, target_score) VALUES
('ex_01', 'usr_student_01', 'sub_cs501', 'DBMS Mid-Term Exam', '2026-11-20', '10:00', 120, 'Exam Hall A-1', 'Relational Algebra, SQL, Normalization (1NF to BCNF), Transaction ACID properties', 90),
('ex_02', 'usr_student_01', 'sub_cs502', 'Operating Systems End-Term', '2026-11-28', '14:00', 180, 'Auditorium 2', 'Process synchronization, Deadlocks, Virtual memory & Paging, File systems', 85),
('ex_03', 'usr_student_01', 'sub_cs504', 'Algorithms Mid-Term', '2026-12-05', '10:00', 120, 'Exam Hall B-4', 'Divide and conquer, Greedy algorithms, Dynamic programming, Graph BFS/DFS', 95);

-- Study Goals
INSERT INTO study_goals (id, user_id, subject_id, title, target_date, target_hours, completed_hours, is_completed) VALUES
('sg_01', 'usr_student_01', 'sub_cs501', 'Master Normalization & BCNF decomposition', '2026-11-09', 3.0, 2.5, FALSE),
('sg_02', 'usr_student_01', 'sub_cs502', 'Solve Bankers Algorithm and Deadlock prevention', '2026-11-10', 2.5, 2.5, TRUE),
('sg_03', 'usr_student_01', 'sub_cs504', 'Practice 5 LeetCode Dynamic Programming problems', '2026-11-12', 4.0, 1.0, FALSE);

-- Past Semester Grades (SGPA/CGPA history)
INSERT INTO semester_grades (id, user_id, semester, subject_name, credits, grade_letter, grade_points) VALUES
('sg_sem1_1', 'usr_student_01', 1, 'Engineering Mathematics I', 4, 'A', 9.0),
('sg_sem1_2', 'usr_student_01', 1, 'Programming in C', 4, 'O', 10.0),
('sg_sem1_3', 'usr_student_01', 1, 'Digital Electronics', 3, 'A+', 9.5),
('sg_sem1_4', 'usr_student_01', 1, 'Basic Electrical Engineering', 3, 'B+', 8.0),
('sg_sem1_5', 'usr_student_01', 1, 'Physics for Engineers', 4, 'A', 9.0),

('sg_sem2_1', 'usr_student_01', 2, 'Engineering Mathematics II', 4, 'A+', 9.5),
('sg_sem2_2', 'usr_student_01', 2, 'Object Oriented Programming C++', 4, 'O', 10.0),
('sg_sem2_3', 'usr_student_01', 2, 'Data Structures Fundamentals', 4, 'O', 10.0),
('sg_sem2_4', 'usr_student_01', 2, 'Computer Organization', 3, 'A', 9.0),

('sg_sem3_1', 'usr_student_01', 3, 'Discrete Mathematics', 4, 'A', 9.0),
('sg_sem3_2', 'usr_student_01', 3, 'Advanced Data Structures', 4, 'O', 10.0),
('sg_sem3_3', 'usr_student_01', 3, 'Theory of Computation', 4, 'B+', 8.0),
('sg_sem3_4', 'usr_student_01', 3, 'Software Engineering Principles', 3, 'A+', 9.5),

('sg_sem4_1', 'usr_student_01', 4, 'Microprocessors & Interfacing', 4, 'A', 9.0),
('sg_sem4_2', 'usr_student_01', 4, 'Probability & Statistics', 3, 'A+', 9.5),
('sg_sem4_3', 'usr_student_01', 4, 'Web Development Technologies', 3, 'O', 10.0),
('sg_sem4_4', 'usr_student_01', 4, 'Java Enterprise Programming', 4, 'A+', 9.5);

-- Expenses
INSERT INTO expenses (id, user_id, amount, category, description, date, payment_mode) VALUES
('exp_01', 'usr_student_01', 120.00, 'food', 'Campus cafeteria lunch and coffee', '2026-11-08', 'UPI'),
('exp_02', 'usr_student_01', 650.00, 'books', 'Database System Concepts (Silberschatz) reference book', '2026-11-06', 'Card'),
('exp_03', 'usr_student_01', 50.00, 'transport', 'Metro recharge to college', '2026-11-05', 'UPI'),
('exp_04', 'usr_student_01', 250.00, 'entertainment', 'Weekend movie ticket with batchmates', '2026-11-02', 'UPI'),
('exp_05', 'usr_student_01', 80.00, 'food', 'Evening snacks at library cafe', '2026-11-04', 'UPI'),
('exp_06', 'usr_student_01', 3500.00, 'hostel', 'Hostel mess fee installment', '2026-11-01', 'NetBanking');

INSERT INTO monthly_budgets (id, user_id, month_year, budget_amount) VALUES
('mb_01', 'usr_student_01', '2026-11', 8000.00);

-- Notifications
INSERT INTO notifications (id, user_id, type, title, message, is_read, link) VALUES
('notif_01', 'usr_student_01', 'attendance', 'Attendance Alert: Operating Systems', 'Your attendance in Operating Systems is 70.0%, below the mandatory 75% threshold. Attend the next 3 classes.', FALSE, '/attendance'),
('notif_02', 'usr_student_01', 'assignment', 'Assignment Due Soon: B+ Tree Indexing', 'Assignment is due in 6 days. Make sure to commit your source code and documentation.', FALSE, '/assignments'),
('notif_03', 'usr_student_01', 'exam', 'DBMS Mid-Term in 12 Days', 'Check your personalized study plan for Database Management Systems.', FALSE, '/ai/exam-prep'),
('notif_04', 'usr_student_01', 'study', 'Daily Goal Reminder', 'You have 0.5 hours remaining to hit your 3-hour daily study target today.', TRUE, '/study-planner');

-- Shared Resources
INSERT INTO shared_resources (id, user_id, subject_name, title, category, file_url, file_size, description, upvotes, reports_count, status) VALUES
('res_01', 'usr_student_01', 'Database Management Systems', 'DBMS 2025 Mid-Term Question Paper with Solutions', 'pyq', 'https://example.com/pyq-dbms-2025.pdf', '2.4 MB', 'Official question paper with detailed step-by-step SQL & normalization solutions.', 42, 0, 'approved'),
('res_02', 'usr_student_01', 'Operating Systems', 'Complete OS Handwritten Revision Notes (Sem 5)', 'notes', 'https://example.com/os-notes-sem5.pdf', '8.1 MB', 'Covers concurrency, semaphores, memory management, and paging diagrams.', 88, 0, 'approved'),
('res_03', 'usr_student_01', 'Computer Networks', 'Socket Programming Lab Programs in C & Python', 'lab_code', 'https://example.com/cn-lab-programs.zip', '1.2 MB', 'TCP/UDP client-server echo, chat room, and sliding window protocol implementation.', 35, 0, 'approved'),
('res_04', 'usr_student_01', 'Design & Analysis of Algorithms', 'Algorithm Formula & Time Complexity Cheat Sheet', 'cheat_sheet', 'https://example.com/algo-cheat-sheet.pdf', '540 KB', 'Quick cheat sheet covering Master Theorem, Big-O table, and graph algorithms.', 115, 0, 'approved');

-- Flashcard Decks & Sample Flashcards
INSERT INTO flashcard_decks (id, user_id, subject_id, title, description) VALUES
('deck_01', 'usr_student_01', 'sub_cs501', 'DBMS Normalization & ACID Properties', 'Essential concepts for campus placements and semester examinations.');

INSERT INTO flashcards (id, deck_id, question, answer, difficulty, review_count) VALUES
('fc_01', 'deck_01', 'What are the ACID properties in DBMS?', 'Atomicity (all or nothing), Consistency (preserves database constraints), Isolation (concurrent execution yields serializable results), Durability (committed changes persist).', 'easy', 4),
('fc_02', 'deck_01', 'What is the condition for Boyce-Codd Normal Form (BCNF)?', 'A relation is in BCNF if for every functional dependency X -> Y, X is a superkey of the relation.', 'medium', 2),
('fc_03', 'deck_01', 'Explain the difference between clustered and non-clustered indexes.', 'A clustered index determines the physical order of data in a table (only 1 per table). A non-clustered index stores data in one place and indices in another, with pointers to data locations.', 'hard', 1);

-- Sample Quiz
INSERT INTO quizzes (id, user_id, subject_id, title, topic) VALUES
('quiz_01', 'usr_student_01', 'sub_cs501', 'DBMS Fundamentals Quiz', 'SQL, Indexing and Transactions');

INSERT INTO quiz_questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
('qq_01', 'quiz_01', 'Which normal form is based on the concept of full functional dependency?', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF', 'B', '2NF removes partial functional dependencies, requiring all non-prime attributes to be fully functionally dependent on candidate keys.'),
('qq_02', 'quiz_01', 'Which of the following guarantees that either all the database actions occur or none do?', 'Isolation', 'Durability', 'Atomicity', 'Consistency', 'C', 'Atomicity ensures that all operations within a work unit are completed successfully, otherwise the transaction is aborted at the point of failure and all previous operations are rolled back.'),
('qq_03', 'quiz_01', 'Which data structure is most commonly used in database indexes for range queries?', 'Binary Search Tree', 'Hash Map', 'B+ Tree', 'Heap', 'C', 'B+ Trees keep data sorted and link all leaf nodes in a singly or doubly linked list, making sequential range scans extremely fast.');
