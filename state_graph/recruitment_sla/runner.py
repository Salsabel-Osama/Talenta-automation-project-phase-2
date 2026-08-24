from typing import Any

from langgraph.types import Command

from .graph import compile_recruitment_sla_graph

from common.hitl import get_pending_hitl_task, resolve_hitl_task


# ============================================================
# Mock Applications
# ============================================================

def load_applications(
    state: dict[str, Any],
) -> list[dict[str, Any]]:

    return [
        {
            "application_id": 1001,
            "candidate_id": 1,
            "job_id": 101,
            "status": "PENDING",
            "match_score": 92,
            "recruiter_notes": None,
            "created_at": "2026-08-15T10:00:00+00:00",
        },
        {
            "application_id": 1002,
            "candidate_id": 2,
            "job_id": 101,
            "status": "PENDING",
            "match_score": 81,
            "recruiter_notes": None,
            "created_at": "2026-08-21T10:00:00+00:00",
        },
        {
            "application_id": 1003,
            "candidate_id": 3,
            "job_id": 101,
            "status": "REJECTED",
            "match_score": 55,
            "recruiter_notes":
                "Does not meet requirements.",
            "created_at": "2026-08-10T10:00:00+00:00",
        },
    ]


# ============================================================
# Mock SLA Policy
# ============================================================

def get_sla_policy(
    state: dict[str, Any],
) -> dict[str, Any]:

    return {
        "warning_after_days": 2,
        "critical_after_days": 5,
    }


# ============================================================
# Build Graph
# ============================================================

graph = compile_recruitment_sla_graph(
    load_applications_function=load_applications,
    sla_policy_function=get_sla_policy,
)


# ============================================================
# Initial State
# ============================================================

initial_state = {

    # ========================================================
    # Context
    # ========================================================

    "recruitment_id": 1,
    "job_id": 101,

    # ========================================================
    # Applications
    # ========================================================

    "applications": [],
    "active_applications": [],

    # ========================================================
    # SLA
    # ========================================================

    "sla_policy": {},
    "sla_analysis": {},
    "delayed_applications": [],

    # ========================================================
    # Alerts
    # ========================================================

    "bottlenecks": [],
    "alerts": [],
    "escalation_level": None,

    # ========================================================
    # HR
    # ========================================================

    "hr_action": None,
    "hr_feedback": None,

    # ========================================================
    # Resolution
    # ========================================================

    "resolution_status": None,
    "resolution_report": None,

    # ========================================================
    # Workflow
    # ========================================================

    "current_stage": "started",
    "status": "ready",
    "next_action": "load_applications",

    # ========================================================
    # Recovery
    # ========================================================

    "retry_count": 0,
    "failure_ticket_id": None,
}


# ============================================================
# Thread Configuration
# ============================================================
#
# IMPORTANT:
# The same thread_id MUST be used when resuming.
#
# LangGraph uses this ID to find the saved checkpoint.
#
# ============================================================

THREAD_ID = "recruitment-sla-test-1"

config = {
    "configurable": {
        "thread_id": THREAD_ID,
    }
}


# ============================================================
# Interrupt Handler
# ============================================================

def handle_interrupt(
    result: dict[str, Any],
) -> dict[str, str]:

    interrupts = result.get(
        "__interrupt__",
        [],
    )

    if not interrupts:
        raise RuntimeError(
            "Graph reported an interrupt "
            "but no interrupt payload was found."
        )

    interrupt_data = interrupts[0].value

    if not isinstance(
        interrupt_data,
        dict,
    ):
        raise ValueError(
            "Interrupt payload must be a dictionary."
        )

    interrupt_type = interrupt_data.get(
        "type"
    )

    print(
        "\n=== INTERRUPT ==="
    )

    print(
        interrupt_data
    )

    # --------------------------------------------------------
    # SLA HR Review
    # --------------------------------------------------------

    if interrupt_type != "recruitment_sla_review":
        raise ValueError(
            f"Unknown interrupt type: "
            f"{interrupt_type}"
        )

    print(
        "\nHR action:"
    )

    print(
        "resolve = Mark SLA issue as resolved"
    )

    print(
        "escalate = Escalate the issue"
    )

    action = input(
        "\nHR decision "
        "(resolve / escalate): "
    ).strip().lower()

    if action not in {
        "resolve",
        "escalate",
    }:
        raise ValueError(
            "Invalid HR action. "
            "Expected: resolve or escalate."
        )

    feedback = input(
        "HR feedback: "
    ).strip()

    # NOTE: this console prompt is the local test harness. The
    # real platform's admin-approval endpoint is what actually
    # calls resolve_hitl_task() with the real authenticated admin's
    # id, then resumes the graph the same way this function does.
    pending_task = get_pending_hitl_task(
        thread_id=THREAD_ID,
        node_name="sla_hr_review",
    )

    if pending_task is not None:
        resolve_hitl_task(
            pending_task["hitl_task_id"],
            admin_id="console-admin",
            decision=action,
            feedback=feedback,
        )

    return {
        "action": action,
        "feedback": feedback,
    }


# ============================================================
# Run
# ============================================================

if __name__ == "__main__":

    print(
        "\n========================================"
    )

    print(
        "START RECRUITMENT SLA PIPELINE"
    )

    print(
        "========================================"
    )

    print(
        f"Thread ID: {THREAD_ID}"
    )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # First invocation starts a NEW execution for this thread.
    #
    # If the graph reaches an interrupt, LangGraph saves a
    # checkpoint before waiting for the external input.
    #
    # --------------------------------------------------------

    result = graph.invoke(
        initial_state,
        config=config,
    )

    # ========================================================
    # Resume Loop
    # ========================================================

    while result.get("__interrupt__"):

        resume_value = handle_interrupt(
            result
        )

        print(
            "\n=== RESUMING GRAPH ==="
        )

        print(
            f"Thread ID: {THREAD_ID}"
        )

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # We DO NOT create a new thread.
        #
        # We DO NOT send initial_state again.
        #
        # We resume the existing checkpoint using the SAME
        # thread_id.
        #
        # ----------------------------------------------------

        result = graph.invoke(
            Command(
                resume=resume_value
            ),
            config=config,
        )

    # ========================================================
    # Final Result
    # ========================================================

    print(
        "\n========================================"
    )

    print(
        "FINAL RESULT"
    )

    print(
        "========================================"
    )

    print(result)

    # ========================================================
    # Current Stage
    # ========================================================

    print(
        "\n=== CURRENT STAGE ==="
    )

    print(
        result.get(
            "current_stage"
        )
    )

    # ========================================================
    # Status
    # ========================================================

    print(
        "\n=== STATUS ==="
    )

    print(
        result.get(
            "status"
        )
    )

    # ========================================================
    # Next Action
    # ========================================================

    print(
        "\n=== NEXT ACTION ==="
    )

    print(
        result.get(
            "next_action"
        )
    )

    # ========================================================
    # SLA Analysis
    # ========================================================

    print(
        "\n=== SLA ANALYSIS ==="
    )

    print(
        result.get(
            "sla_analysis"
        )
    )

    # ========================================================
    # Alerts
    # ========================================================

    print(
        "\n=== ALERTS ==="
    )

    print(
        result.get(
            "alerts"
        )
    )

    # ========================================================
    # Resolution
    # ========================================================

    print(
        "\n=== RESOLUTION ==="
    )

    print(
        result.get(
            "resolution_report"
        )
    )