from __future__ import annotations

from typing import Any

from langgraph.types import Command

from .graph import compile_candidate_matching_graph

from common.retry_recovery import (
    invoke_with_recovery,
)

from common.checkpoint import (
    get_checkpointer,
)

from common.hitl import (
    get_pending_hitl_task,
    resolve_hitl_task,
)


# ============================================================
# Mock / Test Dependencies
# ============================================================
#
# IMPORTANT:
#
# These are still temporary implementations.
#
# Later they should be replaced with:
#
# - Talenta MCP tools
# - SQLite/database access
# - RAG
# - Real LLM
#
# ============================================================


def load_candidate(
    candidate_id: int,
) -> dict[str, Any]:
    """
    Temporary test implementation.

    Replace this with the real MCP/database function later.
    """

    return {
        "id": candidate_id,
        "name": "Test Candidate",
        "skills": [
            "Python",
            "FastAPI",
            "SQL",
        ],
        "experience_years": 3,
        "education": "Computer Science",
    }


def retrieve_policy(
    state: dict[str, Any],
) -> list[str]:
    """
    Temporary RAG implementation.

    Replace this with the real Talenta RAG/MCP function later.
    """

    return [
        "Candidates should match the required technical skills.",
        "Relevant experience should be considered.",
        "Recruiter approval is required before final selection.",
    ]


def find_jobs_for_candidate(
    state: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Temporary job retrieval implementation.

    Replace this with the real MCP/database function later.
    """

    return [
        {
            "job_id": 101,
            "title": "Backend Engineer",
            "required_skills": [
                "Python",
                "FastAPI",
                "SQL",
            ],
            "required_experience_years": 2,
        },
        {
            "job_id": 102,
            "title": "Data Engineer",
            "required_skills": [
                "Python",
                "SQL",
                "Spark",
            ],
            "required_experience_years": 3,
        },
    ]


def match_candidate_job(
    candidate_profile: dict[str, Any],
    job: dict[str, Any],
    criteria: dict[str, Any],
) -> dict[str, Any]:
    """
    Temporary deterministic matching implementation.

    Replace this with the real MCP matching function later.
    """

    candidate_skills = set(
        candidate_profile.get(
            "skills",
            [],
        )
    )

    required_skills = set(
        job.get(
            "required_skills",
            [],
        )
    )

    # --------------------------------------------------------
    # Skill Score
    # --------------------------------------------------------

    if not required_skills:

        skill_score = 0.0

    else:

        skill_score = (
            len(
                candidate_skills
                & required_skills
            )
            / len(required_skills)
        )

    # --------------------------------------------------------
    # Experience Score
    # --------------------------------------------------------

    candidate_experience = candidate_profile.get(
        "experience_years",
        0,
    )

    required_experience = job.get(
        "required_experience_years",
        0,
    )

    if candidate_experience >= required_experience:

        experience_score = 1.0

    else:

        experience_score = (
            candidate_experience
            / max(
                required_experience,
                1,
            )
        )

    # --------------------------------------------------------
    # Final Score
    # --------------------------------------------------------

    score = (
        (skill_score * 0.7)
        + (experience_score * 0.3)
    )

    return {
        "job_id": job["job_id"],
        "job_title": job["title"],
        "match_percentage": round(
            score * 100,
            2,
        ),
        "skill_score": round(
            skill_score * 100,
            2,
        ),
        "experience_score": round(
            experience_score * 100,
            2,
        ),
    }


def llm(
    prompt: str,
) -> dict[str, Any]:
    """
    Temporary LLM implementation.

    Replace this with the actual LLM used by the project.
    """

    return {
        "recommendation": "pending_review",
        "score": 85,
        "strengths": [
            "Strong Python experience",
            "Good FastAPI match",
            "Relevant SQL experience",
        ],
        "gaps": [
            "No explicit Spark experience",
        ],
        "reason": (
            "The candidate appears to be a strong match "
            "for the available backend role."
        ),
    }


# ============================================================
# Shared Durable Checkpointer
# ============================================================
#
# IMPORTANT:
#
# All graph executions use the same durable checkpoint system.
#
# The checkpoint is stored in:
#
#     db/talenta.db
#
# This allows the graph to survive:
#
# - process restart
# - application restart
# - HITL pause
# - unexpected failure
# - recovery
#
# ============================================================

checkpointer = get_checkpointer()


# ============================================================
# Build Graph
# ============================================================

graph = compile_candidate_matching_graph(
    load_candidate=load_candidate,
    retrieve_policy=retrieve_policy,
    find_jobs_for_candidate=find_jobs_for_candidate,
    match_candidate_job=match_candidate_job,
    llm=llm,
    checkpointer=checkpointer,
)


# ============================================================
# Initial State
# ============================================================

initial_state = {

    "candidate_id": 1,

    "job_id": None,

    "application_id": None,

    "matching_criteria": {
        "minimum_match": 0.75,
    },

    "retry_count": 0,

    "current_stage": "started",

    "status": "ready",

    "next_action": "load_candidate",
}


# ============================================================
# Thread Configuration
# ============================================================
#
# thread_id is the permanent identity of this graph run.
#
# IMPORTANT:
#
# Do NOT generate a new thread_id when you want to resume
# the same execution.
#
# The same thread_id allows LangGraph to find the previous
# checkpoint.
#
# ============================================================

config = {
    "configurable": {
        "thread_id": "candidate-matching-test-2",
    }
}


# ============================================================
# Helper: Print Graph State
# ============================================================

def print_graph_state(
    result: Any,
) -> None:
    """
    Print the current graph state in a readable way.
    """

    if not isinstance(
        result,
        dict,
    ):
        print(
            "\nResult:"
        )

        print(
            result
        )

        return

    print(
        "\n=== CURRENT STAGE ==="
    )

    print(
        result.get(
            "current_stage"
        )
    )

    print(
        "\n=== STATUS ==="
    )

    print(
        result.get(
            "status"
        )
    )

    print(
        "\n=== NEXT ACTION ==="
    )

    print(
        result.get(
            "next_action"
        )
    )


# ============================================================
# Resume After HITL
# ============================================================

def resume_after_recruiter_review(
    decision: str,
    feedback: str,
    admin_id: str = "console-admin",
) -> Any:
    """
    Resume the interrupted graph using the SAME thread_id.

    This is important because LangGraph uses the thread_id
    to locate the durable checkpoint created before the
    interrupt.

    NOTE: this function is the CLI test harness used to exercise
    the graph locally (it reads the decision from input() further
    down this file). The real product does not resume through a
    console: the platform's admin-approval endpoint calls
    resolve_hitl_task(...) and then graph.invoke(Command(resume=...))
    exactly the way this function does, using the real authenticated
    admin's id instead of "console-admin".
    """

    pending_task = get_pending_hitl_task(
        thread_id=config["configurable"]["thread_id"],
        node_name="recruiter_review",
    )

    if pending_task is not None:

        resolve_hitl_task(
            pending_task["hitl_task_id"],
            admin_id=admin_id,
            decision=decision,
            feedback=feedback,
        )

    return graph.invoke(
        Command(
            resume={
                "decision": decision,
                "feedback": feedback,
            }
        ),
        config=config,
    )


# ============================================================
# Run Graph
# ============================================================

if __name__ == "__main__":

    print(
        "\n=================================================="
    )

    print(
        " TALENTA CANDIDATE MATCHING GRAPH"
    )

    print(
        "=================================================="
    )

    print(
        f"\nThread ID: "
        f"{config['configurable']['thread_id']}"
    )

    try:

        # ====================================================
        # FIRST INVOCATION
        # ====================================================

        print(
            "\n=== STARTING GRAPH ==="
        )

        result = invoke_with_recovery(
            graph,
            graph_name="candidate_matching",
            thread_id=config["configurable"]["thread_id"],
            input_state=initial_state,
        )

        print_graph_state(
            result
        )

        # ====================================================
        # HUMAN-IN-THE-LOOP
        # ====================================================

        while (
            isinstance(
                result,
                dict,
            )
            and "__interrupt__" in result
        ):

            print(
                "\n=================================================="
            )

            print(
                " HUMAN-IN-THE-LOOP REVIEW"
            )

            print(
                "=================================================="
            )

            print(
                "\nInterrupt:"
            )

            print(
                result["__interrupt__"]
            )

            # ------------------------------------------------
            # Recruiter Decision
            # ------------------------------------------------

            decision = input(
                "\nEnter recruiter decision "
                "(approve / reject / request_re_match): "
            ).strip()

            # ------------------------------------------------
            # Validate Decision
            # ------------------------------------------------

            while decision not in {
                "approve",
                "reject",
                "request_re_match",
            }:

                print(
                    "\nInvalid decision."
                )

                print(
                    "Allowed decisions:"
                )

                print(
                    "  approve"
                )

                print(
                    "  reject"
                )

                print(
                    "  request_re_match"
                )

                decision = input(
                    "\nEnter recruiter decision: "
                ).strip()

            # ------------------------------------------------
            # Recruiter Feedback
            # ------------------------------------------------

            feedback = input(
                "Enter recruiter feedback: "
            ).strip()

            # =================================================
            # Resume Graph
            # =================================================

            print(
                "\n=== RESUMING GRAPH ==="
            )

            #
            # IMPORTANT:
            #
            # We use the SAME thread_id.
            #
            # We do NOT create a new graph.
            #
            # We do NOT create a new checkpoint.
            #
            # LangGraph resumes from the existing checkpoint.
            #

            result = resume_after_recruiter_review(
                decision=decision,
                feedback=feedback,
            )

            print_graph_state(
                result
            )

        # ====================================================
        # FINAL RESULT
        # ====================================================

        print(
            "\n=================================================="
        )

        print(
            " FINAL RESULT"
        )

        print(
            "=================================================="
        )

        print(
            result
        )

        if isinstance(
            result,
            dict,
        ):

            print(
                "\n=== FINAL STAGE ==="
            )

            print(
                result.get(
                    "current_stage"
                )
            )

            print(
                "\n=== FINAL STATUS ==="
            )

            print(
                result.get(
                    "status"
                )
            )

    except Exception as error:

        # ====================================================
        # GRAPH FAILURE
        # ====================================================
        #
        # invoke_with_recovery() already:
        #
        # 1. preserves the LangGraph checkpoint
        # 2. reads the latest durable state
        # 3. creates a failure ticket
        # 4. updates graph_runs
        # 5. re-raises the original exception
        #
        # We should NOT delete the database.
        # We should NOT create a new thread.
        #
        # ====================================================

        print(
            "\n=================================================="
        )

        print(
            " GRAPH EXECUTION FAILED"
        )

        print(
            "=================================================="
        )

        print(
            f"\nError: {error}"
        )

        print(
            "\nThe durable checkpoint was preserved."
        )

        print(
            "The failure recovery layer should have "
            "created a failure ticket."
        )

        print(
            "\nThread ID:"
        )

        print(
            config["configurable"]["thread_id"]
        )

        raise