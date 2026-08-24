from __future__ import annotations

import json
import sqlite3
from typing import Any

from langgraph.types import interrupt

from .checkpoint import (
    get_application_connection,
    get_checkpoint_database_path,
    get_checkpoint_lock,
)


# ============================================================
# HITL Database Connection
# ============================================================

def _get_hitl_connection() -> sqlite3.Connection:
    """
    Open a dedicated application SQLite connection.

    IMPORTANT:
    This is NOT the long-lived LangGraph SqliteSaver
    connection.

    It points to the exact same talenta.db file and ensures
    the application schema exists.
    """

    # Keep the helper local so existing imports remain valid.
    #
    # get_application_connection() already:
    # - opens the same DB
    # - configures WAL
    # - enables foreign keys
    # - sets row_factory
    # - ensures hitl_tasks exists

    return get_application_connection()


# ============================================================
# Create HITL Task
# ============================================================

def create_hitl_task(
    *,
    thread_id: str,
    graph_name: str,
    node_name: str,
    task_type: str,
    reason: str,
    state: dict[str, Any],
    run_id: int | None = None,
    requested_action: str | None = None,
    allowed_actions: list[str] | None = None,
) -> int:
    """
    Persist a HITL task before interrupting the graph.

    HITL is an expected business pause, not an error.
    """

    state_snapshot = json.dumps(
        state,
        default=str,
        ensure_ascii=False,
    )

    allowed_actions_json = json.dumps(
        allowed_actions or [],
        ensure_ascii=False,
    )

    lock = get_checkpoint_lock()

    with lock:

        connection = _get_hitl_connection()

        try:

            cursor = connection.execute(
                """
                INSERT INTO hitl_tasks (
                    run_id,
                    thread_id,
                    graph_name,
                    node_name,
                    task_type,
                    reason,
                    state_snapshot,
                    requested_action,
                    allowed_actions,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                """,
                (
                    run_id,
                    thread_id,
                    graph_name,
                    node_name,
                    task_type,
                    reason,
                    state_snapshot,
                    requested_action,
                    allowed_actions_json,
                ),
            )

            task_id = cursor.lastrowid

            connection.commit()

            if task_id is None:
                raise RuntimeError(
                    "Failed to create HITL task: "
                    "SQLite did not return a task id."
                )

            return int(task_id)

        finally:

            connection.close()


# ============================================================
# Request Human Decision
# ============================================================

def request_human_decision(
    payload: dict[str, Any],
) -> dict[str, Any]:
    """
    Pause graph execution and wait for human input.
    """

    decision = interrupt(
        payload
    )

    if not isinstance(
        decision,
        dict,
    ):
        raise ValueError(
            "Human decision must be a dictionary."
        )

    return decision


# ============================================================
# Resolve HITL Task
# ============================================================

def resolve_hitl_task(
    hitl_task_id: int,
    *,
    admin_id: str,
    decision: str,
    feedback: str | None = None,
) -> None:
    """
    Record the real admin decision.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = _get_hitl_connection()

        try:

            cursor = connection.execute(
                """
                UPDATE hitl_tasks

                SET
                    status = 'resolved',
                    admin_id = ?,
                    admin_decision = ?,
                    admin_feedback = ?,
                    updated_at = CURRENT_TIMESTAMP,
                    resolved_at = CURRENT_TIMESTAMP

                WHERE hitl_task_id = ?
                  AND status = 'pending'
                """,
                (
                    admin_id,
                    decision,
                    feedback,
                    hitl_task_id,
                ),
            )

            connection.commit()

            if cursor.rowcount == 0:
                raise ValueError(
                    f"HITL task {hitl_task_id} "
                    "does not exist or is already resolved."
                )

        finally:

            connection.close()


# ============================================================
# Get HITL Task
# ============================================================

def get_hitl_task(
    hitl_task_id: int,
) -> dict[str, Any] | None:
    """
    Retrieve a single HITL task.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = _get_hitl_connection()

        try:

            row = connection.execute(
                """
                SELECT *
                FROM hitl_tasks
                WHERE hitl_task_id = ?
                """,
                (
                    hitl_task_id,
                ),
            ).fetchone()

            if row is None:
                return None

            return dict(row)

        finally:

            connection.close()


# ============================================================
# Get Pending HITL Task
# ============================================================

def get_pending_hitl_task(
    *,
    thread_id: str,
    node_name: str | None = None,
) -> dict[str, Any] | None:
    """
    Return the latest pending HITL task for a thread.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = _get_hitl_connection()

        try:

            if node_name is None:

                row = connection.execute(
                    """
                    SELECT *
                    FROM hitl_tasks
                    WHERE thread_id = ?
                      AND status = 'pending'
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    (
                        thread_id,
                    ),
                ).fetchone()

            else:

                row = connection.execute(
                    """
                    SELECT *
                    FROM hitl_tasks
                    WHERE thread_id = ?
                      AND node_name = ?
                      AND status = 'pending'
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    (
                        thread_id,
                        node_name,
                    ),
                ).fetchone()

            if row is None:
                return None

            return dict(row)

        finally:

            connection.close()


# ============================================================
# List Pending HITL Tasks
# ============================================================

def list_pending_hitl_tasks() -> list[dict[str, Any]]:
    """
    Return HITL tasks waiting for admin action.
    """

    lock = get_checkpoint_lock()

    with lock:

        connection = _get_hitl_connection()

        try:

            rows = connection.execute(
                """
                SELECT *
                FROM hitl_tasks
                WHERE status = 'pending'
                ORDER BY created_at ASC
                """
            ).fetchall()

            return [
                dict(row)
                for row in rows
            ]

        finally:

            connection.close()