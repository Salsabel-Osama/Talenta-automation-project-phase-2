from __future__ import annotations

import os
import sqlite3
import threading
from typing import Any

from langgraph.checkpoint.sqlite import SqliteSaver


# ============================================================
# Database Path
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DB_DIR = os.path.join(
    BASE_DIR,
    "db",
)

DB_PATH = os.path.join(
    DB_DIR,
    "talenta.db",
)


# ============================================================
# Application Database Schema
# ============================================================

APPLICATION_SCHEMA = """
CREATE TABLE IF NOT EXISTS failure_tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT,

    error_type TEXT NOT NULL,

    error_message TEXT NOT NULL,

    state_snapshot TEXT,

    checkpoint_id INTEGER,

    status TEXT NOT NULL DEFAULT 'open',

    priority TEXT NOT NULL DEFAULT 'medium',

    assigned_to TEXT,

    resolution TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    resolved_at TEXT
);


CREATE INDEX IF NOT EXISTS idx_failure_tickets_thread
ON failure_tickets(thread_id);


CREATE INDEX IF NOT EXISTS idx_failure_tickets_status
ON failure_tickets(status);


CREATE INDEX IF NOT EXISTS idx_failure_tickets_graph
ON failure_tickets(graph_name);


CREATE TABLE IF NOT EXISTS hitl_tasks (
    hitl_task_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT NOT NULL,

    task_type TEXT NOT NULL,

    reason TEXT NOT NULL,

    state_snapshot TEXT,

    requested_action TEXT,

    allowed_actions TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    admin_id TEXT,

    admin_decision TEXT,

    admin_feedback TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    resolved_at TEXT
);


CREATE INDEX IF NOT EXISTS idx_hitl_tasks_thread
ON hitl_tasks(thread_id);


CREATE INDEX IF NOT EXISTS idx_hitl_tasks_status
ON hitl_tasks(status);


CREATE INDEX IF NOT EXISTS idx_hitl_tasks_thread_node_status
ON hitl_tasks(thread_id, node_name, status);


CREATE TABLE IF NOT EXISTS graph_runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'running',

    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    completed_at TEXT
);


CREATE INDEX IF NOT EXISTS idx_graph_runs_thread
ON graph_runs(thread_id);


CREATE INDEX IF NOT EXISTS idx_graph_runs_status
ON graph_runs(status);


CREATE TABLE IF NOT EXISTS graph_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT,

    event_type TEXT NOT NULL,

    event_data TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_graph_events_thread
ON graph_events(thread_id);


CREATE INDEX IF NOT EXISTS idx_graph_events_run
ON graph_events(run_id);
"""


# ============================================================
# Shared Durable Checkpoint Manager
# ============================================================

class CheckpointManager:
    """
    Shared durable SQLite manager.

    Responsibilities
    ----------------
    - LangGraph durable checkpoints.
    - Application persistence.
    - HITL tables.
    - Failure ticket tables.
    - Shared database lock.
    - Process-safe SQLite configuration.

    The LangGraph checkpointer keeps its own long-lived
    connection.

    Application-level operations use separate short-lived
    connections to the SAME database file.
    """

    def __init__(self) -> None:

        # ----------------------------------------------------
        # Ensure database directory exists
        # ----------------------------------------------------

        os.makedirs(
            DB_DIR,
            exist_ok=True,
        )

        # ----------------------------------------------------
        # Shared lock
        # ----------------------------------------------------

        self._lock = threading.RLock()

        # ----------------------------------------------------
        # Main LangGraph connection
        # ----------------------------------------------------

        self._connection = sqlite3.connect(
            DB_PATH,
            check_same_thread=False,
            timeout=30.0,
        )

        self._connection.row_factory = sqlite3.Row

        # ----------------------------------------------------
        # SQLite configuration
        # ----------------------------------------------------

        self._configure_connection(
            self._connection
        )

        # ----------------------------------------------------
        # LangGraph durable checkpointer
        # ----------------------------------------------------

        self._checkpointer = SqliteSaver(
            self._connection
        )

        # ----------------------------------------------------
        # Initialize all schemas
        # ----------------------------------------------------

        with self._lock:

            # LangGraph tables
            self._checkpointer.setup()

            # Application tables
            self._initialize_application_schema()

    # ========================================================
    # SQLite Configuration
    # ========================================================

    @staticmethod
    def _configure_connection(
        connection: sqlite3.Connection,
    ) -> None:
        """
        Configure a SQLite connection.
        """

        connection.execute(
            "PRAGMA foreign_keys = ON;"
        )

        connection.execute(
            "PRAGMA busy_timeout = 30000;"
        )

        connection.execute(
            "PRAGMA journal_mode = WAL;"
        )

        connection.execute(
            "PRAGMA synchronous = NORMAL;"
        )

    # ========================================================
    # Application Schema
    # ========================================================

    def _initialize_application_schema(self) -> None:
        """
        Create application-level tables if they do not exist.

        This is intentionally separate from LangGraph's
        SqliteSaver.setup().
        """

        self._connection.executescript(
            APPLICATION_SCHEMA
        )

        self._connection.commit()

    # ========================================================
    # Checkpointer
    # ========================================================

    def get_checkpointer(self) -> SqliteSaver:
        """
        Return the shared durable LangGraph checkpointer.
        """

        return self._checkpointer

    # ========================================================
    # Database Connection
    # ========================================================

    def get_connection(self) -> sqlite3.Connection:
        """
        Return the manager's main SQLite connection.

        Prefer dedicated connections for application-level
        operations when possible.
        """

        return self._connection

    # ========================================================
    # Dedicated Application Connection
    # ========================================================

    def create_application_connection(
        self,
    ) -> sqlite3.Connection:
        """
        Create a short-lived SQLite connection for application
        tables such as HITL and failure tickets.

        The connection points to the same talenta.db file.
        """

        connection = sqlite3.connect(
            DB_PATH,
            timeout=30.0,
        )

        connection.row_factory = sqlite3.Row

        self._configure_connection(
            connection
        )

        # Defensive schema check.
        #
        # Normally this already exists because __init__ creates
        # it, but this makes the function safe after DB recreation.
        with self._lock:

            connection.executescript(
                APPLICATION_SCHEMA
            )

            connection.commit()

        return connection

    # ========================================================
    # Database Path
    # ========================================================

    def get_database_path(self) -> str:
        """
        Return absolute database path.
        """

        return DB_PATH

    # ========================================================
    # Lock
    # ========================================================

    def get_lock(self) -> threading.RLock:
        """
        Return shared database lock.
        """

        return self._lock

    # ========================================================
    # Close
    # ========================================================

    def close(self) -> None:
        """
        Close the shared LangGraph connection.
        """

        with self._lock:

            if self._connection is not None:

                try:
                    self._connection.close()

                finally:
                    self._connection = None


# ============================================================
# Shared Singleton
# ============================================================

_checkpoint_manager = CheckpointManager()


# ============================================================
# Public API
# ============================================================

def get_checkpointer() -> SqliteSaver:
    """
    Return shared LangGraph checkpointer.
    """

    return (
        _checkpoint_manager
        .get_checkpointer()
    )


def get_checkpoint_connection() -> sqlite3.Connection:
    """
    Return the main checkpoint connection.
    """

    return (
        _checkpoint_manager
        .get_connection()
    )


def get_application_connection() -> sqlite3.Connection:
    """
    Return a dedicated application-level connection.

    Used by:
        - HITL
        - Failure tickets
        - Graph runs
        - Graph events
    """

    return (
        _checkpoint_manager
        .create_application_connection()
    )


def get_checkpoint_database_path() -> str:
    """
    Return shared database path.
    """

    return (
        _checkpoint_manager
        .get_database_path()
    )


def get_checkpoint_lock() -> threading.RLock:
    """
    Return shared SQLite lock.
    """

    return (
        _checkpoint_manager
        .get_lock()
    )


def close_checkpointer() -> None:
    """
    Close shared checkpoint database.
    """

    _checkpoint_manager.close()