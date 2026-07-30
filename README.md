# Talenta-automation-project-phase-2

## Company Overview

**Talenta Partners Group** is a recruitment and staffing agency that connects qualified candidates with client companies across different industries including technology, finance, healthcare, and administration.

Recruiters handle a large amount of information every day, including:

- Candidate profiles and CVs.
- Job requirements.
- Application history.
- Interview evaluations.
- Hiring decisions.

As Talenta grows, the company wants to use an AI assistant to help recruiters analyze candidates and improve the recruitment workflow.

However, recruitment data contains sensitive personal information and important business decisions, so the AI assistant cannot have unrestricted access to the company database.

---

# Problem Statement

Talenta wants to build an **AI Recruitment Assistant** that helps recruiters with daily hiring operations:

- Searching for suitable candidates for open positions.
- Comparing candidate profiles with job requirements.
- Summarizing candidate experience and history.
- Generating interview preparation reports.
- Managing candidate pipeline decisions.

The current workflow requires recruiters to manually review CVs, search candidate records, and update hiring statuses.

This creates several challenges:

- Screening large numbers of candidates takes significant time.
- Decisions may vary between recruiters.
- Important application history may be missed.
- Unauthorized users may access or modify sensitive information.

The main challenge is providing an AI assistant with useful access to recruitment data while preventing unsafe actions.

---

# Proposed Solution: MCP-Based Recruitment Assistant

Instead of allowing the LLM to directly access Talenta's database, we introduce an **MCP Server** as a secure data access layer between the AI assistant and the database.

Architecture:
                Recruiter
                |
                |
                AI Assistant
                |
                |
                MCP Server
                |
                |
                Recruitment Database

The MCP Server is responsible for:

- Providing controlled access to company data.
- Enforcing user permissions.
- Validating tool inputs.
- Protecting sensitive operations.
- Requesting human approval when needed.
- Managing dynamic tool availability.

The LLM never communicates directly with the database.

---

# Database Design & ERD

The Talenta Recruitment Database models the complete recruitment workflow, including candidates, their skills, available job positions, job requirements, and candidate applications.

The database is implemented using **Microsoft SQL Server**.

## Database Entities

## Candidates

Stores basic candidate information:

- Candidate ID
- Full name
- Email
- Phone number
- Location
- Years of experience
- Education background


## CandidateSkills

Stores the skills associated with each candidate.

Relationship:


Candidate 1 ---- M CandidateSkills


A candidate can have multiple skills.

---

## Jobs

Stores available job opportunities at Talenta.

Attributes:

- Job ID
- Job title
- Department
- Required degree
- Minimum experience
- Job status


## JobSkills

Stores the required skills for each job.

Relationship:


Job 1 ---- M JobSkills


A job can require multiple skills.

---

## Applications

Represents the relationship between candidates and jobs.

Attributes:

- Application ID
- Candidate ID
- Job ID
- Application status
- Match score
- Recruiter notes
- Creation date


Relationship:


Candidate 1 ---- M Applications

Job 1 ---- M Applications


A candidate can apply for multiple jobs, and each job can have multiple candidates.

---

# ERD Diagram

The following diagram represents the database structure and relationships.

![Talenta Recruitment ERD](db/ERD%20Diagram.png)
---
