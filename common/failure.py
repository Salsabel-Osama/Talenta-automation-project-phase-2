from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from .checkpoint import (
    get_application_connection,
    get_checkpoint_lock,
)


# ============================================================
# Failure Record
# ============================================================

def create_failure_record(
    *,
    graph_name: str,
    node_name: str,
    error: Exception,
    state: dict[str, Any],
) -> dict[str, Any]:
    """
    Create a structured failure record.
    """

    return {
        "graph_name": graph_name,
        "node_name": node_name,
        "error_type": type(error).__name__,
        "error_message": str(error),
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),
        "current_stage": state.get(
            "current_stage"
        ),
        "status": state.get(
            "status"
        ),
        "retry_count": state.get(
            "retry_count",
            0,
        ),
        "thread_id": state.get(
            "thread_id"
        ),
    }


# ============================================================
# Create Failure Ticket
# ============================================================

def create_failure_ticket(
    *,
    graph_name: str,
    node_name: str | None = None,
    error: Exception | None = None,
    state: dict[str, Any] | None = None,
    thread_id: str,
    run_id: int | None = None,
    checkpoint_id: int | None = None,
    priority: str = "medium",
    failure_record: dict[str, Any] | None = None,
) -> int:
    """
    Persist a durable failure ticket.
    """

    state = state or {}

    # --------------------------------------------------------
    # Build failure record
    # --------------------------------------------------------

    if failure_record is None:

        if error is None:
            error = RuntimeError(
                "Unknown graph failure."
            )

        failure_record = create_failure_record(
            graph_name=graph_name,
            node_name=node_name or "unknown",
            error=error,
            state=state,
        )

    # --------------------------------------------------------
    # Resolve values
    # --------------------------------------------------------

    resolved_node_name = (
        node_name
        or failure_record.get("node_name")
        or failure_record.get("failure_node")
        or "unknown"
    )

    error_type = (
        failure_record.get(
            "error_type"
        )
        or (
            type(error).__name__
            if error is not None
            else "UnknownError"
        )
    )

    error_message = (
        failure_record.get(
            "error_message"
        )
        or failure_record.get(
            "error"
        )
        or (
            str(error)
            if error is not None
            else "Unknown graph failure."
        )
    )

    state_snapshot = json.dumps(
        state,
        default=str,
        ensure_ascii=False,
    )

    # --------------------------------------------------------
    # Database operation
    # --------------------------------------------------------

    lock = get_checkpoint_lock()

    with lock:

        connection = get_application_connection()

        try:

            cursor = connection.execute(
                """
                INSERT INTO failure_tickets (
                    run_id,
                    thread_id,
                    graph_name,
                    node_name,
                    error_type,
                    error_message,
                    state_snapshot,
                    checkpoint_id,
                    status,
                    priority
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
                """,
                (
                    run_id,
                    thread_id,
                    graph_name,
                    resolved_node_name,
                    error_type,
                    error_message,
                    state_snapshot,
                    checkpoint_id,
                    priority,
                ),
            )

            ticket_id = cursor.lastrowid

            connection.commit()

            if ticket_id is None:
                raise RuntimeError(
                    "Failure ticket was created but "
                    "no ticket_id was returned."
                )

            return int(ticket_id)

        finally:

            connection.close()


# ============================================================
# Mark Failure
# ============================================================

def mark_failure(
    state: dict[str, Any],
    failure_record: dict[str, Any],
    *,
    ticket_id: int | None = None,
) -> dict[str, Any]:
    """
    Store failure information inside graph state.
    """

    return {
        **state,
        "status": "failed",
        "failure_record": failure_record,
        "failure_node": failure_record.get(
            "node_name",
            failure_record.get(
                "failure_node"
            ),
        ),
        "failure_error": failure_record.get(
            "error_message",
            failure_record.get(
                "error"
            ),
        ),
        "failure_ticket_id": ticket_id,
        "next_action": "recovery_required",
    }


# ============================================================
# Resolve Failure Ticket
# ============================================================

def resolve_failure_ticket(
    ticket_id: int,
    *,
    admin_id: str,
    resolution: str,
) -> None:
    """
    Resolve a failure ticket.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = get_application_connection()

        try:

            cursor = connection.execute(
                """
                UPDATE failure_tickets

                SET
                    status = 'resolved',
                    assigned_to = ?,
                    resolution = ?,
                    updated_at = CURRENT_TIMESTAMP,
                    resolved_at = CURRENT_TIMESTAMP

                WHERE ticket_id = ?
                """,
                (
                    admin_id,
                    resolution,
                    ticket_id,
                ),
            )

            connection.commit()

            if cursor.rowcount == 0:
                raise ValueError(
                    f"Failure ticket {ticket_id} "
                    "does not exist."
                )

        finally:

            connection.close()


# ============================================================
# Get Failure Ticket
# ============================================================

def get_failure_ticket(
    ticket_id: int,
) -> dict[str, Any] | None:
    """
    Retrieve one failure ticket.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = get_application_connection()

        try:

            row = connection.execute(
                """
                SELECT *
                FROM failure_tickets
                WHERE ticket_id = ?
                """,
                (ticket_id,),
            ).fetchone()

            if row is None:
                return None

            return dict(row)

        finally:

            connection.close()


# ============================================================
# List Open Failure Tickets
# ============================================================

def list_open_failure_tickets() -> list[dict[str, Any]]:
    """
    Return unresolved failure tickets.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = get_application_connection()

        try:

            rows = connection.execute(
                """
                SELECT *
                FROM failure_tickets

                WHERE status IN (
                    'open',
                    'investigating'
                )

                ORDER BY created_at ASC
                """
            ).fetchall()

            return [
                dict(row)
                for row in rows
            ]

        finally:

            connection.close()