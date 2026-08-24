from typing import Any, Callable

from langgraph.config import get_config
from langgraph.types import interrupt

from common.hitl import create_hitl_task, get_pending_hitl_task

from .state import HiringPipelineState


# ============================================================
# Node 1: Candidate Submitted
# ============================================================

def hiring_pipeline_candidate_submitted(
    state: HiringPipelineState,
) -> HiringPipelineState:
    return {
        **state,
        "current_stage": "candidate_submitted",
        "status": "ready",
        "next_action": "screen_candidate",
    }


# ============================================================
# Node 2: Screen Candidate
# ============================================================

def hiring_pipeline_screen_candidate(
    state: HiringPipelineState,
    screening_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:
    screening_result = screening_function(state)
    meets_requirements = screening_result.get("meets_requirements", False)

    return {
        **state,
        "screening_result": screening_result,
        "meets_requirements": meets_requirements,
        "current_stage": "screening_completed",
        "status": "ready",
        "next_action": (
            "shortlist_candidate"
            if meets_requirements
            else "reject_candidate"
        ),
    }


# ============================================================
# Node 3: Reject Candidate
# ============================================================

def hiring_pipeline_reject_candidate(
    state: HiringPipelineState,
) -> HiringPipelineState:
    return {
        **state,
        "current_stage": "rejected_after_screening",
        "status": "completed",
        "next_action": "end",
    }


# ============================================================
# Node 4: Shortlist Candidate
# ============================================================

def hiring_pipeline_shortlist_candidate(
    state: HiringPipelineState,
) -> HiringPipelineState:
    return {
        **state,
        "shortlisted": True,
        "current_stage": "candidate_shortlisted",
        "status": "ready",
        "next_action": "check_interview_requirement",
    }


# ============================================================
# Node 5: Check Interview Requirement
# ============================================================

def hiring_pipeline_check_interview_requirement(
    state: HiringPipelineState,
    interview_requirement_function: Callable[
        [HiringPipelineState],
        bool,
    ],
) -> HiringPipelineState:
    needs_interview = interview_requirement_function(state)

    return {
        **state,
        "needs_interview": needs_interview,
        "current_stage": "interview_requirement_checked",
        "status": "ready",
        "next_action": (
            "schedule_interview"
            if needs_interview
            else "recruiter_review"
        ),
    }


# ============================================================
# Node 6: Schedule Interview
# ============================================================

def hiring_pipeline_schedule_interview(
    state: HiringPipelineState,
    schedule_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:
    interview_data = schedule_function(state)

    return {
        **state,
        "interview_scheduled": True,
        "interview_status": "scheduled",
        "interview_data": interview_data,
        "current_stage": "interview_scheduled",
        "status": "waiting",
        "next_action": "wait_for_interview_result",
    }


# ============================================================
# Node 7: Wait for / Receive Interview Result
# ============================================================

def hiring_pipeline_interview_completed(
    state: HiringPipelineState,
    interview_data_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:
    """
    This node does NOT automatically invent a completed interview.

    The graph pauses here until the external interview system/platform
    provides the result through the same LangGraph thread.

    Expected resume payload:
    {
        "type": "interview_result",
        "interview_data": {...}
    }
    """

    existing_data = state.get("interview_data") or {}

    # If a real result was already injected by the platform/external
    # integration, use it and continue.
    if existing_data.get("result_received") is True:
        interview_data = existing_data
    else:
        response = interrupt(
            {
                "type": "interview_result_wait",
                "candidate_id": state["candidate_id"],
                "application_id": state.get("application_id"),
                "interview_id": existing_data.get("interview_id"),
                "message": (
                    "Interview is scheduled. Waiting for the external "
                    "interview system to submit the completed result."
                ),
                "expected_payload": {
                    "type": "interview_result",
                    "interview_data": "completed interview data",
                },
            }
        )

        if not isinstance(response, dict):
            raise ValueError(
                "Interview result must be provided as a dictionary."
            )

        if response.get("type") != "interview_result":
            raise ValueError(
                "Invalid resume payload. Expected type='interview_result'."
            )

        interview_data = response.get("interview_data")

        if not isinstance(interview_data, dict):
            raise ValueError(
                "interview_data must be a dictionary."
            )

        interview_data = {
            **interview_data,
            "result_received": True,
        }

    return {
        **state,
        "interview_data": interview_data,
        "interview_status": "completed",
        "current_stage": "interview_completed",
        "status": "ready",
        "next_action": "analyze_interview",
    }


# ============================================================
# Node 8: Analyze Interview
# ============================================================

def hiring_pipeline_analyze_interview(
    state: HiringPipelineState,
    interview_analysis_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:

    interview_data = state.get(
        "interview_data",
        {},
    )

    technical_score = float(
        interview_data.get(
            "technical_score",
            0,
        )
    )

    communication_score = float(
        interview_data.get(
            "communication_score",
            0,
        )
    )

    problem_solving_score = float(
        interview_data.get(
            "problem_solving_score",
            0,
        )
    )

    # --------------------------------------------------------
    # Validate scores
    # --------------------------------------------------------

    scores = {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "problem_solving_score": problem_solving_score,
    }

    for name, score in scores.items():

        if not 0 <= score <= 100:
            raise ValueError(
                f"{name} must be between 0 and 100. "
                f"Received: {score}"
            )

    # --------------------------------------------------------
    # Calculate deterministic interview score
    # --------------------------------------------------------

    interview_score = round(
        (
            technical_score * 0.50
            + communication_score * 0.20
            + problem_solving_score * 0.30
        ),
        2,
    )

    # --------------------------------------------------------
    # Run additional analysis
    # --------------------------------------------------------

    evaluation = interview_analysis_function(
        state
    )

    if not isinstance(
        evaluation,
        dict,
    ):
        raise ValueError(
            "interview_analysis_function must return a dictionary."
        )

    # --------------------------------------------------------
    # Override score with actual interview score
    # --------------------------------------------------------

    evaluation = {
        **evaluation,
        "interview_score": interview_score,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "problem_solving_score": problem_solving_score,
    }

    # --------------------------------------------------------
    # Evidence threshold
    # --------------------------------------------------------

    enough_evidence = evaluation.get(
        "enough_evidence",
        interview_score >= 60,
    )

    return {
        **state,
        "interview_evaluation": evaluation,
        "enough_evidence": enough_evidence,
        "current_stage": "interview_analyzed",
        "status": "ready",
        "next_action": (
            "hiring_recommendation"
            if enough_evidence
            else "additional_interview"
        ),
    }


# ============================================================
# Node 9: Additional Interview
# ============================================================

def hiring_pipeline_additional_interview(
    state: HiringPipelineState,
    schedule_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:

    interview_data = schedule_function(state)

    return {
        **state,
        "additional_interview_required": True,
        "interview_scheduled": True,
        "interview_status": "scheduled",
        "interview_data": interview_data,
        "current_stage": "additional_interview_scheduled",
        "status": "waiting",
        "next_action": "wait_for_interview_result",
    }

# ============================================================
# Node 10: Hiring Recommendation
# ============================================================

def hiring_pipeline_hiring_recommendation(
    state: HiringPipelineState,
    llm: Callable[
        [str],
        dict[str, Any],
    ],
) -> HiringPipelineState:

    candidate_profile = state.get(
        "candidate_profile",
        {},
    )

    job_profile = state.get(
        "job_profile",
        {},
    )

    screening_result = state.get(
        "screening_result",
        {},
    )

    interview_evaluation = state.get(
        "interview_evaluation",
        {},
    )

    interview_score = float(
        interview_evaluation.get(
            "interview_score",
            0,
        )
    )

    prompt = f"""
You are a hiring recommendation assistant.

Candidate Profile:
{candidate_profile}

Job Profile:
{job_profile}

Screening Result:
{screening_result}

Interview Evaluation:
{interview_evaluation}

Interview Score:
{interview_score}

Generate a structured hiring recommendation.

Return:
- recommendation
- strengths
- gaps
- reason

The interview score is already calculated by the system.
Do NOT invent or modify the interview score.

Do not make the final hiring decision.
The recruiter must make the final decision.
"""

    recommendation = llm(prompt)

    if not isinstance(
        recommendation,
        dict,
    ):
        raise ValueError(
            "LLM hiring recommendation must be a dictionary."
        )

    recommendation = {
        **recommendation,
        "score": interview_score,
    }

    return {
        **state,
        "hiring_recommendation": recommendation,
        "current_stage": "hiring_recommendation_generated",
        "status": "ready",
        "next_action": "recruiter_review",
    }

# ============================================================
# Node 11: Recruiter Review - HITL
# ============================================================

def hiring_pipeline_recruiter_review(
    state: HiringPipelineState,
) -> HiringPipelineState:
    recommendation = state.get("hiring_recommendation", {})

    thread_id = get_config()["configurable"]["thread_id"]

    # Persist a real HITL task before pausing. interrupt() replays
    # this node from the top on every resume, so only create the
    # task the first time we reach it for this run.
    if get_pending_hitl_task(
        thread_id=thread_id,
        node_name="hiring_pipeline_recruiter_review",
    ) is None:

        create_hitl_task(
            thread_id=thread_id,
            graph_name="hiring_pipeline",
            node_name="hiring_pipeline_recruiter_review",
            task_type="candidate_hiring_review",
            reason=(
                "A final hire/reject decision is an irreversible "
                "action on a real candidate and must be made by a "
                "recruiter, not decided by the agent alone."
            ),
            state=dict(state),
            requested_action="approve | reject",
            allowed_actions=["approve", "reject"],
        )

    decision = interrupt(
        {
            "type": "candidate_hiring_review",
            "candidate_id": state["candidate_id"],
            "recommendation": recommendation,
            "message": "Final recruiter decision required.",
            "allowed_decisions": [
                "approve",
                "reject",
            ],
        }
    )

    if not isinstance(decision, dict):
        raise ValueError(
            "Recruiter decision must be a dictionary."
        )

    recruiter_decision = decision.get("decision")

    if recruiter_decision not in {
        "approve",
        "reject",
    }:
        raise ValueError(
            f"Invalid recruiter decision: {recruiter_decision}"
        )

    return {
        **state,
        "recruiter_decision": recruiter_decision,
        "recruiter_feedback": decision.get("feedback"),
        "current_stage": "recruiter_review_completed",
        "status": "ready",
        "next_action": "process_hiring_decision",
    }


# ============================================================
# Node 12: Process Hiring Decision
# ============================================================

def hiring_pipeline_process_hiring_decision(
    state: HiringPipelineState,
) -> HiringPipelineState:
    decision = state.get("recruiter_decision")

    if decision == "approve":
        return {
            **state,
            "current_stage": "candidate_approved",
            "status": "ready",
            "next_action": "offer_stage",
        }

    if decision == "reject":
        return {
            **state,
            "current_stage": "candidate_rejected",
            "status": "completed",
            "next_action": "end",
        }

    raise ValueError(
        f"Unknown recruiter decision: {decision}"
    )


# ============================================================
# Node 13: Offer Stage
# ============================================================

def hiring_pipeline_offer_stage(
    state: HiringPipelineState,
    offer_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
) -> HiringPipelineState:
    offer_result = offer_function(state)

    return {
        **state,
        "offer_status": offer_result.get(
            "status",
            "initiated",
        ),
        "current_stage": "offer_stage",
        "status": "completed",
        "next_action": "end",
    }
