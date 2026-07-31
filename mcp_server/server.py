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
async def simulate_hr_login(ctx: Context) -> str:
    """Simulates an HR Manager logging into the system. Unlocks restricted tools"""
    global hr_logged_in
    hr_logged_in = True

    await ctx.session.send_notification("notifications/tools/list_changed")
    return "HR Manager logged in. Restricted tools are now available"


@mcp.tool()
def approve_final_hire(
    application_id: int = Field(
        ...,
        gt=0,
        description="Positive integer ID of the application to finalize. Must reference an existing application."
    )
) -> str:
    """Finalizes hiring for a candidate. Restricted to HR-authenticated sessions only."""

    if not hr_logged_in:
        return "Error: This tool requires an active HR Manager session"

    conn = get_connection()
    cursor = conn.cursor()

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
        return f"Error: Application {application_id} was already REJECTED and cannot be hired."

    if current_status == "ACCEPTED":
        conn.close()
        return f"Application {application_id} is already ACCEPTED. No changes made."

    cursor.execute(
        "UPDATE Applications SET status = ? WHERE application_id = ?",
        ("ACCEPTED", application_id)
    )
    conn.commit()
    conn.close()

    return f"Application {application_id} has been officially finalized as HIRED"


# Progress tracking
@mcp.tool()
async def batch_match_candidates(job_id: int, ctx: Context) -> str:
    """Matches all pending applicants against a job's required skills, reporting progress as it goes"""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT skill FROM JobSkills WHERE job_id = ?", (job_id,))
    required_skills = {r["skill"] for r in cursor.fetchall()}

    if not required_skills:
        conn.close()
        return f"Error: No skills found for job_id {job_id}. Check the job exists."

    cursor.execute(
        "SELECT application_id, candidate_id FROM Applications WHERE job_id = ? AND status = 'PENDING'",
        (job_id,)
    )
    pending_applications = cursor.fetchall()
    total = len(pending_applications)

    if total == 0:
        conn.close()
        return f"No pending applications found for job_id {job_id}."

    results = []

    for i, app in enumerate(pending_applications):
        cursor.execute(
            "SELECT skill FROM CandidateSkills WHERE candidate_id = ?",
            (app["candidate_id"],)
        )
        candidate_skills = {r["skill"] for r in cursor.fetchall()}

        overlap = candidate_skills & required_skills
        match_percentage = (len(overlap) / len(required_skills)) * 100

        results.append(f"App {app['application_id']}: {match_percentage:.1f}% match")

        await ctx.session.send_progress(
            progress=((i + 1) / total) * 100,
            total=100,
            message=f"Processed application {i + 1} of {total}"
        )
        await asyncio.sleep(0.3)

    conn.close()
    return "Batch matching complete for job " + str(job_id) + ":\n" + "\n".join(results)


# Sampling
@mcp.tool()
async def analyze_recruiter_note(application_id: int, ctx: Context) -> str:
    """Analyzes the sentiment of a recruiter's note for a given application using the client's model."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT recruiter_notes FROM Applications WHERE application_id = ?",
        (application_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return f"Error: Application {application_id} does not exist."

    note = row["recruiter_notes"]
    if not note:
        return f"Application {application_id} has no recruiter notes to analyze."

    response = await ctx.session.create_message(
        messages=[
            SamplingMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=f"Classify the sentiment of this recruiter note as exactly one word "
                         f"(POSITIVE, NEGATIVE, or NEUTRAL): \"{note}\""
                )
            )
        ],
        max_tokens=10
    )

    sentiment = response.content.text.strip()
    return f"Application {application_id} note: \"{note}\" → Sentiment: {sentiment}"


# Elicitation
@mcp.tool()
async def approve_final_hire_with_confirmation(
    application_id: int = Field(
        ...,
        gt=0,
        description="Positive integer ID of the application to finalize. Must reference an existing application."
    ),
    ctx: Context = None
) -> str:
    """Finalizes hiring for a candidate, pausing mid-call to request explicit human confirmation."""

    if not hr_logged_in:
        return "Error: This tool requires an active HR Manager session"

    conn = get_connection()
    cursor = conn.cursor()
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
        return f"Error: Application {application_id} was already REJECTED and cannot be hired."
    if current_status == "ACCEPTED":
        conn.close()
        return f"Application {application_id} is already ACCEPTED. No changes made."

    result = await ctx.session.elicit(
        message=f"Confirm hiring for application {application_id}? This action is irreversible.",
        requestedSchema={
            "type": "object",
            "properties": {
                "confirm": {
                    "type": "boolean",
                    "description": "Explicit HR confirmation to proceed with hiring"
                }
            },
            "required": ["confirm"]
        }
    )

    if result.action != "accept" or not result.content.get("confirm"):
        conn.close()
        return f"Hiring for application {application_id} was not confirmed. No changes made."

    cursor.execute(
        "UPDATE Applications SET status = ? WHERE application_id = ?",
        ("ACCEPTED", application_id)
    )
    conn.commit()
    conn.close()

    return f"Application {application_id} has been officially finalized as HIRED (confirmed by HR)."


# Prompts
@mcp.prompt()
def draft_interview_invite(candidate_name: str, job_title: str, interview_date: str) -> str:
    """A prompt template for generating an interview invitation email."""
    
    return f"""
    Please draft a professional and welcoming interview invitation email for a candidate named '{candidate_name}'.
    They have been shortlisted for the '{job_title}' position at Talenta.
    
    Include the following details:
    1. Congratulate them on passing the initial screening.
    2. Propose an interview scheduled for {interview_date}.
    3. Ask them to confirm their availability or suggest alternative times.
    4. Mention that the meeting link will be shared upon confirmation.
    5. Maintain a warm and professional tone.
    """


@mcp.prompt()
def draft_rejection_email(candidate_name: str, job_title: str) -> str:
    """Reusable starting point for drafting a polite rejection email to a candidate."""
    return (
        f"Draft a professional, respectful rejection email to {candidate_name} "
        f"regarding the {job_title} position at Talenta Recruitment. "
        f"Thank them for their time, keep the tone warm and encouraging, "
        f"and invite them to apply for future roles that match their skills."
    )


@mcp.prompt()
def draft_job_offer(candidate_name: str, job_title: str, salary: str) -> str:
    """A prompt template for generating a job offer email."""
    
    return f"""
    Please draft a formal job offer email for '{candidate_name}' who has been selected for the '{job_title}' role at Talenta.
    
    Include the following key points:
    1. Express our excitement to welcome them to the team.
    2. State the official job title ({job_title}) and the starting salary ({salary}).
    3. Mention that an official contract with full benefits and terms is attached (assume an attachment exists).
    4. Ask them to review the offer and reply by the end of the week.
    5. Keep the tone enthusiastic but formal.
    """


# run server
if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport...")
    mcp.run(transport="stdio")