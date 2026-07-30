


INSERT INTO Candidates 
(name, email, phone, location, experience_years, education)
VALUES
(N'Ahmed Hassan', 'ahmed.hassan@gmail.com', '01011111111', N'Cairo', 3, N'Computer Science'),
(N'Sara Mohamed', 'sara.mohamed@gmail.com', '01022222222', N'Alexandria', 2, N'Data Science'),
(N'Omar Ali', 'omar.ali@gmail.com', '01033333333', N'Giza', 5, N'Information Systems'),
(N'Mariam Adel', 'mariam.adel@gmail.com', '01044444444', N'Cairo', 1, N'Computer Engineering'),
(N'Youssef Khaled', 'youssef.khaled@gmail.com', '01055555555', N'Mansoura', 4, N'Software Engineering');


INSERT INTO CandidateSkills
(candidate_id, skill)
VALUES
(1, 'Python'),
(1, 'SQL'),
(1, 'Machine Learning'),

(2, 'Python'),
(2, 'Pandas'),
(2, 'SQL'),

(3, 'Java'),
(3, 'SQL'),
(3, 'Spring Boot'),

(4, 'Python'),
(4, 'Data Analysis'),

(5, 'C#'),
(5, 'SQL'),
(5, 'Azure');


INSERT INTO Jobs
(title, department, required_degree, min_experience, status)
VALUES
(N'Data Engineer',
 N'Data Department',
 N'Computer Science',
 2,
 'OPEN'),

(N'Backend Developer',
 N'Engineering',
 N'Computer Science',
 3,
 'OPEN'),

(N'Machine Learning Engineer',
 N'AI Department',
 N'Data Science',
 2,
 'OPEN'),

(N'Software Engineer',
 N'Engineering',
 N'Computer Engineering',
 1,
 'CLOSED');


 INSERT INTO JobSkills
(job_id, skill)
VALUES

-- Data Engineer
(1, 'Python'),
(1, 'SQL'),
(1, 'Spark'),
(1, 'Azure'),

-- Backend Developer
(2, 'Java'),
(2, 'Spring Boot'),
(2, 'SQL'),

-- ML Engineer
(3, 'Python'),
(3, 'Machine Learning'),
(3, 'Pandas'),

-- Software Engineer
(4, 'C#'),
(4, '.NET');


INSERT INTO Applications
(candidate_id, job_id, status, match_score, recruiter_notes)
VALUES

(1, 1, 'ACCEPTED', 92.50, 
 N'Strong Python and SQL background'),

(2, 1, 'ACCEPTED', 85.00,
 N'Good data analysis skills'),

(3, 2, 'ACCEPTED', 90.00,
 N'Experienced backend developer'),

(4, 3, 'PENDING', 75.50,
 N'Needs more ML experience'),

(5, 2, 'REJECTED', 60.00,
 N'Missing required backend technologies');

 


 INSERT INTO Candidates 
(name, email, phone, location, experience_years, education)
VALUES

(N'Noha Ibrahim', 'noha.ibrahim@gmail.com', '01066666666', N'Alexandria', 3, N'Data Science'),

(N'Karim Mostafa', 'karim.mostafa@gmail.com', '01077777777', N'Cairo', 6, N'Computer Science'),

(N'Layla Samir', 'layla.samir@gmail.com', '01088888888', N'Giza', 2, N'Information Technology'),

(N'Adam Fathy', 'adam.fathy@gmail.com', '01099999999', N'Cairo', 4, N'Computer Engineering'),

(N'Hana Mahmoud', 'hana.mahmoud@gmail.com', '01111111111', N'Alexandria', 1, N'Data Science'),

(N'Mahmoud Tarek', 'mahmoud.tarek@gmail.com', '01122222222', N'Zagazig', 5, N'Software Engineering'),

(N'Reem Ahmed', 'reem.ahmed@gmail.com', '01133333333', N'Cairo', 3, N'Computer Science'),

(N'Khaled Saad', 'khaled.saad@gmail.com', '01144444444', N'Mansoura', 7, N'Computer Engineering'),

(N'Mona Ehab', 'mona.ehab@gmail.com', '01155555555', N'Alexandria', 2, N'Information Systems'),

(N'Tarek Nabil', 'tarek.nabil@gmail.com', '01166666666', N'Cairo', 8, N'Computer Science'),

(N'Dina Adel', 'dina.adel@gmail.com', '01177777777', N'Alexandria', 4, N'Data Science'),

(N'Amr Hassan', 'amr.hassan@gmail.com', '01188888888', N'Cairo', 3, N'Software Engineering'),

(N'Salma Youssef', 'salma.youssef@gmail.com', '01199999999', N'Giza', 2, N'Computer Science'),

(N'Hossam Reda', 'hossam.reda@gmail.com', '01211111111', N'Cairo', 6, N'Information Systems'),

(N'Farah Ali', 'farah.ali@gmail.com', '01222222222', N'Alexandria', 1, N'Computer Science');


INSERT INTO CandidateSkills
(candidate_id, skill)
VALUES

(6,'SQL'),
(6,'Python'),
(6,'Spark'),

(7,'Java'),
(7,'Spring Boot'),
(7,'Docker'),

(8,'Python'),
(8,'Machine Learning'),
(8,'TensorFlow'),

(9,'C++'),
(9,'Algorithms'),
(9,'Data Structures'),

(10,'Python'),
(10,'SQL'),
(10,'Power BI'),

(11,'Azure'),
(11,'SQL'),
(11,'Data Engineering'),

(12,'JavaScript'),
(12,'React'),
(12,'Node.js'),

(13,'Python'),
(13,'Pandas'),
(13,'NumPy'),

(14,'C#'),
(14,'ASP.NET'),
(14,'SQL'),

(15,'AWS'),
(15,'Docker'),
(15,'Kubernetes'),

(16,'Python'),
(16,'SQL'),
(16,'Machine Learning'),

(17,'Java'),
(17,'Spring Boot'),
(17,'SQL'),

(18,'Power BI'),
(18,'Excel'),
(18,'Data Analysis'),

(19,'Cybersecurity'),
(19,'Networking'),
(19,'Linux'),

(20,'Python'),
(20,'Deep Learning'),
(20,'PyTorch');


INSERT INTO Jobs
(title, department, required_degree, min_experience, status)
VALUES

(N'Data Analyst',
 N'Analytics',
 N'Data Science',
 1,
 'OPEN'),

(N'Database Administrator',
 N'IT',
 N'Computer Science',
 3,
 'OPEN'),

(N'Cloud Engineer',
 N'Cloud Department',
 N'Computer Engineering',
 2,
 'OPEN'),

(N'DevOps Engineer',
 N'Infrastructure',
 N'Computer Science',
 3,
 'OPEN'),

(N'AI Engineer',
 N'Artificial Intelligence',
 N'Data Science',
 3,
 'OPEN'),

(N'Frontend Developer',
 N'Frontend Team',
 N'Computer Science',
 1,
 'OPEN'),

(N'Security Engineer',
 N'Cybersecurity',
 N'Information Systems',
 2,
 'OPEN'),

(N'BI Developer',
 N'Business Intelligence',
 N'Data Science',
 2,
 'OPEN');



INSERT INTO JobSkills
(job_id, skill)
VALUES

(5,'Python'),
(5,'SQL'),
(5,'Power BI'),

(6,'SQL'),
(6,'Database'),
(6,'SQL Server'),

(7,'Azure'),
(7,'Cloud'),
(7,'Docker'),

(8,'Docker'),
(8,'Kubernetes'),
(8,'Linux'),

(9,'Python'),
(9,'Deep Learning'),
(9,'TensorFlow'),

(10,'JavaScript'),
(10,'React'),
(10,'HTML'),

(11,'Cybersecurity'),
(11,'Linux'),
(11,'Networking'),

(12,'Power BI'),
(12,'SQL'),
(12,'Excel');



INSERT INTO Applications
(candidate_id, job_id, status, match_score, recruiter_notes)
VALUES

(6,1,'ACCEPTED',88.00,N'Excellent data engineering skills'),

(7,2,'ACCEPTED',91.50,N'Strong backend experience'),

(8,9,'PENDING',86.00,N'Good AI background'),

(9,2,'REJECTED',55.00,N'Insufficient experience'),

(10,5,'ACCEPTED',93.00,N'Strong analytics profile'),

(11,7,'PENDING',82.50,N'Cloud experience available'),

(12,10,'ACCEPTED',90.00,N'Frontend experience matches'),

(13,5,'ACCEPTED',87.00,N'Good Python and ML skills'),

(14,2,'PENDING',78.00,N'Needs interview'),

(15,8,'ACCEPTED',89.00,N'DevOps skills match'),

(16,9,'ACCEPTED',94.00,N'Excellent ML candidate'),

(17,2,'ACCEPTED',92.00,N'Backend specialist'),

(18,12,'ACCEPTED',85.50,N'Good BI skills'),

(19,11,'PENDING',80.00,N'Security background'),

(20,9,'ACCEPTED',96.00,N'Strong deep learning profile');

