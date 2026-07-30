CREATE DATABASE TalentaRecruitmentDB;

USE TalentaRecruitmentDB;

CREATE TABLE Candidates (
    candidate_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    experience_years INT DEFAULT 0,
    education VARCHAR(100)
);

CREATE TABLE CandidateSkills (
    id INT PRIMARY KEY IDENTITY(1,1),
    candidate_id INT NOT NULL,
    skill NVARCHAR(100) NOT NULL,

    CONSTRAINT FK_CandidateSkills_Candidates
    FOREIGN KEY (candidate_id)
    REFERENCES Candidates(candidate_id)
    ON DELETE CASCADE
);

CREATE TABLE Jobs (
    job_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(100) NOT NULL,
    department NVARCHAR(100),
    required_degree NVARCHAR(100),
    min_experience INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'OPEN'
);


CREATE TABLE Applications (
    application_id INT PRIMARY KEY IDENTITY(1,1),

    candidate_id INT NOT NULL,
    job_id INT NOT NULL,

    status NVARCHAR(50) DEFAULT 'PENDING',
    match_score DECIMAL(5,2),
    recruiter_notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),


    CONSTRAINT FK_Applications_Candidates
    FOREIGN KEY (candidate_id)
    REFERENCES Candidates(candidate_id)
    ON DELETE CASCADE,


    CONSTRAINT FK_Applications_Jobs
    FOREIGN KEY (job_id)
    REFERENCES Jobs(job_id)
    ON DELETE CASCADE
);


CREATE TABLE JobSkills (
    id INT PRIMARY KEY IDENTITY(1,1),

    job_id INT NOT NULL,
    skill NVARCHAR(100) NOT NULL,


    CONSTRAINT FK_JobSkills_Jobs
    FOREIGN KEY (job_id)
    REFERENCES Jobs(job_id)
    ON DELETE CASCADE
);



