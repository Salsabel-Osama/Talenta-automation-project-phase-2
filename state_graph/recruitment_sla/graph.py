from typing import Any, Callable, Optional

from common.checkpoint import get_checkpointer
from common.retry_recovery import EXTERNAL_RETRY_POLICY
from langgraph.graph import END, START, StateGraph


from .state import RecruitmentSLAState

from .nodes import (
    sla_analyze_applications,
    sla_create_alerts,
    sla_determine_escalation,
    sla_escalate,
    sla_filter_active_applications,
    sla_hr_review,
    sla_load_applications,
    sla_load_policy,
    sla_resolve,
)


# ============================================================
# Retry Policies
# ============================================================

# ------------------------------------------------------------
# External service retry policy
#
# Used for nodes that communicate with external systems such
# as database, MCP server, API, RAG service, etc.
#
# Retry sequence:
#
# attempt 1
#    ↓ failure
# wait 1 second
#    ↓
# attempt 2
#    ↓ failure
# wait 2 seconds
#    ↓
# attempt 3
#    ↓ failure
# wait 4 seconds
#    ↓
# attempt 4
#
# If the 4 attempts fail, the error is propagated.
# ------------------------------------------------------------

from common.retry_recovery import (
    EXTERNAL_RETRY_POLICY,
)

retry_policy=EXTERNAL_RETRY_POLICY
# ============================================================
# Routing Functions
# ============================================================


def route_after_sla_analysis(
    state: RecruitmentSLAState,
) -> str:
    """
    Decide whether alerts need to be created.

    If delayed applications exist:
        continue to alert creation.

    Otherwise:
        finish the graph.
    """

    if state.get("delayed_applications"):
        return "create_alerts"

    return "end"


def route_after_escalation(
    state: RecruitmentSLAState,
) -> str:
    """
    Decide whether HR intervention is required.
    """

    escalation_level = state.get(
        "escalation_level"
    )

    if escalation_level in {
        "warning",
        "critical",
    }:
        return "hr_review"

    return "end"


def route_after_hr_review(
    state: RecruitmentSLAState,
) -> str:
    """
    Route according to HR's decision.
    """

    action = state.get(
        "hr_action"
    )

    if action == "resolve":
        return "resolve"

    if action == "escalate":
        return "escalate"

    raise ValueError(
        f"Invalid HR action: {action}"
    )


# ============================================================
# Graph Builder
# ============================================================


def build_recruitment_sla_graph(
    load_applications_function: Callable[
        [RecruitmentSLAState],
        list[dict[str, Any]],
    ],
    sla_policy_function: Callable[
        [RecruitmentSLAState],
        dict[str, Any],
    ],
) -> StateGraph:
    """
    Build the Recruitment SLA state graph.

    The graph remains completely independent from the other
    recruitment graphs.

    External dependencies are injected through functions:

        load_applications_function
        sla_policy_function

    RetryPolicy is applied only to nodes that communicate
    with external systems.
    """

    builder = StateGraph(
        RecruitmentSLAState
    )

    # ========================================================
    # Nodes
    # ========================================================

    # --------------------------------------------------------
    # 1. Load Applications
    # --------------------------------------------------------
    #
    # This node can communicate with:
    #
    # DB / MCP / API
    #
    # Therefore it gets RetryPolicy.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_load_applications",
        lambda state: sla_load_applications(
            state,
            load_applications=
                load_applications_function,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # 2. Filter Active Applications
    # --------------------------------------------------------
    #
    # Local deterministic processing.
    # No external dependency.
    #
    # No retry needed.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_filter_active_applications",
        sla_filter_active_applications,
    )

    # --------------------------------------------------------
    # 3. Load SLA Policy
    # --------------------------------------------------------
    #
    # This can communicate with:
    #
    # DB / MCP / RAG / external policy service
    #
    # Therefore it gets RetryPolicy.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_load_policy",
        lambda state: sla_load_policy(
            state,
            sla_policy_function=
                sla_policy_function,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # 4. Analyze Applications
    # --------------------------------------------------------
    #
    # Pure local calculation.
    #
    # No retry needed.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_analyze_applications",
        sla_analyze_applications,
    )

    # --------------------------------------------------------
    # 5. Create Alerts
    # --------------------------------------------------------
    #
    # Currently this node only creates alert objects in state.
    #
    # No external side effect.
    #
    # Therefore no RetryPolicy for now.
    #
    # If later this node sends alerts through MCP/API,
    # we should add RetryPolicy to it.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_create_alerts",
        sla_create_alerts,
    )

    # --------------------------------------------------------
    # 6. Determine Escalation
    # --------------------------------------------------------
    #
    # Local deterministic logic.
    #
    # No retry needed.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_determine_escalation",
        sla_determine_escalation,
    )

    # --------------------------------------------------------
    # 7. HR Review
    # --------------------------------------------------------
    #
    # HITL node.
    #
    # It uses interrupt() and waits for human input.
    #
    # NEVER put RetryPolicy here.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_hr_review",
        sla_hr_review,
    )

    # --------------------------------------------------------
    # 8. Resolve
    # --------------------------------------------------------
    #
    # Currently local state update only.
    #
    # No retry needed.
    #
    # If this later performs an external DB/API/MCP update,
    # add RetryPolicy.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_resolve",
        sla_resolve,
    )

    # --------------------------------------------------------
    # 9. Escalate
    # --------------------------------------------------------
    #
    # Currently local state update only.
    #
    # No retry needed.
    #
    # If this later sends an external escalation notification,
    # add RetryPolicy.
    #
    # --------------------------------------------------------

    builder.add_node(
        "sla_escalate",
        sla_escalate,
    )

    # ========================================================
    # START
    # ========================================================

    builder.add_edge(
        START,
        "sla_load_applications",
    )

    # ========================================================
    # Load Applications -> Filter
    # ========================================================

    builder.add_edge(
        "sla_load_applications",
        "sla_filter_active_applications",
    )

    # ========================================================
    # Filter -> Load Policy
    # ========================================================

    builder.add_edge(
        "sla_filter_active_applications",
        "sla_load_policy",
    )

    # ========================================================
    # Policy -> Analysis
    # ========================================================

    builder.add_edge(
        "sla_load_policy",
        "sla_analyze_applications",
    )

    # ========================================================
    # Analysis -> Alerts / END
    # ========================================================

    builder.add_conditional_edges(
        "sla_analyze_applications",
        route_after_sla_analysis,
        {
            "create_alerts":
                "sla_create_alerts",

            "end":
                END,
        },
    )

    # ========================================================
    # Alerts -> Determine Escalation
    # ========================================================

    builder.add_edge(
        "sla_create_alerts",
        "sla_determine_escalation",
    )

    # ========================================================
    # Escalation -> HR Review / END
    # ========================================================

    builder.add_conditional_edges(
        "sla_determine_escalation",
        route_after_escalation,
        {
            "hr_review":
                "sla_hr_review",

            "end":
                END,
        },
    )

    # ========================================================
    # HR Review -> Resolve / Escalate
    # ========================================================

    builder.add_conditional_edges(
        "sla_hr_review",
        route_after_hr_review,
        {
            "resolve":
                "sla_resolve",

            "escalate":
                "sla_escalate",
        },
    )

    # ========================================================
    # Resolution
    # ========================================================

    builder.add_edge(
        "sla_resolve",
        END,
    )

    builder.add_edge(
        "sla_escalate",
        END,
    )

    return builder


# ============================================================
# Compile Graph
# ============================================================


def compile_recruitment_sla_graph(
    load_applications_function: Callable,
    sla_policy_function: Callable,
    checkpointer: Optional[Any] = None,
):
    """
    Build and compile the Recruitment SLA graph.

    Checkpointing allows LangGraph to persist the workflow
    state using the same thread_id.

    If the process stops after a completed node, the graph
    can resume from the checkpoint instead of starting over.
    """

    builder = build_recruitment_sla_graph(
        load_applications_function=
            load_applications_function,

        sla_policy_function=
            sla_policy_function,
    )

    # --------------------------------------------------------
    # Checkpoint
    # --------------------------------------------------------
    #
    # MemorySaver is currently used for development/testing.
    #
    # Later:
    # replace it with the project's durable checkpoint
    # implementation.
    #
    # --------------------------------------------------------

    if checkpointer is None:
        checkpointer = get_checkpointer()

    graph = builder.compile(
        checkpointer=checkpointer,
    )

    return graph