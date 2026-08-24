from __future__ import annotations

from typing import Any, Callable

from langgraph.config import get_config
from langgraph.types import interrupt

from common.hitl import (
    create_hitl_task,
    get_pending_hitl_task,
    resolve_hitl_task,
)

from .state import CandidateMatchingState


# ============================================================
# Node 1: Load Candidate Context
# ============================================================

def load_candidate_context(
    state: CandidateMatchingState,
    load_candidate: Callable[
        [int],
        dict[str, Any],
    ],
) -> CandidateMatchingState:

    candidate_id = state["candidate_id"]

    candidate_profile = load_candidate(
        candidate_id
    )

    if not candidate_profile:
        raise ValueError(
            f"Candidate {candidate_id} was not found."
        )

    return {
        **state,
        "candidate_profile": candidate_profile,
        "current_stage": "candidate_loaded",
        "status": "ready",
        "next_action": "check_profile",
    }


# ============================================================
# Node 2: Check Candidate Profile
# ============================================================

def check_candidate_profile(
    state: CandidateMatchingState,
) -> CandidateMatchingState:

    candidate_profile = state.get(
        "candidate_profile",
        {},
    )

    missing_fields: list[str] = []

    if not candidate_profile.get("skills"):
        missing_fields.append("skills")

    if candidate_profile.get("experience_years") is None:
        missing_fields.append("experience_years")

    if missing_fields:
        return {
            **state,
            "current_stage": "profile_incomplete",
            "status": "waiting",
            "next_action": "request_missing_information",
        }

    return {
        **state,
        "current_stage": "profile_complete",
        "status": "ready",
        "next_action": "decompose_matching_task",
    }


# ============================================================
# Node 3: Task Decomposition
# ============================================================

def decompose_matching_task(
    state: CandidateMatchingState,
) -> CandidateMatchingState:

    matching_tasks = [
        "Compare candidate technical skills with job requirements",
        "Compare candidate experience with required experience",
        "Compare candidate education with job requirements",
        "Identify missing or weak requirements",
        "Evaluate overall candidate-job fit",
    ]

    return {
        **state,
        "matching_tasks": matching_tasks,
        "current_stage": "task_decomposition",
        "status": "ready",
        "next_action": "retrieve_hiring_policy",
    }


# ============================================================
# Node 4: Retrieve Hiring Policy
# ============================================================

def retrieve_hiring_policy(
    state: CandidateMatchingState,
    retrieve_policy: Callable[
        [CandidateMatchingState],
        list[str],
    ],
) -> CandidateMatchingState:

    retrieved_context = retrieve_policy(
        state
    )

    return {
        **state,
        "retrieved_context": retrieved_context,
        "current_stage": "policy_retrieved",
        "status": "ready",
        "next_action": "find_matching_jobs",
    }


# ============================================================
# Node 5: Find Matching Jobs
# ============================================================

def find_matching_jobs(
    state: CandidateMatchingState,
    find_jobs_for_candidate: Callable[
        [CandidateMatchingState],
        list[dict[str, Any]],
    ],
) -> CandidateMatchingState:

    jobs = find_jobs_for_candidate(
        state
    )

    if not jobs:
        return {
            **state,
            "available_jobs": [],
            "match_results": [],
            "ranked_matches": [],
            "current_stage": "no_matching_jobs",
            "status": "completed",
            "next_action": "end",
        }

    return {
        **state,
        "available_jobs": jobs,
        "current_stage": "jobs_loaded",
        "status": "ready",
        "next_action": "match_candidate_to_jobs",
    }


# ============================================================
# Node 6: Match Candidate to Jobs
# ============================================================

def match_candidate_to_jobs(
    state: CandidateMatchingState,
    match_candidate_job: Callable[
        [
            dict[str, Any],
            dict[str, Any],
            dict[str, Any],
        ],
        dict[str, Any],
    ],
) -> CandidateMatchingState:

    candidate_profile = state.get(
        "candidate_profile",
        {},
    )

    jobs = state.get(
        "available_jobs",
        [],
    )

    criteria = state.get(
        "matching_criteria",
        {
            "minimum_match": 75.0,
        },
    )

    results: list[dict[str, Any]] = []

    for job in jobs:

        result = match_candidate_job(
            candidate_profile,
            job,
            criteria,
        )

        results.append(result)

    return {
        **state,
        "match_results": results,
        "matching_criteria": criteria,
        "current_stage": "matching_completed",
        "status": "ready",
        "next_action": "rank_matches",
    }


# ============================================================
# Node 7: Rank Matches
# ============================================================

def rank_matches(
    state: CandidateMatchingState,
) -> CandidateMatchingState:

    results = state.get(
        "match_results",
        [],
    )

    ranked_matches = sorted(
        results,
        key=lambda item: (
            item.get("match_percentage")
            if item.get("match_percentage") is not None
            else item.get("score", 0)
        ),
        reverse=True,
    )

    return {
        **state,
        "ranked_matches": ranked_matches,
        "current_stage": "matches_ranked",
        "status": "ready",
        "next_action": "generate_match_recommendation",
    }


# ============================================================
# Node 8: Generate Match Recommendation
# ============================================================

def generate_match_recommendation(
    state: CandidateMatchingState,
    llm: Callable[
        [str],
        dict[str, Any],
    ],
) -> CandidateMatchingState:

    candidate_profile = state.get(
        "candidate_profile",
        {},
    )

    matching_tasks = state.get(
        "matching_tasks",
        [],
    )

    retrieved_context = state.get(
        "retrieved_context",
        [],
    )

    ranked_matches = state.get(
        "ranked_matches",
        [],
    )

    prompt = f"""
You are a recruitment matching assistant.

Candidate Profile:
{candidate_profile}

Matching Tasks:
{matching_tasks}

Hiring Policy:
{retrieved_context}

Ranked Job Matches:
{ranked_matches}

Evaluate the candidate-to-job matches.

Return a structured recommendation containing:

- recommendation
- score
- strengths
- gaps
- reason

IMPORTANT:
Do not make a final hiring decision.

The recruiter must make the final decision.
"""

    recommendation = llm(prompt)

    return {
        **state,
        "match_recommendation": recommendation,
        "current_stage": "recommendation_generated",
        "status": "ready",
        "next_action": "recruiter_review",
    }


# ============================================================
# Node 9: Recruiter Review - HITL
# ============================================================

def recruiter_review(
    state: CandidateMatchingState,
) -> CandidateMatchingState:
    """
    Human-in-the-loop recruiter review.

    Lifecycle:

        1. Check whether an unresolved HITL task already exists.
        2. If not, create one.
        3. Pause using LangGraph interrupt().
        4. On resume, receive recruiter decision.
        5. Resolve the persisted HITL task.
        6. Store decision in graph state.

    IMPORTANT:
    interrupt() can replay this node after resume.
    Therefore task creation must be idempotent.
    """

    recommendation = state.get(
        "match_recommendation",
        {},
    )

    # --------------------------------------------------------
    # Get thread id from LangGraph configuration
    # --------------------------------------------------------

    config = get_config()

    configurable = config.get(
        "configurable",
        {},
    )

    thread_id = configurable.get(
        "thread_id"
    )

    if not thread_id:
        raise RuntimeError(
            "Missing LangGraph configurable.thread_id "
            "for recruiter_review."
        )

    # --------------------------------------------------------
    # Find existing pending HITL task
    # --------------------------------------------------------

    pending_task = get_pending_hitl_task(
        thread_id=thread_id,
        node_name="recruiter_review",
    )

    # --------------------------------------------------------
    # Create HITL task only if one does not exist
    # --------------------------------------------------------

    if pending_task is None:

        hitl_task_id = create_hitl_task(
            thread_id=thread_id,
            graph_name="candidate_matching",
            node_name="recruiter_review",
            task_type="candidate_match_review",
            reason=(
                "The AI-generated match recommendation must be "
                "reviewed by a recruiter before a final decision "
                "is made."
            ),
            state=dict(state),
            requested_action=(
                "approve | reject | request_re_match"
            ),
            allowed_actions=[
                "approve",
                "reject",
                "request_re_match",
            ],
        )

    else:

        hitl_task_id = int(
            pending_task["hitl_task_id"]
        )

    # --------------------------------------------------------
    # Persist task id into graph state BEFORE interrupt
    # --------------------------------------------------------

    state_with_hitl = {
        **state,
        "hitl_task_id": hitl_task_id,
        "current_stage": "recruiter_review",
        "status": "waiting",
        "next_action": "await_recruiter_decision",
    }

    # --------------------------------------------------------
    # Human decision
    # --------------------------------------------------------

    decision = interrupt(
        {
            "type": "candidate_match_review",

            "hitl_task_id": hitl_task_id,

            "candidate_id": state[
                "candidate_id"
            ],

            "recommendation": recommendation,

            "ranked_matches": state.get(
                "ranked_matches",
                [],
            ),

            "message": (
                "Recruiter review required "
                "before continuing."
            ),

            "allowed_decisions": [
                "approve",
                "reject",
                "request_re_match",
            ],
        }
    )

    # --------------------------------------------------------
    # Validate decision payload
    # --------------------------------------------------------

    if not isinstance(
        decision,
        dict,
    ):
        raise ValueError(
            "Recruiter decision must be a dictionary."
        )

    recruiter_decision = decision.get(
        "decision"
    )

    if recruiter_decision not in {
        "approve",
        "reject",
        "request_re_match",
    }:
        raise ValueError(
            "Invalid recruiter decision: "
            f"{recruiter_decision}"
        )

    recruiter_feedback = decision.get(
        "feedback",
        "",
    )

    if recruiter_feedback is None:
        recruiter_feedback = ""

    recruiter_feedback = str(
        recruiter_feedback
    )

    # --------------------------------------------------------
    # Resolve the persisted HITL task
    # --------------------------------------------------------

    resolve_hitl_task(
        hitl_task_id,
        admin_id=str(
            decision.get(
                "admin_id",
                "recruiter",
            )
        ),
        decision=recruiter_decision,
        feedback=recruiter_feedback,
    )

    # --------------------------------------------------------
    # Return resolved decision into graph state
    # --------------------------------------------------------

    return {
        **state_with_hitl,

        "recruiter_decision":
            recruiter_decision,

        "recruiter_feedback":
            recruiter_feedback,

        "current_stage":
            "recruiter_review_completed",

        "status":
            "ready",

        "next_action":
            "process_recruiter_decision",
    }


# ============================================================
# Node 10: Process Recruiter Decision
# ============================================================

def process_recruiter_decision(
    state: CandidateMatchingState,
) -> CandidateMatchingState:

    decision = state.get(
        "recruiter_decision"
    )

    if decision == "approve":

        return {
            **state,

            "current_stage":
                "approved",

            "status":
                "completed",

            "next_action":
                "end",
        }

    if decision == "reject":

        return {
            **state,

            "current_stage":
                "rejected",

            "status":
                "completed",

            "next_action":
                "end",
        }

    if decision == "request_re_match":

        return {
            **state,

            "current_stage":
                "re_match_requested",

            "status":
                "ready",

            "next_action":
                "adjust_matching_criteria",
        }

    raise ValueError(
        "Unknown recruiter decision: "
        f"{decision}"
    )


# ============================================================
# Node 11: Adjust Matching Criteria
# ============================================================

def adjust_matching_criteria(
    state: CandidateMatchingState,
) -> CandidateMatchingState:

    criteria = state.get(
        "matching_criteria",
        {
            "minimum_match": 75.0,
        },
    ).copy()

    feedback = state.get(
        "recruiter_feedback",
        "",
    )

    if feedback:
        criteria[
            "recruiter_feedback"
        ] = feedback

    return {
        **state,

        "matching_criteria":
            criteria,

        # Clear stale recommendation.
        "match_recommendation":
            None,

        # Clear old decision.
        "recruiter_decision":
            None,

        # Clear old HITL task reference.
        #
        # The database task is already resolved.
        # A new task will be created when the graph
        # reaches recruiter_review again.
        "hitl_task_id":
            None,

        "current_stage":
            "criteria_adjusted",

        "status":
            "ready",

        "next_action":
            "match_candidate_to_jobs",
    }