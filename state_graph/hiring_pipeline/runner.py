import uuid
from typing import Any

from langgraph.types import Command

from .graph import compile_hiring_pipeline_graph

from common.hitl import (
    get_pending_hitl_task,
    resolve_hitl_task,
)


# ============================================================
# Mock / Test Dependencies
# ============================================================

def load_candidate(candidate_id: int) -> dict[str, Any]:
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


def screening_function(
    state: dict[str, Any],
) -> dict[str, Any]:

    candidate_profile = state.get(
        "candidate_profile",
        {},
    )

    required_skills = {
        "Python",
        "FastAPI",
    }

    candidate_skills = set(
        candidate_profile.get(
            "skills",
            [],
        )
    )

    matched_skills = (
        required_skills
        & candidate_skills
    )

    meets_requirements = (
        len(matched_skills)
        == len(required_skills)
        and candidate_profile.get(
            "experience_years",
            0,
        ) >= 2
    )

    screening_score = (
        len(matched_skills)
        / len(required_skills)
        * 100
        if required_skills
        else 0
    )

    return {
        "meets_requirements": meets_requirements,
        "matched_skills": list(matched_skills),
        "screening_score": round(
            screening_score,
            2,
        ),
    }


def interview_requirement_function(
    state: dict[str, Any],
) -> bool:
    return True


def schedule_function(
    state: dict[str, Any],
) -> dict[str, Any]:

    existing = (
        state.get("interview_data")
        or {}
    )

    interview_number = (
        2
        if state.get(
            "additional_interview_required"
        )
        else 1
    )

    return {
        "interview_id": existing.get(
            "interview_id",
            f"INT-00{interview_number}",
        ),
        "scheduled": True,
        "interview_status": "scheduled",
    }


def interview_data_function(
    state: dict[str, Any],
) -> dict[str, Any]:

    existing = (
        state.get("interview_data")
        or {}
    )

    return {
        "interview_id": existing.get(
            "interview_id",
            "INT-001",
        ),
        "interviewer": "Test Interviewer",
        "technical_score": 85,
        "communication_score": 90,
        "problem_solving_score": 85,
        "notes": (
            "Candidate demonstrated strong "
            "technical and problem-solving skills."
        ),
    }


def interview_analysis_function(
    state: dict[str, Any],
) -> dict[str, Any]:

    interview_data = (
        state.get("interview_data")
        or {}
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

    # Weighted interview score
    interview_score = (
        technical_score * 0.50
        + communication_score * 0.20
        + problem_solving_score * 0.30
    )

    strengths = []
    gaps = []

    if technical_score >= 70:
        strengths.append(
            "Strong technical knowledge"
        )
    else:
        gaps.append(
            "Technical skills need improvement"
        )

    if communication_score >= 70:
        strengths.append(
            "Good communication"
        )
    else:
        gaps.append(
            "Communication needs improvement"
        )

    if problem_solving_score >= 70:
        strengths.append(
            "Good problem-solving skills"
        )
    else:
        gaps.append(
            "Problem-solving skills need improvement"
        )

    return {
        "interview_score": round(
            interview_score,
            2,
        ),
        "strengths": strengths,
        "gaps": gaps,
        "enough_evidence": True,
    }

def llm(
    prompt: str,
) -> dict[str, Any]:

    return {
        "recommendation": "hire",
        "score": 85,
        "strengths": [
            "Strong technical skills",
            "Passed screening",
            "Good interview performance",
        ],
        "gaps": [
            "Needs more system design experience",
        ],
        "reason": (
            "Candidate passed screening and "
            "performed well during the interview."
        ),
    }


def offer_function(
    state: dict[str, Any],
) -> dict[str, Any]:

    return {
        "status": "offer_initiated",
        "offer_id": "OFFER-001",
        "message": (
            "Offer stage started successfully."
        ),
    }


# ============================================================
# Build Graph
# ============================================================

graph = compile_hiring_pipeline_graph(
    screening_function=screening_function,
    interview_requirement_function=(
        interview_requirement_function
    ),
    schedule_function=schedule_function,
    interview_data_function=(
        interview_data_function
    ),
    interview_analysis_function=(
        interview_analysis_function
    ),
    llm=llm,
    offer_function=offer_function,
)


# ============================================================
# Initial State
# ============================================================

initial_state = {
    "candidate_id": 1,
    "job_id": 101,
    "application_id": 1001,

    "candidate_profile": load_candidate(1),

    "job_profile": {
        "job_id": 101,
        "title": "Backend Engineer",
        "required_skills": [
            "Python",
            "FastAPI",
            "SQL",
        ],
        "required_experience_years": 2,
    },

    "screening_result": None,
    "meets_requirements": None,
    "shortlisted": False,

    "needs_interview": None,

    "interview_scheduled": False,
    "interview_status": None,
    "interview_data": None,
    "interview_evaluation": None,

    "enough_evidence": None,
    "additional_interview_required": False,

    "hiring_recommendation": None,

    "recruiter_decision": None,
    "recruiter_feedback": None,

    "offer_status": None,

    "current_stage": "started",
    "status": "ready",
    "next_action": "candidate_submitted",

    "retry_count": 0,
    "failure_ticket_id": None,
}


# ============================================================
# Thread Configuration
# ============================================================

# New thread for every test execution.
#
# If you want durable resume after stopping the process,
# replace this with a fixed thread_id.

thread_id = (
    f"hiring-pipeline-test-{uuid.uuid4().hex[:8]}"
)

config = {
    "configurable": {
        "thread_id": thread_id,
    }
}


# ============================================================
# Run Graph
# ============================================================

if __name__ == "__main__":

    print("\n=== START HIRING PIPELINE ===")
    print(f"Thread ID: {thread_id}")

    result = graph.invoke(
        initial_state,
        config=config,
    )

    while True:

        print("\n=== CURRENT STAGE ===")
        print(
            result.get("current_stage")
        )

        print("\n=== STATUS ===")
        print(
            result.get("status")
        )

        print("\n=== NEXT ACTION ===")
        print(
            result.get("next_action")
        )

        interrupts = result.get(
            "__interrupt__"
        )

        if not interrupts:
            break

        interrupt_value = (
            interrupts[0].value
        )

        print("\n=== INTERRUPT ===")
        print(interrupt_value)

        interrupt_type = (
            interrupt_value.get("type")
        )

        # ====================================================
        # External Interview Result
        # ====================================================

        if (
            interrupt_type
            == "interview_result_wait"
        ):

            print(
                "\nInterview is waiting "
                "for an external result."
            )

            interviewer = input(
                "Enter interviewer name: "
            ).strip()

            technical_score = int(
                input(
                    "Enter technical score: "
                ).strip()
            )

            communication_score = int(
                input(
                    "Enter communication score: "
                ).strip()
            )

            problem_solving_score = int(
                input(
                    "Enter problem-solving score: "
                ).strip()
            )

            notes = input(
                "Enter interview notes: "
            ).strip()

            interview_id = (
                interrupt_value.get(
                    "interview_id"
                )
                or "INT-001"
            )

            interview_data = {
                "interview_id": interview_id,
                "interviewer": interviewer,
                "technical_score": technical_score,
                "communication_score": (
                    communication_score
                ),
                "problem_solving_score": (
                    problem_solving_score
                ),
                "notes": notes,
            }

            print(
                "\n=== RECEIVING EXTERNAL "
                "INTERVIEW RESULT ==="
            )

            result = graph.invoke(
                Command(
                    resume={
                        "type": (
                            "interview_result"
                        ),
                        "interview_data": (
                            interview_data
                        ),
                    }
                ),
                config=config,
            )

        # ====================================================
        # Recruiter HITL
        # ====================================================

        elif (
            interrupt_type
            == "candidate_hiring_review"
        ):

            decision = input(
                "\nEnter recruiter decision "
                "(approve / reject): "
            ).strip().lower()

            while decision not in {
                "approve",
                "reject",
            }:

                print(
                    "Invalid decision."
                )

                decision = input(
                    "Enter recruiter decision "
                    "(approve / reject): "
                ).strip().lower()

            feedback = input(
                "Enter recruiter feedback: "
            ).strip()

            pending_task = (
                get_pending_hitl_task(
                    thread_id=thread_id,
                    node_name=(
                        "hiring_pipeline_"
                        "recruiter_review"
                    ),
                )
            )

            if pending_task is not None:

                resolve_hitl_task(
                    pending_task[
                        "hitl_task_id"
                    ],
                    admin_id="console-admin",
                    decision=decision,
                    feedback=feedback,
                )

            print(
                "\n=== RESUMING GRAPH ==="
            )

            result = graph.invoke(
                Command(
                    resume={
                        "decision": decision,
                        "feedback": feedback,
                    }
                ),
                config=config,
            )

        else:

            raise RuntimeError(
                "Unknown interrupt type: "
                f"{interrupt_type}"
            )

    # ========================================================
    # Final Result
    # ========================================================

    print("\n=== FINAL RESULT ===")
    print(result)

    print("\n=== CURRENT STAGE ===")
    print(
        result.get("current_stage")
    )

    print("\n=== STATUS ===")
    print(
        result.get("status")
    )

    print("\n=== NEXT ACTION ===")
    print(
        result.get("next_action")
    )