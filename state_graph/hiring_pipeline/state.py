from typing import Any, Optional, TypedDict
failure_record: Optional[dict[str, Any]]
failure_node: Optional[str]
failure_error: Optional[str]

class HiringPipelineState(TypedDict, total=False):
    # ============================================================
    # IDs
    # ============================================================

    candidate_id: int
    job_id: Optional[int]
    application_id: Optional[int]

    # ============================================================
    # Candidate / Job Profiles
    # ============================================================

    candidate_profile: dict[str, Any]
    job_profile: dict[str, Any]

    # ============================================================
    # Screening
    # ============================================================

    screening_result: Optional[dict[str, Any]]
    meets_requirements: Optional[bool]

    # ============================================================
    # Shortlist
    # ============================================================

    shortlisted: Optional[bool]
    needs_interview: Optional[bool]

    # ============================================================
    # Interview
    # ============================================================

    interview_scheduled: Optional[bool]
    interview_status: Optional[str]
    interview_data: Optional[dict[str, Any]]
    interview_evaluation: Optional[dict[str, Any]]

    # ============================================================
    # Evidence
    # ============================================================

    enough_evidence: Optional[bool]
    additional_interview_required: Optional[bool]

    # ============================================================
    # Hiring Recommendation
    # ============================================================

    hiring_recommendation: Optional[dict[str, Any]]

    # ============================================================
    # Human-in-the-Loop
    # ============================================================

    recruiter_decision: Optional[str]
    recruiter_feedback: Optional[str]

    # ============================================================
    # Offer
    # ============================================================

    offer_status: Optional[str]

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
