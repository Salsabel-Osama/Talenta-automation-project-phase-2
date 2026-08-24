from __future__ import annotations

from typing import Any, Optional

from langgraph.types import RetryPolicy


# ============================================================
# External Retry Policy
# ============================================================

EXTERNAL_RETRY_POLICY = RetryPolicy(
    max_attempts=4,
    initial_interval=1.0,
    backoff_factor=2.0,
    max_interval=8.0,
    jitter=False,
)


# ============================================================
# Helper: Detect HITL Interrupt
# ============================================================

def _is_hitl_interrupt(
    error: BaseException,
) -> bool:
    """
    Detect LangGraph HITL interrupts.

    HITL is expected workflow control flow.
    It must NEVER create a failure ticket.
    """

    # --------------------------------------------------------
    # Primary detection
    # --------------------------------------------------------

    try:

        from langgraph.errors import GraphInterrupt

        if isinstance(
            error,
            GraphInterrupt,
        ):
            return True

    except ImportError:
        pass

    # --------------------------------------------------------
    # Defensive detection for LangGraph versions
    # --------------------------------------------------------

    error_type_name = type(
        error
    ).__name__

    if error_type_name in {
        "GraphInterrupt",
        "Interrupt",
    }:
        return True

    return False


# ============================================================
# Helper: Get Durable State
# ============================================================

def _get_durable_state(
    graph: Any,
    config: dict[str, Any],
) -> dict[str, Any]:
    """
    Read the latest state from the LangGraph checkpointer.
    """

    try:

        snapshot = graph.get_state(
            config
        )

    except Exception:

        return {}

    if snapshot is None:
        return {}

    values = getattr(
        snapshot,
        "values",
        None,
    )

    if isinstance(
        values,
        dict,
    ):
        return dict(values)

    if isinstance(
        snapshot,
        dict,
    ):

        values = snapshot.get(
            "values",
            snapshot,
        )

        if isinstance(
            values,
            dict,
        ):
            return dict(values)

    return {}


# ============================================================
# Helper: Get Current Stage
# ============================================================

def _get_current_stage(
    state: dict[str, Any],
) -> Optional[str]:
    """
    Extract current workflow stage.
    """

    current_stage = state.get(
        "current_stage"
    )

    if current_stage is None:
        return None

    return str(
        current_stage
    )


# ============================================================
# Helper: Get Failure Node
# ============================================================

def _get_failure_node(
    graph: Any,
    config: dict[str, Any],
    state: dict[str, Any],
) -> Optional[str]:
    """
    Best-effort detection of the failed/current node.
    """

    existing_node = state.get(
        "failure_node"
    )

    if existing_node:
        return str(
            existing_node
        )

    try:

        snapshot = graph.get_state(
            config
        )

    except Exception:

        return _get_current_stage(
            state
        )

    # --------------------------------------------------------
    # Check metadata
    # --------------------------------------------------------

    metadata = getattr(
        snapshot,
        "metadata",
        None,
    )

    if isinstance(
        metadata,
        dict,
    ):

        for key in (
            "node",
            "current_node",
            "source",
        ):

            value = metadata.get(
                key
            )

            if (
                isinstance(
                    value,
                    str,
                )
                and value not in {
                    "input",
                    "loop",
                    "update",
                }
            ):
                return value

    # --------------------------------------------------------
    # Check next nodes
    # --------------------------------------------------------

    next_nodes = getattr(
        snapshot,
        "next",
        None,
    )

    if next_nodes:

        if isinstance(
            next_nodes,
            (list, tuple),
        ):

            if next_nodes:
                return str(
                    next_nodes[0]
                )

        elif isinstance(
            next_nodes,
            str,
        ):

            return next_nodes

    # --------------------------------------------------------
    # Final fallback
    # --------------------------------------------------------

    return _get_current_stage(
        state
    )


# ============================================================
# Helper: Build Failure Record
# ============================================================

def _build_failure_record(
    *,
    graph_name: str,
    thread_id: str,
    error: Exception,
    state: dict[str, Any],
    failure_node: Optional[str],
) -> dict[str, Any]:
    """
    Build standardized failure record.
    """

    return {
        "graph_name":
            graph_name,

        "thread_id":
            thread_id,

        "node_name":
            failure_node,

        "failure_node":
            failure_node,

        "error_type":
            type(error).__name__,

        "error":
            str(error),

        "error_message":
            str(error),

        "current_stage":
            state.get(
                "current_stage"
            ),

        "status":
            state.get(
                "status"
            ),

        "retry_count":
            state.get(
                "retry_count",
                0,
            ),

        "next_action":
            state.get(
                "next_action"
            ),
    }


# ============================================================
# Helper: Persist Failure
# ============================================================

def _persist_failure(
    *,
    graph_name: str,
    thread_id: str,
    failure_record: dict[str, Any],
    state: dict[str, Any],
) -> Optional[int]:
    """
    Persist a real graph failure.

    HITL interruptions never reach this function.
    """

    try:

        from .failure import (
            create_failure_ticket
        )

    except Exception:

        return None

    try:

        ticket_id = create_failure_ticket(
            graph_name=graph_name,

            node_name=(
                failure_record.get(
                    "node_name"
                )
                or failure_record.get(
                    "failure_node"
                )
                or "unknown"
            ),

            error=RuntimeError(
                failure_record.get(
                    "error_message",
                    failure_record.get(
                        "error",
                        "Unknown graph failure.",
                    ),
                )
            ),

            state=state,

            thread_id=thread_id,

            failure_record=failure_record,
        )

        return int(
            ticket_id
        )

    except Exception:

        # ----------------------------------------------------
        # Failure persistence must NEVER replace the
        # original graph exception.
        # ----------------------------------------------------

        return None


# ============================================================
# Helper: Update Durable Failure State
# ============================================================

def _update_failure_state(
    graph: Any,
    config: dict[str, Any],
    state: dict[str, Any],
    failure_record: dict[str, Any],
    failure_node: Optional[str],
    failure_ticket_id: Optional[int],
) -> None:
    """
    Best-effort update of durable graph state.
    """

    updated_state = {
        **state,

        "status":
            "failed",

        "current_stage": (
            failure_node
            or state.get(
                "current_stage"
            )
        ),

        "next_action":
            "recovery_required",

        "failure_ticket_id":
            failure_ticket_id,

        "failure_record":
            failure_record,

        "failure_node":
            failure_node,

        "failure_error":
            failure_record.get(
                "error_message",
                failure_record.get(
                    "error"
                ),
            ),
    }

    update_state = getattr(
        graph,
        "update_state",
        None,
    )

    if not callable(
        update_state
    ):
        return

    try:

        update_state(
            config,
            updated_state,
        )

    except Exception:

        # Never replace original exception.
        return


# ============================================================
# Public Recovery Function
# ============================================================

def invoke_with_recovery(
    graph: Any,
    *,
    graph_name: str,
    thread_id: str,
    input_state: Optional[
        dict[str, Any]
    ] = None,
    config: Optional[
        dict[str, Any]
    ] = None,
) -> Any:
    """
    Invoke a LangGraph graph with durable failure recovery.

    Node-level retries are configured separately using
    EXTERNAL_RETRY_POLICY.

    This function intentionally does NOT retry graph.invoke()
    as a whole because doing so can repeat completed side effects.

    HITL interrupts are expected control flow and are NOT
    converted into failure tickets.
    """

    # ========================================================
    # Build Config
    # ========================================================

    if config is None:

        config = {
            "configurable": {
                "thread_id": thread_id,
            }
        }

    else:

        config = {
            **config,

            "configurable": {
                **config.get(
                    "configurable",
                    {},
                ),

                "thread_id":
                    thread_id,
            },
        }

    # ========================================================
    # Invoke Graph
    # ========================================================

    try:

        if input_state is None:

            return graph.invoke(
                None,
                config=config,
            )

        return graph.invoke(
            input_state,
            config=config,
        )

    except BaseException as error:

        # ====================================================
        # HITL Interrupt
        # ====================================================

        if _is_hitl_interrupt(
            error
        ):
            raise

        # ====================================================
        # Only real failures continue below
        # ====================================================

        state = _get_durable_state(
            graph,
            config,
        )

        # ----------------------------------------------------
        # Guarantee thread identity
        # ----------------------------------------------------

        state.setdefault(
            "thread_id",
            thread_id,
        )

        # ====================================================
        # Detect Failure Location
        # ====================================================

        failure_node = _get_failure_node(
            graph,
            config,
            state,
        )

        # ====================================================
        # Build Failure Record
        # ====================================================

        failure_record = _build_failure_record(
            graph_name=graph_name,
            thread_id=thread_id,
            error=(
                error
                if isinstance(
                    error,
                    Exception,
                )
                else RuntimeError(
                    str(error)
                )
            ),
            state=state,
            failure_node=failure_node,
        )

        # ====================================================
        # Persist Failure Ticket
        # ====================================================

        failure_ticket_id = _persist_failure(
            graph_name=graph_name,
            thread_id=thread_id,
            failure_record=failure_record,
            state=state,
        )

        # ====================================================
        # Update Durable State
        # ====================================================

        _update_failure_state(
            graph=graph,
            config=config,
            state=state,
            failure_record=failure_record,
            failure_node=failure_node,
            failure_ticket_id=failure_ticket_id,
        )

        # ====================================================
        # Re-raise Original Exception
        # ====================================================

        raise