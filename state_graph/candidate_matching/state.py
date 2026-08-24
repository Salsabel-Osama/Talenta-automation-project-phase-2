from typing import Any, Optional, TypedDict
failure_record: Optional[dict[str, Any]]
failure_node: Optional[str]
failure_error: Optional[str]

class CandidateMatchingState(TypedDict, total=False):

    # ============================================================
    # IDs
    # ============================================================

    candidate_id: int
    selected_job_id: Optional[int]
    application_id: Optional[int]

    # ============================================================
    # Profiles
    # ============================================================

    candidate_profile: dict[str, Any]
    job_profile: dict[str, Any]

    # ============================================================
    # Candidate -> Jobs Matching
    # ============================================================

    available_jobs: list[dict[str, Any]]
    match_results: list[dict[str, Any]]
    ranked_matches: list[dict[str, Any]]

    matching_criteria: dict[str, Any]

    # ============================================================
    # Task Decomposition
    # ============================================================

    matching_tasks: list[str]

    # ============================================================
    # RAG
    # ============================================================

    retrieved_context: list[str]

    # ============================================================
    # LLM Recommendation
    # ============================================================

    match_recommendation: Optional[dict[str, Any]]

    # ============================================================
    # Human Review / HITL
    # ============================================================

    recruiter_decision: Optional[str]
    recruiter_feedback: Optional[str]

    # ============================================================
    # Workflow
    # ============================================================

    current_stage: str
    status: str
    next_action: Optional[str]

    # ============================================================
    # Failure / Recovery
    # ============================================================

    retry_count: int
    failure_ticket_id: Optional[str]

    failure_record: Optional[dict[str, Any]]
    failure_node: Optional[str] 
    failure_error: Optional[str]
