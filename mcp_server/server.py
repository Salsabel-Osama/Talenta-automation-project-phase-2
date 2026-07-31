from mcp.server.fastmcp import FastMCP, Context
import asyncio
from db import get_connection
from mcp.types import SamplingMessage, TextContent


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
def approve_final_hire(application_id: int) -> str:
    """Finalizes hiring for a candidate. Restricted to HR-authenticated sessions only"""

    if not hr_logged_in:
        return "Error: This tool requires an active HR Manager session"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT application_id, status FROM Applications WHERE application_id = ?", (application_id,))
    row = cursor.fetchone()

    if row is None:
        conn.close()
        return f"Error: Application {application_id} does not exist."

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


# run server
if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport...")
    mcp.run(transport="stdio")