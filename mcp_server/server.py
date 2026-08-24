from __future__ import annotations

import asyncio
import os
import sys

from mcp.server.fastmcp import FastMCP, Context
from mcp.server.fastmcp.exceptions import ToolError
from mcp.types import SamplingMessage, TextContent
from mcp.types import Tool as MCPTool

from db import (
    get_connection,
    get_enabled_tool_names,
    get_or_create_agent,
    is_tool_enabled_for_agent,
    sync_agent_tool_catalog,
)
from validation import validate_or_raise


# ============================================================
# Agent Identity
# ============================================================
#
# Each connecting agent gets its own MCP server subprocess: see
# agent/client.py, where stdio_client spawns a fresh
# "python server.py" per connection. The agent identifies itself
# through the TALENTA_AGENT_NAME environment variable that the
# client sets before spawning (falls back to "default" so existing
# callers that don't set it yet keep working).
#
# Every tool below is still registered normally with @mcp.tool();
# nothing here edits or removes a tool's code at deploy time. What
# changes per agent is which of those tools are actually exposed,
# decided live against the agent_tools table so an admin's toggle
# on the platform reaches this agent on its very next
# list_tools()/call_tool() call -- no code edit, no redeploy, no
# server restart required.
#
# ============================================================

AGENT_NAME = os.environ.get(
    "TALENTA_AGENT_NAME",
    "default",
)

_agent_id_cache: int | None = None


def _get_agent_id() -> int:
    """
    Resolve (and cache for this process) the agents.agent_id row
    for AGENT_NAME, creating it on first contact if needed.
    """

    global _agent_id_cache

    if _agent_id_cache is None:

        agent_row = get_or_create_agent(
            AGENT_NAME,
            agent_type="mcp_client",
        )

        _agent_id_cache = agent_row["agent_id"]

    return _agent_id_cache


# ============================================================
# MCP Server
# ============================================================

class AgentScopedFastMCP(FastMCP):
    """
    A FastMCP server whose list_tools() / call_tool() are filtered
    per connecting agent against the live agent_tools table,
    instead of unconditionally exposing every @mcp.tool().
    """

    async def list_tools(self) -> list[MCPTool]:

        all_tools = await super().list_tools()

        agent_id = _get_agent_id()

        # Register any tool the code knows about that this agent
        # hasn't seen before (defaults to enabled). Idempotent, so
        # calling this on every list_tools() is safe.
        sync_agent_tool_catalog(
            agent_id,
            [tool.name for tool in all_tools],
        )

        enabled_names = get_enabled_tool_names(agent_id)

        return [
            tool
            for tool in all_tools
            if tool.name in enabled_names
        ]

    async def call_tool(
        self,
        name: str,
        arguments: dict,
    ):

        agent_id = _get_agent_id()

        if not is_tool_enabled_for_agent(agent_id, name):

            raise ToolError(
                f"Tool '{name}' is disabled for agent "
                f"'{AGENT_NAME}'. An admin can re-enable it from "
                f"the platform's tool management panel."
            )

        return await super().call_tool(name, arguments)


mcp = AgentScopedFastMCP(
    "TalentaRecruitmentServer"
)


# ============================================================
# Resources
# ============================================================

@mcp.resource(
    "talenta://policies/hiring"
)
def get_hiring_policies() -> str:
    """
    Talenta official hiring policies.
    """

    return """
TALENTA OFFICIAL HIRING POLICIES & EVALUATION RULES:

1. Experience Constraint:
   A candidate MUST NOT be accepted if their
   experience_years is strictly less than the job's
   min_experience.

2. Education Matching:
   Candidate education should closely match the
   required degree. Completely unrelated education
   requires manual review.

3. Match Score Threshold:
   Applications with match_score below 75.00%
   cannot be automatically accepted.

4. Zero-Tolerance Cybersecurity Policy:
   Candidates applying for Cybersecurity roles without
   Linux or Networking skills must be rejected.

5. Human-in-the-Loop:
   AI may automatically reject candidates violating
   mandatory rejection rules.

   Moving an application to ACCEPTED requires
   explicit HR Manager confirmation.
"""


# ============================================================
# HR Authentication Helper
# ============================================================

async def require_hr_manager(
    ctx: Context,
) -> bool:
    """
    Verify that the current MCP session is authenticated
    as an HR Manager.

    NOTE:
    The actual session authentication mechanism should be
    connected to the platform authentication layer.

    This helper intentionally avoids using a global
    process-wide login flag.
    """

    session = getattr(
        ctx,
        "session",
        None,
    )

    if session is None:
        return False

    # Placeholder until platform authentication is connected.
    #
    # The platform should provide authenticated user/session
    # information here.

    authenticated_user = getattr(
        session,
        "user",
        None,
    )

    if not authenticated_user:
        return False

    role = getattr(
        authenticated_user,
        "role",
        None,
    )

    return role == "HR_MANAGER"


# ============================================================
# HR Login
# ============================================================

@mcp.tool()
async def simulate_hr_login(
    username: str,
    role: str,
    ctx: Context,
) -> str:
    """
    Simulate HR Manager authentication.

    The real platform should replace this with proper
    session authentication.
    """

    validate_or_raise(
        "hr_login",
        {
            "username": username,
            "role": role,
        },
    )

    return (
        f"{username} logged in successfully "
        f"as {role}."
    )


# ============================================================
# Approve Final Hire
# ============================================================

@mcp.tool()
async def approve_final_hire(
    application_id: int,
    approved_by: str,
    approval_reason: str,
    ctx: Context,
) -> str:
    """
    Finalize hiring after HR authorization.

    This operation always requires explicit confirmation.
    """

    validate_or_raise(
        "approve_hire",
        {
            "application_id": application_id,
            "approved_by": approved_by,
            "approval_reason": approval_reason,
        },
    )

    if not await require_hr_manager(ctx):
        return (
            "Error: This tool requires an active "
            "HR Manager session."
        )

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                application_id,
                status
            FROM Applications
            WHERE application_id = ?
            """,
            (application_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return (
                f"Error: Application "
                f"{application_id} does not exist."
            )

        current_status = row["status"]

        if current_status == "REJECTED":
            return (
                f"Error: Application "
                f"{application_id} was already REJECTED "
                f"and cannot be hired."
            )

        if current_status == "ACCEPTED":
            return (
                f"Application {application_id} "
                f"is already ACCEPTED."
            )

        result = await ctx.session.elicit(
            message=(
                f"HR Manager '{approved_by}' wants to "
                f"approve Application {application_id}.\n\n"
                f"Reason:\n{approval_reason}\n\n"
                f"Do you confirm this hiring decision?"
            ),
            requestedSchema={
                "type": "object",
                "properties": {
                    "confirm": {
                        "type": "boolean",
                    }
                },
                "required": [
                    "confirm"
                ],
                "additionalProperties": False,
            },
        )

        if (
            result.action != "accept"
            or not result.content.get("confirm")
        ):
            return (
                f"Hiring for application "
                f"{application_id} was cancelled."
            )

        cursor.execute(
            """
            UPDATE Applications
            SET status = 'ACCEPTED'
            WHERE application_id = ?
            """,
            (application_id,),
        )

        conn.commit()

        return (
            f"Application {application_id} "
            f"has been officially approved "
            f"by {approved_by}."
        )

    finally:

        conn.close()


# ============================================================
# Batch Match
# ============================================================

@mcp.tool()
async def batch_match_candidates(
    job_id: int,
    minimum_match: float,
    include_pending: bool,
    ctx: Context,
) -> str:
    """
    Match applications against job skills.

    The calculated score is persisted into
    Applications.match_score.
    """

    validate_or_raise(
        "batch_match",
        {
            "job_id": job_id,
            "minimum_match": minimum_match,
            "include_pending": include_pending,
        },
    )

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT skill
            FROM JobSkills
            WHERE job_id = ?
            """,
            (job_id,),
        )

        required_skills = {
            row["skill"]
            for row in cursor.fetchall()
        }

        if not required_skills:
            return (
                f"Error: No skills found "
                f"for job_id {job_id}."
            )

        if include_pending:

            cursor.execute(
                """
                SELECT
                    application_id,
                    candidate_id
                FROM Applications
                WHERE job_id = ?
                """,
                (job_id,),
            )

        else:

            cursor.execute(
                """
                SELECT
                    application_id,
                    candidate_id
                FROM Applications
                WHERE job_id = ?
                AND status = 'PENDING'
                """,
                (job_id,),
            )

        applications = cursor.fetchall()

        total = len(applications)

        if total == 0:
            return (
                f"No matching applications "
                f"found for job {job_id}."
            )

        results = []

        for index, application in enumerate(
            applications
        ):

            cursor.execute(
                """
                SELECT skill
                FROM CandidateSkills
                WHERE candidate_id = ?
                """,
                (
                    application[
                        "candidate_id"
                    ],
                ),
            )

            candidate_skills = {
                row["skill"]
                for row in cursor.fetchall()
            }

            overlap = (
                candidate_skills
                & required_skills
            )

            match_percentage = (
                len(overlap)
                / len(required_skills)
            ) * 100

            # Persist calculated score
            cursor.execute(
                """
                UPDATE Applications
                SET match_score = ?
                WHERE application_id = ?
                """,
                (
                    match_percentage,
                    application[
                        "application_id"
                    ],
                ),
            )

            if (
                match_percentage
                >= minimum_match
            ):

                results.append(
                    f"Application "
                    f"{application['application_id']} "
                    f": "
                    f"{match_percentage:.1f}% match"
                )

            await ctx.report_progress(
                progress=(
                    (index + 1)
                    / total
                ) * 100,
                total=100,
                message=(
                    f"Processed application "
                    f"{index + 1} of {total}"
                ),
            )

            await asyncio.sleep(
                0.1
            )

        conn.commit()

        return (
            f"Batch matching completed "
            f"for Job {job_id}.\n\n"
            + (
                "\n".join(results)
                if results
                else "No applications met "
                     "the requested threshold."
            )
        )

    finally:

        conn.close()


# ============================================================
# Recruiter Note Analysis
# ============================================================

@mcp.tool()
async def analyze_recruiter_note(
    application_id: int,
    analysis_type: str,
    ctx: Context,
) -> str:
    """
    Analyze recruiter notes using client sampling.
    """

    validate_or_raise(
        "recruiter_note",
        {
            "application_id": application_id,
            "analysis_type": analysis_type,
        },
    )

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT recruiter_notes
            FROM Applications
            WHERE application_id = ?
            """,
            (application_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return (
                f"Error: Application "
                f"{application_id} does not exist."
            )

        note = row["recruiter_notes"]

    finally:

        conn.close()

    if not note:
        return (
            f"Application {application_id} "
            f"has no recruiter notes."
        )

    if analysis_type == "sentiment":

        prompt = (
            "Classify the sentiment of this recruiter "
            "note as exactly one word "
            "(POSITIVE, NEGATIVE, or NEUTRAL): "
            f'"{note}"'
        )

    elif analysis_type == "summary":

        prompt = (
            "Summarize the following recruiter note "
            "in one short paragraph:\n\n"
            f"{note}"
        )

    else:

        prompt = (
            "Analyze this recruiter note and identify "
            "any hiring risks. Respond with a short "
            "explanation:\n\n"
            f"{note}"
        )

    response = await ctx.session.create_message(
        messages=[
            SamplingMessage(
                role="user",
                content=TextContent(
                    type="text",
                    text=prompt,
                ),
            )
        ],
        max_tokens=100,
    )

    result = response.content.text.strip()

    return (
        f"Analysis Type: "
        f"{analysis_type.upper()}\n\n"
        f"Recruiter Note:\n"
        f"{note}\n\n"
        f"Result:\n"
        f"{result}"
    )


# ============================================================
# Prompts
# ============================================================

@mcp.prompt()
def draft_interview_invite(
    candidate_name: str,
    job_title: str,
    interview_date: str,
) -> str:

    validate_or_raise(
        "interview_prompt",
        {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": interview_date,
        },
    )

    return f"""
Please draft a professional and welcoming
interview invitation email for:

Candidate: {candidate_name}
Position: {job_title}
Interview date: {interview_date}

Include:

1. Congratulations on passing initial screening.
2. Interview date.
3. Request confirmation of availability.
4. Mention that the meeting link will be shared
   after confirmation.
5. Warm and professional tone.
"""


@mcp.prompt()
def draft_rejection_email(
    candidate_name: str,
    job_title: str,
) -> str:

    validate_or_raise(
        "rejection_prompt",
        {
            "candidate_name": candidate_name,
            "job_title": job_title,
        },
    )

    return (
        f"Draft a professional and respectful "
        f"rejection email to {candidate_name} "
        f"regarding the {job_title} position at "
        f"Talenta Recruitment. Thank them for their "
        f"time, keep the tone warm and encouraging, "
        f"and invite them to apply for future roles."
    )


@mcp.prompt()
def draft_job_offer(
    candidate_name: str,
    job_title: str,
    salary: str,
) -> str:

    validate_or_raise(
        "job_offer",
        {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "salary": salary,
        },
    )

    return f"""
Please draft a formal job offer email for:

Candidate: {candidate_name}
Position: {job_title}
Starting salary: {salary}

Include:

1. Welcome and excitement.
2. Official position and salary.
3. Employment contract and benefits.
4. Request response by the end of the week.
5. Professional and enthusiastic tone.
"""


# ============================================================
# Run Server
# ============================================================

if __name__ == "__main__":

    print(
        "Starting Talenta MCP Server "
        "on stdio transport...",
        file=sys.stderr,
    )

    mcp.run(
        transport="stdio"
    )