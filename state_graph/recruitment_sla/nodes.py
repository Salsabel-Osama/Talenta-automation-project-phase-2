from datetime import datetime, timezone
from typing import Any, Callable

from langgraph.config import get_config
from langgraph.types import interrupt

from common.hitl import create_hitl_task, get_pending_hitl_task

from .state import RecruitmentSLAState


# ============================================================
# Load Applications
# ============================================================

def sla_load_applications(
    state: RecruitmentSLAState,
    load_applications: Callable[
        [RecruitmentSLAState],
        list[dict[str, Any]],
    ],
) -> RecruitmentSLAState:

    applications = load_applications(state)

    if applications is None:
        applications = []

    return {
        **state,
        "applications": applications,
        "current_stage": "applications_loaded",
        "status": "ready",
        "next_action": "filter_active_applications",
    }


# ============================================================
# Filter Active Applications
# ============================================================

def sla_filter_active_applications(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    applications = state.get(
        "applications",
        [],
    )

    active_applications = [
        application
        for application in applications
        if str(
            application.get(
                "status",
                "",
            )
        ).upper()
        not in {
            "ACCEPTED",
            "REJECTED",
        }
    ]

    return {
        **state,
        "active_applications": active_applications,
        "current_stage": "active_applications_filtered",
        "status": "ready",
        "next_action": "load_sla_policy",
    }


# ============================================================
# Load SLA Policy
# ============================================================

def sla_load_policy(
    state: RecruitmentSLAState,
    sla_policy_function: Callable[
        [RecruitmentSLAState],
        dict[str, Any],
    ],
) -> RecruitmentSLAState:

    policy = sla_policy_function(state)

    return {
        **state,
        "sla_policy": policy,
        "current_stage": "sla_policy_loaded",
        "status": "ready",
        "next_action": "analyze_sla",
    }


# ============================================================
# Analyze SLA
# ============================================================

def sla_analyze_applications(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    applications = state.get(
        "active_applications",
        [],
    )

    policy = state.get(
        "sla_policy",
        {},
    )

    # --------------------------------------------------------
    # SLA Thresholds
    #
    # <= 2 days  -> Within SLA
    # > 2 days   -> Warning
    # > 5 days   -> Critical
    # --------------------------------------------------------

    warning_days = policy.get(
        "warning_after_days",
        2,
    )

    critical_days = policy.get(
        "critical_after_days",
        5,
    )

    now = datetime.now(timezone.utc)

    delayed_applications = []
    bottlenecks = []

    within_sla_count = 0
    warning_count = 0
    critical_count = 0

    for application in applications:

        created_at = application.get(
            "created_at"
        )

        # ----------------------------------------------------
        # Ignore applications without creation date
        # ----------------------------------------------------

        if not created_at:
            continue

        # ----------------------------------------------------
        # Parse created_at
        # ----------------------------------------------------

        try:

            if isinstance(
                created_at,
                datetime,
            ):
                created = created_at

            else:
                created = datetime.fromisoformat(
                    str(
                        created_at
                    )
                    .replace(
                        "Z",
                        "+00:00",
                    )
                    .replace(
                        " ",
                        "T",
                    )
                )

        except ValueError:

            continue

        # ----------------------------------------------------
        # Ensure timezone-aware datetime
        # ----------------------------------------------------

        if created.tzinfo is None:

            created = created.replace(
                tzinfo=timezone.utc
            )

        # ----------------------------------------------------
        # Calculate application age
        # ----------------------------------------------------

        age_days = (
            now - created
        ).total_seconds() / 86400

        age_days = round(
            max(
                age_days,
                0,
            ),
            2,
        )

        # ----------------------------------------------------
        # Within SLA
        # ----------------------------------------------------

        if age_days <= warning_days:

            within_sla_count += 1

            continue

        # ----------------------------------------------------
        # Delayed Application
        # ----------------------------------------------------

        severity = "warning"

        # ----------------------------------------------------
        # Critical
        # ----------------------------------------------------

        if age_days > critical_days:

            severity = "critical"

            critical_count += 1

        # ----------------------------------------------------
        # Warning
        # ----------------------------------------------------

        else:

            warning_count += 1

        delayed_application = {
            **application,
            "age_days": age_days,
            "sla_warning_after_days": warning_days,
            "sla_critical_after_days": critical_days,
            "severity": severity,
        }

        delayed_applications.append(
            delayed_application
        )

    # ========================================================
    # Bottlenecks
    # ========================================================

    if delayed_applications:

        bottlenecks.append(
            {
                "type": "application_delay",
                "count": len(
                    delayed_applications
                ),
                "warning_count": warning_count,
                "critical_count": critical_count,
                "reason": (
                    "Active applications exceeded "
                    "the configured SLA threshold."
                ),
            }
        )

    # ========================================================
    # SLA Analysis
    # ========================================================

    sla_analysis = {
        "total_applications":
            len(applications),

        "within_sla_count":
            within_sla_count,

        "delayed_count":
            len(delayed_applications),

        "warning_count":
            warning_count,

        "critical_count":
            critical_count,

        "sla_warning_after_days":
            warning_days,

        "sla_critical_after_days":
            critical_days,
    }

    # ========================================================
    # Return State
    # ========================================================

    return {
        **state,

        "sla_analysis":
            sla_analysis,

        "delayed_applications":
            delayed_applications,

        "bottlenecks":
            bottlenecks,

        "current_stage":
            "sla_analyzed",

        "status":
            "ready",

        "next_action": (
            "create_alerts"
            if delayed_applications
            else "end"
        ),
    }


# ============================================================
# Create Alerts
# ============================================================

def sla_create_alerts(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    delayed_applications = state.get(
        "delayed_applications",
        [],
    )

    alerts = []

    for application in delayed_applications:

        severity = application.get(
            "severity",
            "warning",
        )

        if severity == "warning":

            reason = (
                "Application exceeded "
                "the warning SLA threshold."
            )

        else:

            reason = (
                "Application exceeded "
                "the critical SLA threshold."
            )

        alerts.append(
            {
                "application_id":
                    application.get(
                        "application_id"
                    ),

                "candidate_id":
                    application.get(
                        "candidate_id"
                    ),

                "job_id":
                    application.get(
                        "job_id"
                    ),

                "status":
                    application.get(
                        "status"
                    ),

                "age_days":
                    application.get(
                        "age_days"
                    ),

                "severity":
                    severity,

                "reason":
                    reason,
            }
        )

    return {
        **state,
        "alerts": alerts,
        "current_stage": "alerts_created",
        "status": "ready",
        "next_action": "determine_escalation",
    }


# ============================================================
# Determine Escalation
# ============================================================

def sla_determine_escalation(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    delayed_applications = state.get(
        "delayed_applications",
        [],
    )

    escalation_level = "none"

    for application in delayed_applications:

        severity = application.get(
            "severity",
            "warning",
        )

        # ----------------------------------------------------
        # Critical has highest priority
        # ----------------------------------------------------

        if severity == "critical":

            escalation_level = "critical"

            break

        # ----------------------------------------------------
        # Warning
        # ----------------------------------------------------

        if severity == "warning":

            escalation_level = "warning"

    return {
        **state,

        "escalation_level":
            escalation_level,

        "current_stage":
            "escalation_determined",

        "status":
            "ready",

        "next_action": (
            "hr_review"
            if escalation_level != "none"
            else "end"
        ),
    }


# ============================================================
# HR Review - HITL
# ============================================================

def sla_hr_review(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    interrupt_payload = {

        "type":
            "recruitment_sla_review",

        "job_id":
            state.get(
                "job_id"
            ),

        "escalation_level":
            state.get(
                "escalation_level"
            ),

        "alerts":
            state.get(
                "alerts",
                [],
            ),

        "sla_analysis":
            state.get(
                "sla_analysis",
                {},
            ),

        "message":
            "Recruitment SLA escalation "
            "requires HR action.",

        "allowed_actions": [
            "resolve",
            "escalate",
        ],
    }

    thread_id = get_config()["configurable"]["thread_id"]

    # Persist a real HITL task before pausing. interrupt() replays
    # this node from the top on every resume, so only create the
    # task the first time we reach it for this run.
    if get_pending_hitl_task(
        thread_id=thread_id,
        node_name="sla_hr_review",
    ) is None:

        create_hitl_task(
            thread_id=thread_id,
            graph_name="recruitment_sla",
            node_name="sla_hr_review",
            task_type="recruitment_sla_review",
            reason=(
                "This job's recruitment SLA has been breached past "
                "the escalation threshold; only HR can decide "
                "whether to resolve or escalate it, the agent is "
                "not allowed to close or escalate an SLA issue on "
                "its own."
            ),
            state=dict(state),
            requested_action="resolve | escalate",
            allowed_actions=["resolve", "escalate"],
        )

    decision = interrupt(
        interrupt_payload
    )

    if not isinstance(
        decision,
        dict,
    ):

        raise ValueError(
            "HR decision must be a dictionary."
        )

    action = decision.get(
        "action"
    )

    if action not in {
        "resolve",
        "escalate",
    }:

        raise ValueError(
            "Invalid HR action. "
            "Expected: resolve or escalate."
        )

    feedback = decision.get(
        "feedback"
    )

    return {
        **state,

        "hr_action":
            action,

        "hr_feedback":
            feedback,

        "current_stage":
            "hr_review_completed",

        "status":
            "ready",

        "next_action": (
            "resolve_sla"
            if action == "resolve"
            else "escalate_sla"
        ),
    }


# ============================================================
# Resolve SLA
# ============================================================

def sla_resolve(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    delayed_count = len(
        state.get(
            "delayed_applications",
            [],
        )
    )

    resolution_report = {

        "action":
            "resolve",

        "status":
            "resolved",

        "delayed_applications":
            delayed_count,

        "hr_feedback":
            state.get(
                "hr_feedback"
            ),
    }

    return {
        **state,

        "resolution_status":
            "resolved",

        "resolution_report":
            resolution_report,

        "current_stage":
            "sla_resolved",

        "status":
            "completed",

        "next_action":
            "end",
    }


# ============================================================
# Escalate SLA
# ============================================================

def sla_escalate(
    state: RecruitmentSLAState,
) -> RecruitmentSLAState:

    delayed_count = len(
        state.get(
            "delayed_applications",
            [],
        )
    )

    resolution_report = {

        "action":
            "escalate",

        "status":
            "escalated",

        "escalation_level":
            state.get(
                "escalation_level"
            ),

        "delayed_applications":
            delayed_count,

        "hr_feedback":
            state.get(
                "hr_feedback"
            ),
    }

    return {
        **state,

        "resolution_status":
            "escalated",

        "resolution_report":
            resolution_report,

        "current_stage":
            "sla_escalated",

        "status":
            "completed",

        "next_action":
            "end",
    }