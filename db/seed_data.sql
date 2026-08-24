INSERT INTO Candidates 
(name, email, phone, location, experience_years, education)
VALUES
('Ahmed Hassan', 'ahmed.hassan@gmail.com', '01011111111', 'Cairo', 3, 'Computer Science'),
('Sara Mohamed', 'sara.mohamed@gmail.com', '01022222222', 'Alexandria', 2, 'Data Science'),
('Omar Ali', 'omar.ali@gmail.com', '01033333333', 'Giza', 5, 'Information Systems'),
('Mariam Adel', 'mariam.adel@gmail.com', '01044444444', 'Cairo', 1, 'Computer Engineering'),
('Youssef Khaled', 'youssef.khaled@gmail.com', '01055555555', 'Mansoura', 4, 'Software Engineering');

INSERT INTO CandidateSkills (candidate_id, skill) VALUES
(1, 'Python'), (1, 'SQL'), (1, 'Machine Learning'),
(2, 'Python'), (2, 'Pandas'), (2, 'SQL'),
(3, 'Java'), (3, 'SQL'), (3, 'Spring Boot'),
(4, 'Python'), (4, 'Data Analysis'),
(5, 'C#'), (5, 'SQL'), (5, 'Azure');

INSERT INTO Jobs (title, department, required_degree, min_experience, status) VALUES
('Data Engineer', 'Data Department', 'Computer Science', 2, 'OPEN'),
('Backend Developer', 'Engineering', 'Computer Science', 3, 'OPEN'),
('Machine Learning Engineer', 'AI Department', 'Data Science', 2, 'OPEN'),
('Software Engineer', 'Engineering', 'Computer Engineering', 1, 'CLOSED');

INSERT INTO JobSkills (job_id, skill) VALUES
(1, 'Python'), (1, 'SQL'), (1, 'Spark'), (1, 'Azure'),
(2, 'Java'), (2, 'Spring Boot'), (2, 'SQL'),
(3, 'Python'), (3, 'Machine Learning'), (3, 'Pandas'),
(4, 'C#'), (4, '.NET');

INSERT INTO Applications (candidate_id, job_id, status, match_score, recruiter_notes) VALUES
(1, 1, 'ACCEPTED', 92.50, 'Strong Python and SQL background'),
(2, 1, 'ACCEPTED', 85.00, 'Good data analysis skills'),
(3, 2, 'ACCEPTED', 90.00, 'Experienced backend developer'),
(4, 3, 'PENDING', 75.50, 'Needs more ML experience'),
(5, 2, 'REJECTED', 60.00, 'Missing required backend technologies');

INSERT INTO Candidates (name, email, phone, location, experience_years, education) VALUES
('Noha Ibrahim', 'noha.ibrahim@gmail.com', '01066666666', 'Alexandria', 3, 'Data Science'),
('Karim Mostafa', 'karim.mostafa@gmail.com', '01077777777', 'Cairo', 6, 'Computer Science'),
('Layla Samir', 'layla.samir@gmail.com', '01088888888', 'Giza', 2, 'Information Technology'),
('Adam Fathy', 'adam.fathy@gmail.com', '01099999999', 'Cairo', 4, 'Computer Engineering'),
('Hana Mahmoud', 'hana.mahmoud@gmail.com', '01111111111', 'Alexandria', 1, 'Data Science'),
('Mahmoud Tarek', 'mahmoud.tarek@gmail.com', '01122222222', 'Zagazig', 5, 'Software Engineering'),
('Reem Ahmed', 'reem.ahmed@gmail.com', '01133333333', 'Cairo', 3, 'Computer Science'),
('Khaled Saad', 'khaled.saad@gmail.com', '01144444444', 'Mansoura', 7, 'Computer Engineering'),
('Mona Ehab', 'mona.ehab@gmail.com', '01155555555', 'Alexandria', 2, 'Information Systems'),
('Tarek Nabil', 'tarek.nabil@gmail.com', '01166666666', 'Cairo', 8, 'Computer Science'),
('Dina Adel', 'dina.adel@gmail.com', '01177777777', 'Alexandria', 4, 'Data Science'),
('Amr Hassan', 'amr.hassan@gmail.com', '01188888888', 'Cairo', 3, 'Software Engineering'),
('Salma Youssef', 'salma.youssef@gmail.com', '01199999999', 'Giza', 2, 'Computer Science'),
('Hossam Reda', 'hossam.reda@gmail.com', '01211111111', 'Cairo', 6, 'Information Systems'),
('Farah Ali', 'farah.ali@gmail.com', '01222222222', 'Alexandria', 1, 'Computer Science');

INSERT INTO CandidateSkills (candidate_id, skill) VALUES
(6,'SQL'), (6,'Python'), (6,'Spark'),
(7,'Java'), (7,'Spring Boot'), (7,'Docker'),
(8,'Python'), (8,'Machine Learning'), (8,'TensorFlow'),
(9,'C++'), (9,'Algorithms'), (9,'Data Structures'),
(10,'Python'), (10,'SQL'), (10,'Power BI'),
(11,'Azure'), (11,'SQL'), (11,'Data Engineering'),
(12,'JavaScript'), (12,'React'), (12,'Node.js'),
(13,'Python'), (13,'Pandas'), (13,'NumPy'),
(14,'C#'), (14,'ASP.NET'), (14,'SQL'),
(15,'AWS'), (15,'Docker'), (15,'Kubernetes'),
(16,'Python'), (16,'SQL'), (16,'Machine Learning'),
(17,'Java'), (17,'Spring Boot'), (17,'SQL'),
(18,'Power BI'), (18,'Excel'), (18,'Data Analysis'),
(19,'Cybersecurity'), (19,'Networking'), (19,'Linux'),
(20,'Python'), (20,'Deep Learning'), (20,'PyTorch');

INSERT INTO Jobs (title, department, required_degree, min_experience, status) VALUES
('Data Analyst', 'Analytics', 'Data Science', 1, 'OPEN'),
('Database Administrator', 'IT', 'Computer Science', 3, 'OPEN'),
('Cloud Engineer', 'Cloud Department', 'Computer Engineering', 2, 'OPEN'),
('DevOps Engineer', 'Infrastructure', 'Computer Science', 3, 'OPEN'),
('AI Engineer', 'Artificial Intelligence', 'Data Science', 3, 'OPEN'),
('Frontend Developer', 'Frontend Team', 'Computer Science', 1, 'OPEN'),
('Security Engineer', 'Cybersecurity', 'Information Systems', 2, 'OPEN'),
('BI Developer', 'Business Intelligence', 'Data Science', 2, 'OPEN');

INSERT INTO JobSkills (job_id, skill) VALUES
(5,'Python'), (5,'SQL'), (5,'Power BI'),
(6,'SQL'), (6,'Database'), (6,'SQL Server'),
(7,'Azure'), (7,'Cloud'), (7,'Docker'),
(8,'Docker'), (8,'Kubernetes'), (8,'Linux'),
(9,'Python'), (9,'Deep Learning'), (9,'TensorFlow'),
(10,'JavaScript'), (10,'React'), (10,'HTML'),
(11,'Cybersecurity'), (11,'Linux'), (11,'Networking'),
(12,'Power BI'), (12,'SQL'), (12,'Excel');

INSERT INTO Applications (candidate_id, job_id, status, match_score, recruiter_notes) VALUES
(6,1,'ACCEPTED',88.00,'Excellent data engineering skills'),
(7,2,'ACCEPTED',91.50,'Strong backend experience'),
(8,9,'PENDING',86.00,'Good AI background'),
(9,2,'REJECTED',55.00,'Insufficient experience'),
(10,5,'ACCEPTED',93.00,'Strong analytics profile'),
(11,7,'PENDING',82.50,'Cloud experience available'),
(12,10,'ACCEPTED',90.00,'Frontend experience matches'),
(13,5,'ACCEPTED',87.00,'Good Python and ML skills'),
(14,2,'PENDING',78.00,'Needs interview'),
(15,8,'ACCEPTED',89.00,'DevOps skills match'),
(16,9,'ACCEPTED',94.00,'Excellent ML candidate'),
(17,2,'ACCEPTED',92.00,'Backend specialist'),
(18,12,'ACCEPTED',85.50,'Good BI skills'),
(19,11,'PENDING',80.00,'Security background'),
(20,9,'ACCEPTED',96.00,'Strong deep learning profile');