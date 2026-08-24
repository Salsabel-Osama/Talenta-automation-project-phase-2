from typing import Any, Callable

from common.checkpoint import get_checkpointer
from common.retry_recovery import EXTERNAL_RETRY_POLICY

from langgraph.graph import END, START, StateGraph

from .state import CandidateMatchingState

from .nodes import (
    adjust_matching_criteria,
    check_candidate_profile,
    decompose_matching_task,
    find_matching_jobs,
    generate_match_recommendation,
    load_candidate_context,
    match_candidate_to_jobs,
    process_recruiter_decision,
    rank_matches,
    retrieve_hiring_policy,
    recruiter_review,
)

retry_policy=EXTERNAL_RETRY_POLICY
# ============================================================
# Routing Functions
# ============================================================

def route_after_profile_check(
    state: CandidateMatchingState,
) -> str:
    """
    Route according to candidate profile completeness.
    """

    if state.get("status") == "waiting":
        return "waiting"

    return "continue"


def route_after_recruiter_decision(
    state: CandidateMatchingState,
) -> str:
    """
    Route according to recruiter decision.
    """

    decision = state.get(
        "recruiter_decision"
    )

    if decision == "approve":
        return "approved"

    if decision == "reject":
        return "rejected"

    if decision == "request_re_match":
        return "re_match"

    raise ValueError(
        f"Invalid recruiter decision: {decision}"
    )


# ============================================================
# Graph Builder
# ============================================================

def build_candidate_matching_graph(
    load_candidate: Callable[
        [int],
        dict[str, Any],
    ],
    retrieve_policy: Callable[
        [CandidateMatchingState],
        list[str],
    ],
    find_jobs_for_candidate: Callable[
        [CandidateMatchingState],
        list[dict[str, Any]],
    ],
    match_candidate_job: Callable[
        [
            dict[str, Any],
            dict[str, Any],
            dict[str, Any],
        ],
        dict[str, Any],
    ],
    llm: Callable[
        [str],
        dict[str, Any],
    ],
):
    """
    Build the Candidate-to-Job Matching graph.

    External dependencies are injected into the graph.
    """

    builder = StateGraph(
        CandidateMatchingState
    )

    # ========================================================
    # Nodes
    # ========================================================

    builder.add_node(
        "load_candidate_context",
        lambda state: load_candidate_context(
            state,
            load_candidate=load_candidate,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    builder.add_node(
        "check_candidate_profile",
        check_candidate_profile,
    )

    builder.add_node(
        "decompose_matching_task",
        decompose_matching_task,
    )

    builder.add_node(
        "retrieve_hiring_policy",
        lambda state: retrieve_hiring_policy(
            state,
            retrieve_policy=retrieve_policy,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    builder.add_node(
        "find_matching_jobs",
        lambda state: find_matching_jobs(
            state,
            find_jobs_for_candidate=find_jobs_for_candidate,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    builder.add_node(
        "match_candidate_to_jobs",
        lambda state: match_candidate_to_jobs(
            state,
            match_candidate_job=match_candidate_job,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    builder.add_node(
        "rank_matches",
        rank_matches,
    )

    builder.add_node(
        "generate_match_recommendation",
        lambda state: generate_match_recommendation(
            state,
            llm=llm,
        ),
        retry_policy=EXTERNAL_RETRY_POLICY,
    )

    builder.add_node(
        "recruiter_review",
        recruiter_review,
    )

    builder.add_node(
        "process_recruiter_decision",
        process_recruiter_decision,
    )

    builder.add_node(
        "adjust_matching_criteria",
        adjust_matching_criteria,
    )

    # ========================================================
    # START
    # ========================================================

    builder.add_edge(
        START,
        "load_candidate_context",
    )

    # ========================================================
    # Candidate Profile
    # ========================================================

    builder.add_edge(
        "load_candidate_context",
        "check_candidate_profile",
    )

    builder.add_conditional_edges(
        "check_candidate_profile",
        route_after_profile_check,
        {
            "continue": "decompose_matching_task",
            "waiting": END,
        },
    )

    # ========================================================
    # Matching Pipeline
    # ========================================================

    builder.add_edge(
        "decompose_matching_task",
        "retrieve_hiring_policy",
    )

    builder.add_edge(
        "retrieve_hiring_policy",
        "find_matching_jobs",
    )

    builder.add_edge(
        "find_matching_jobs",
        "match_candidate_to_jobs",
    )

    builder.add_edge(
        "match_candidate_to_jobs",
        "rank_matches",
    )

    builder.add_edge(
        "rank_matches",
        "generate_match_recommendation",
    )

    # ========================================================
    # HITL
    # ========================================================

    builder.add_edge(
        "generate_match_recommendation",
        "recruiter_review",
    )

    builder.add_edge(
        "recruiter_review",
        "process_recruiter_decision",
    )

    # ========================================================
    # Recruiter Decision
    # ========================================================

    builder.add_conditional_edges(
        "process_recruiter_decision",
        route_after_recruiter_decision,
        {
            "approved": END,
            "rejected": END,
            "re_match": "adjust_matching_criteria",
        },
    )

    # ========================================================
    # Re-Matching
    # ========================================================

    builder.add_edge(
        "adjust_matching_criteria",
        "match_candidate_to_jobs",
    )

    return builder


# ============================================================
# Compile Graph
# ============================================================

def compile_candidate_matching_graph(
    load_candidate,
    retrieve_policy,
    find_jobs_for_candidate,
    match_candidate_job,
    llm,
    checkpointer=None,
):
    """
    Build and compile the Candidate Matching graph.

    A durable SqliteSaver is used by default.
    """

    builder = build_candidate_matching_graph(
        load_candidate=load_candidate,
        retrieve_policy=retrieve_policy,
        find_jobs_for_candidate=find_jobs_for_candidate,
        match_candidate_job=match_candidate_job,
        llm=llm,
    )

    if checkpointer is None:
        checkpointer = get_checkpointer()

    return builder.compile(
        checkpointer=checkpointer,
    )