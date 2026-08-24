from typing import Any, TypedDict


class RecruitmentSLAState(
    TypedDict,
    total=False,
):

    # ========================================================
    # Context
    # ========================================================

    recruitment_id: int
    job_id: int

    # ========================================================
    # Applications
    # ========================================================

    applications: list[dict[str, Any]]
    active_applications: list[dict[str, Any]]

    # ========================================================
    # SLA
    # ========================================================

    sla_policy: dict[str, Any]
    sla_analysis: dict[str, Any]

    delayed_applications: list[dict[str, Any]]

    # ========================================================
    # Bottlenecks / Alerts
    # ========================================================

    bottlenecks: list[dict[str, Any]]
    alerts: list[dict[str, Any]]

    escalation_level: str | None

    # ========================================================
    # HR HITL
    # ========================================================

    hr_action: str | None
    hr_feedback: str | None

    # ========================================================
    # Resolution
    # ========================================================

    resolution_status: str | None
    resolution_report: dict[str, Any] | None

    # ========================================================
    # Workflow
    # ========================================================

    current_stage: str
    status: str
    next_action: str

    # ============================================================
    # Failure / Recovery
    # ============================================================

    retry_count: int
    failure_ticket_id: str | None

    failure_record: dict[str, Any] | None
    failure_node: str | None
    failure_error: str | None