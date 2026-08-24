from typing import Any, Callable

from common.checkpoint import get_checkpointer
from common.retry_recovery import EXTERNAL_RETRY_POLICY
from langgraph.graph import END, START, StateGraph

from .state import HiringPipelineState
from .nodes import (
    hiring_pipeline_additional_interview,
    hiring_pipeline_analyze_interview,
    hiring_pipeline_candidate_submitted,
    hiring_pipeline_check_interview_requirement,
    hiring_pipeline_hiring_recommendation,
    hiring_pipeline_interview_completed,
    hiring_pipeline_offer_stage,
    hiring_pipeline_process_hiring_decision,
    hiring_pipeline_reject_candidate,
    hiring_pipeline_recruiter_review,
    hiring_pipeline_schedule_interview,
    hiring_pipeline_screen_candidate,
    hiring_pipeline_shortlist_candidate,
)

retry_policy=EXTERNAL_RETRY_POLICY


# ============================================================
# Routing Functions
# ============================================================

def route_after_screening(
    state: HiringPipelineState,
) -> str:

    if state.get("meets_requirements"):
        return "shortlist"

    return "reject"


def route_after_interview_requirement(
    state: HiringPipelineState,
) -> str:

    if state.get("needs_interview"):
        return "interview"

    return "recruiter_review"


def route_after_interview_analysis(
    state: HiringPipelineState,
) -> str:

    if state.get("enough_evidence"):
        return "hiring_recommendation"

    return "additional_interview"


def route_after_hiring_decision(
    state: HiringPipelineState,
) -> str:

    decision = state.get(
        "recruiter_decision"
    )

    if decision == "approve":
        return "approved"

    if decision == "reject":
        return "rejected"

    raise ValueError(
        f"Invalid recruiter decision: {decision}"
    )


# ============================================================
# Graph Builder
# ============================================================

def build_hiring_pipeline_graph(
    screening_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
    interview_requirement_function: Callable[
        [HiringPipelineState],
        bool,
    ],
    schedule_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
    interview_data_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
    interview_analysis_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
    llm: Callable[
        [str],
        dict[str, Any],
    ],
    offer_function: Callable[
        [HiringPipelineState],
        dict[str, Any],
    ],
):

    builder = StateGraph(
        HiringPipelineState
    )

    # ========================================================
    # Nodes
    # ========================================================

    # --------------------------------------------------------
    # Pure Logic
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_candidate_submitted",
        hiring_pipeline_candidate_submitted,
    )

    # --------------------------------------------------------
    # External Screening Service / MCP
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_screen_candidate",
        lambda state:
            hiring_pipeline_screen_candidate(
                state,
                screening_function=
                    screening_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # Pure Logic
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_reject_candidate",
        hiring_pipeline_reject_candidate,
    )

    builder.add_node(
        "hiring_pipeline_shortlist_candidate",
        hiring_pipeline_shortlist_candidate,
    )

    # --------------------------------------------------------
    # External Policy / MCP
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_check_interview_requirement",
        lambda state:
            hiring_pipeline_check_interview_requirement(
                state,
                interview_requirement_function=
                    interview_requirement_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # External Scheduling System / MCP
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_schedule_interview",
        lambda state:
            hiring_pipeline_schedule_interview(
                state,
                schedule_function=
                    schedule_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # External Interview System
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_interview_completed",
        lambda state:
            hiring_pipeline_interview_completed(
                state,
                interview_data_function=
                    interview_data_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # External Analysis Service / LLM
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_analyze_interview",
        lambda state:
            hiring_pipeline_analyze_interview(
                state,
                interview_analysis_function=
                    interview_analysis_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # External Scheduling System
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_additional_interview",
        lambda state:
            hiring_pipeline_additional_interview(
                state,
                schedule_function=
                    schedule_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # LLM
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_hiring_recommendation",
        lambda state:
            hiring_pipeline_hiring_recommendation(
                state,
                llm=llm,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # --------------------------------------------------------
    # HITL
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_recruiter_review",
        hiring_pipeline_recruiter_review,
    )

    # --------------------------------------------------------
    # Pure Logic
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_process_hiring_decision",
        hiring_pipeline_process_hiring_decision,
    )

    # --------------------------------------------------------
    # External Offer System / MCP
    # --------------------------------------------------------

    builder.add_node(
        "hiring_pipeline_offer_stage",
        lambda state:
            hiring_pipeline_offer_stage(
                state,
                offer_function=
                    offer_function,
            ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    # ========================================================
    # START
    # ========================================================

    builder.add_edge(
        START,
        "hiring_pipeline_candidate_submitted",
    )

    builder.add_edge(
        "hiring_pipeline_candidate_submitted",
        "hiring_pipeline_screen_candidate",
    )

    # ========================================================
    # Screening Routing
    # ========================================================

    builder.add_conditional_edges(
        "hiring_pipeline_screen_candidate",
        route_after_screening,
        {
            "shortlist":
                "hiring_pipeline_shortlist_candidate",

            "reject":
                "hiring_pipeline_reject_candidate",
        },
    )

    builder.add_edge(
        "hiring_pipeline_reject_candidate",
        END,
    )

    # ========================================================
    # Shortlist -> Interview Requirement
    # ========================================================

    builder.add_edge(
        "hiring_pipeline_shortlist_candidate",
        "hiring_pipeline_check_interview_requirement",
    )

    builder.add_conditional_edges(
        "hiring_pipeline_check_interview_requirement",
        route_after_interview_requirement,
        {
            "interview":
                "hiring_pipeline_schedule_interview",

            "recruiter_review":
                "hiring_pipeline_recruiter_review",
        },
    )

    # ========================================================
    # Schedule -> Wait for Interview
    # ========================================================

    builder.add_edge(
        "hiring_pipeline_schedule_interview",
        "hiring_pipeline_interview_completed",
    )

    builder.add_edge(
        "hiring_pipeline_interview_completed",
        "hiring_pipeline_analyze_interview",
    )

    # ========================================================
    # Interview Analysis Routing
    # ========================================================

    builder.add_conditional_edges(
        "hiring_pipeline_analyze_interview",
        route_after_interview_analysis,
        {
            "hiring_recommendation":
                "hiring_pipeline_hiring_recommendation",

            "additional_interview":
                "hiring_pipeline_additional_interview",
        },
    )

    # ========================================================
    # Additional Interview Loop
    # ========================================================

    builder.add_edge(
        "hiring_pipeline_additional_interview",
        "hiring_pipeline_interview_completed",
    )

    # ========================================================
    # Recommendation -> Recruiter HITL
    # ========================================================

    builder.add_edge(
        "hiring_pipeline_hiring_recommendation",
        "hiring_pipeline_recruiter_review",
    )

    builder.add_edge(
        "hiring_pipeline_recruiter_review",
        "hiring_pipeline_process_hiring_decision",
    )

    # ========================================================
    # Hiring Decision
    # ========================================================

    builder.add_conditional_edges(
        "hiring_pipeline_process_hiring_decision",
        route_after_hiring_decision,
        {
            "approved":
                "hiring_pipeline_offer_stage",

            "rejected":
                END,
        },
    )

    # ========================================================
    # Offer
    # ========================================================

    builder.add_edge(
        "hiring_pipeline_offer_stage",
        END,
    )

    return builder


# ============================================================
# Compile Graph
# ============================================================

def compile_hiring_pipeline_graph(
    screening_function,
    interview_requirement_function,
    schedule_function,
    interview_data_function,
    interview_analysis_function,
    llm,
    offer_function,
    checkpointer=None,
):

    builder = build_hiring_pipeline_graph(
        screening_function=
            screening_function,

        interview_requirement_function=
            interview_requirement_function,

        schedule_function=
            schedule_function,

        interview_data_function=
            interview_data_function,

        interview_analysis_function=
            interview_analysis_function,

        llm=
            llm,

        offer_function=
            offer_function,
    )

    # --------------------------------------------------------
    # Development fallback
    # --------------------------------------------------------

    if checkpointer is None:
        checkpointer = get_checkpointer()

    return builder.compile(
        checkpointer=checkpointer,
    )