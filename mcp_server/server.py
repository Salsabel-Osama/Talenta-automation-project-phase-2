from validation import validate_or_raise
from mcp.server.fastmcp import FastMCP, Context
import asyncio
from db import get_connection
from mcp.types import SamplingMessage, TextContent
from pydantic import Field


# Capability negotiation & Transports
mcp = FastMCP("TalentaRecruitmentServer")


# Resources
@mcp.resource("talenta://policies/hiring")
def get_hiring_policies() -> str:
    """ Talenta's official hiring policies and constraints"""
    
    return """
    TALENTA OFFICIAL HIRING POLICIES & EVALUATION RULES:

    1. Experience Constraint: 
       A candidate MUST NOT be accepted if their `experience_years` (from Candidates table) is strictly less than the job's `min_experience` (from Jobs table). Such applications should be marked as 'REJECTED'.

    2. Education Matching:
       The candidate's `education` should closely match the job's `required_degree`. If it is completely unrelated, flag the application for manual review ('PENDING').

    3. Match Score Threshold:
       Applications with a calculated `match_score` (based on overlapping CandidateSkills and JobSkills) below 75.00% cannot be automatically accepted. They must remain 'PENDING' for HR review.

    4. Zero-Tolerance Policy:
       Any candidate applying for a job in the 'Cybersecurity' department without 'Linux' or 'Networking' skills must be 'REJECTED' immediately.

    5. Human-in-the-Loop Rule:
       The AI is authorized to automatically reject candidates who violate rules 1 and 4. However, moving an application to 'ACCEPTED' requires explicit confirmation from a logged-in HR Manager.
    """


# Notifications
hr_logged_in = False

@mcp.tool()
async def simulate_hr_login(
    username: str,
    role: str,
    ctx: Context
) -> str:
    """Simulates an HR Manager logging into the system and unlocks restricted tools."""

    validate_or_raise(
        "hr_login",
        {
            "username": username,
            "role": role
        }
    )

    global hr_logged_in
    hr_logged_in = True

    await ctx.session.send_notification(
        "notifications/tools/list_changed"
    )

    return f"{username} logged in successfully as {role}. Restricted tools are now available."
@mcp.tool()
def approve_final_hire(
    application_id: int,
    approved_by: str,
    approval_reason: str
) -> str:
    """Finalizes hiring for a candidate. Restricted to HR-authenticated sessions only."""

    # JSON Schema Validation
    validate_or_raise(
        "approve_hire",
        {
            "application_id": application_id,
            "approved_by": approved_by,
            "approval_reason": approval_reason
        }
    )

    # Authorization Check
    if not hr_logged_in:
        return "Error: This tool requires an active HR Manager session"

    conn = get_connection()
    cursor = conn.cursor()

    # Server-side Validation
    cursor.execute(
        "SELECT application_id, status FROM Applications WHERE application_id = ?",
        (application_id,)
    )

    row = cursor.fetchone()

    if row is None:
        conn.close()
        return f"Error: Application {application_id} does not exist."

    current_status = row["status"]

    if current_status == "REJECTED":
        conn.close()
        return (
            f"Error: Application {application_id} was already REJECTED "
            "and cannot be hired."
        )

    if current_status == "ACCEPTED":
        conn.close()
        return (
            f"Application {application_id} is already ACCEPTED. "
            "No changes made."
        )

    cursor.execute(
        """
        UPDATE Applications
        SET status = ?
        WHERE application_id = ?
        """,
        ("ACCEPTED", application_id)
    )

    conn.commit()
    conn.close()

    return (
        f"Application {application_id} has been officially "
        "finalized as HIRED."
    )

# Progress tracking
@mcp.tool()
async def batch_match_candidates(
    job_id: int,
    minimum_match: float,
    include_pending: bool,
    ctx: Context
) -> str:
    """Matches applicants against a job's required skills, reporting progress throughout the process."""

    # JSON Schema Validation
    validate_or_raise(
        "batch_match",
        {
            "job_id": job_id,
            "minimum_match": minimum_match,
            "include_pending": include_pending
        }
    )

    conn = get_connection()
    cursor = conn.cursor()

    # Get required job skills
    cursor.execute(
        "SELECT skill FROM JobSkills WHERE job_id = ?",
        (job_id,)
    )

    required_skills = {r["skill"] for r in cursor.fetchall()}

    if not required_skills:
        conn.close()
        return f"Error: No skills found for job_id {job_id}."

    # Get applications
    if include_pending:
        cursor.execute(
            """
            SELECT application_id, candidate_id
            FROM Applications
            WHERE job_id = ?
            """,
            (job_id,)
        )
    else:
        cursor.execute(
            """
            SELECT application_id, candidate_id
            FROM Applications
            WHERE job_id = ?
            AND status = 'PENDING'
            """,
            (job_id,)
        )

    applications = cursor.fetchall()

    total = len(applications)

    if total == 0:
        conn.close()
        return f"No matching applications found for job {job_id}."

    results = []

    for i, app in enumerate(applications):

        cursor.execute(
            """
            SELECT skill
            FROM CandidateSkills
            WHERE candidate_id = ?
            """,
            (app["candidate_id"],)
        )

        candidate_skills = {r["skill"] for r in cursor.fetchall()}

        overlap = candidate_skills & required_skills
        match_percentage = (len(overlap) / len(required_skills)) * 100

        # استخدمي minimum_match فعليًا
        if match_percentage >= minimum_match:
            results.append(
                f"Application {app['application_id']} : {match_percentage:.1f}% match"
            )

        await ctx.session.send_progress(
            progress=((i + 1) / total) * 100,
            total=100,
            message=f"Processed application {i + 1} of {total}"
        )

        await asyncio.sleep(0.3)

    conn.close()

    return (
        f"Batch matching completed for Job {job_id}.\n\n"
        + "\n".join(results)
    )
# Sampling
@mcp.tool()
async def analyze_recruiter_note(
    application_id: int,
    analysis_type: str,
    ctx: Context
) -> str:
    """Analyzes recruiter notes using the client's model."""

    # JSON Schema Validation
    validate_or_raise(
        "analyze_note",
        {
            "application_id": application_id,
            "analysis_type": analysis_type
        }
    )

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT recruiter_notes
        FROM Applications
        WHERE application_id = ?
        """,
        (application_id,)
    )

    row = cursor.fetchone()

    if row is None:
        conn.close()
        return f"Error: Application {application_id} does not exist."

    note = row["recruiter_notes"]

    if not note:
        conn.close()
        return f"Application {application_id} has no recruiter notes."

    conn.close()

    # Build prompt based on analysis type
    if analysis_type == "sentiment":
        prompt = (
            f'Classify the sentiment of this recruiter note as exactly one word '
            f'(POSITIVE, NEGATIVE, or NEUTRAL): "{note}"'
        )

    elif analysis_type == "summary":
        prompt = (
            f"Summarize the following recruiter note in one short paragraph:\n\n{note}"
        )

    elif analysis_type == "risk":
        prompt = (
            f"Analyze this recruiter note and identify any hiring risks. "
            f"Respond with a short explanation:\n\n{note}"
        )

    response = await ctx.session.create_message(
        messages=[
            SamplingMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=prompt
                )
            )
        ],
        max_tokens=100
    )

    result = response.content.text.strip()

    return (
        f"Analysis Type: {analysis_type.upper()}\n\n"
        f"Recruiter Note:\n{note}\n\n"
        f"Result:\n{result}"
    )

# Elicitation
@mcp.tool()
async def approve_final_hire_with_confirmation(
    application_id: int,
    approved_by: str,
    approval_reason: str,
    ctx: Context
) -> str:
    """Finalizes hiring after explicit HR confirmation."""

    # JSON Schema Validation
    validate_or_raise(
        "approve_hire",
        {
            "application_id": application_id,
            "approved_by": approved_by,
            "approval_reason": approval_reason
        }
    )

    # Authorization Check
    if not hr_logged_in:
        return "Error: This tool requires an active HR Manager session"

    conn = get_connection()
    cursor = conn.cursor()

    # Server-side Validation
    cursor.execute(
        """
        SELECT application_id, status
        FROM Applications
        WHERE application_id = ?
        """,
        (application_id,)
    )

    row = cursor.fetchone()

    if row is None:
        conn.close()
        return f"Error: Application {application_id} does not exist."

    current_status = row["status"]

    if current_status == "REJECTED":
        conn.close()
        return (
            f"Error: Application {application_id} was already REJECTED "
            "and cannot be hired."
        )

    if current_status == "ACCEPTED":
        conn.close()
        return (
            f"Application {application_id} is already ACCEPTED. "
            "No changes made."
        )

    # Human-in-the-loop (Elicitation)
    result = await ctx.session.elicit(
        message=(
            f"HR Manager '{approved_by}' wants to approve "
            f"Application {application_id}.\n\n"
            f"Reason:\n{approval_reason}\n\n"
            "Do you confirm this hiring decision?"
        ),
        requestedSchema={
            "type": "object",
            "properties": {
                "confirm": {
                    "type": "boolean",
                    "description": "Approve or reject the hiring decision."
                }
            },
            "required": ["confirm"],
            "additionalProperties": False
        }
    )

    if result.action != "accept" or not result.content.get("confirm"):
        conn.close()
        return (
            f"Hiring for application {application_id} "
            "was cancelled by the HR Manager."
        )

    cursor.execute(
        """
        UPDATE Applications
        SET status = ?
        WHERE application_id = ?
        """,
        ("ACCEPTED", application_id)
    )

    conn.commit()
    conn.close()

    return (
        f"Application {application_id} has been officially "
        f"approved by {approved_by}."
    )
@mcp.prompt()
def draft_interview_invite(
    candidate_name: str,
    job_title: str,
    interview_date: str
) -> str:
    """A prompt template for generating an interview invitation email."""

    # JSON Schema Validation
    validate_or_raise(
        "interview_prompt",
        {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": interview_date
        }
    )

    return f"""
Please draft a professional and welcoming interview invitation email for a candidate named '{candidate_name}'.

They have been shortlisted for the '{job_title}' position at Talenta Recruitment.

Include the following details:
1. Congratulate them on passing the initial screening.
2. Propose an interview scheduled for {interview_date}.
3. Ask them to confirm their availability or suggest an alternative time.
4. Mention that the meeting link will be shared after confirmation.
5. Maintain a warm, professional, and encouraging tone.
"""

@mcp.prompt()
def draft_rejection_email(
    candidate_name: str,
    job_title: str
) -> str:
    """Reusable starting point for drafting a polite rejection email to a candidate."""

    # JSON Schema Validation
    validate_or_raise(
        "rejection_prompt",
        {
            "candidate_name": candidate_name,
            "job_title": job_title
        }
    )

    return (
        f"Draft a professional, respectful rejection email to {candidate_name} "
        f"regarding the {job_title} position at Talenta Recruitment. "
        f"Thank them for their time, keep the tone warm and encouraging, "
        f"and invite them to apply for future roles that match their skills."
    )

@mcp.prompt()
def draft_job_offer(
    candidate_name: str,
    job_title: str,
    salary: str
) -> str:
    """A prompt template for generating a job offer email."""

    # JSON Schema Validation
    validate_or_raise(
        "job_offer",
        {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "salary": salary
        }
    )

    return f"""
Please draft a formal job offer email for '{candidate_name}' who has been selected for the '{job_title}' role at Talenta Recruitment.

Include the following key points:

1. Express our excitement to welcome them to the team.
2. State the official job title ({job_title}) and the starting salary ({salary}).
3. Mention that an official employment contract with benefits is attached.
4. Ask the candidate to review the offer and reply by the end of the week.
5. Maintain a professional, welcoming, and enthusiastic tone.
"""


# run server
if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport...")
    mcp.run(transport="stdio")