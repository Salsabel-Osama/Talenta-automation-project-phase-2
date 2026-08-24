from __future__ import annotations

import os
import sqlite3


# ============================================================
# Database Paths
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DB_PATH = os.path.join(
    BASE_DIR,
    "talenta.db",
)

SCHEMA_PATH = os.path.join(
    BASE_DIR,
    "schema.sql",
)

SEED_PATH = os.path.join(
    BASE_DIR,
    "seed_data.sql",
)


# ============================================================
# SQLite Configuration
# ============================================================

def configure_connection(
    conn: sqlite3.Connection,
) -> sqlite3.Connection:
    """
    Configure a SQLite connection for the shared Talenta
    application.

    The same database is shared by:

    - recruitment agents
    - state graphs
    - LangGraph checkpoints
    - HITL tasks
    - failure tickets
    - platform/admin services
    """

    # Return rows as dictionary-like sqlite3.Row objects.
    conn.row_factory = sqlite3.Row

    # Enforce foreign-key constraints.
    conn.execute(
        "PRAGMA foreign_keys = ON;"
    )

    # WAL allows readers and writers to work more safely
    # when multiple application components access the DB.
    conn.execute(
        "PRAGMA journal_mode = WAL;"
    )

    # Wait for a short period if another connection is
    # temporarily holding a SQLite lock.
    conn.execute(
        "PRAGMA busy_timeout = 5000;"
    )

    # Good balance between durability and performance.
    conn.execute(
        "PRAGMA synchronous = NORMAL;"
    )

    return conn


# ============================================================
# Database Connection
# ============================================================

def get_connection() -> sqlite3.Connection:
    """
    Return a configured connection to the shared Talenta DB.

    IMPORTANT:

    This function NEVER deletes the database.

    Persistent state such as:

    - LangGraph checkpoints
    - HITL tasks
    - failure tickets
    - graph execution state

    must survive process restarts.
    """

    os.makedirs(
        BASE_DIR,
        exist_ok=True,
    )

    conn = sqlite3.connect(
        DB_PATH,
        check_same_thread=False,
    )

    return configure_connection(
        conn
    )


# ============================================================
# Schema Initialization
# ============================================================

def initialize_schema(
    conn: sqlite3.Connection,
) -> None:
    """
    Create application tables if they do not already exist.

    This operation is safe to run on every application start
    because schema.sql uses CREATE TABLE IF NOT EXISTS.
    """

    if not os.path.exists(
        SCHEMA_PATH
    ):
        raise FileNotFoundError(
            f"Database schema not found: "
            f"{SCHEMA_PATH}"
        )

    with open(
        SCHEMA_PATH,
        "r",
        encoding="utf-8",
    ) as file:

        conn.executescript(
            file.read()
        )


# ============================================================
# Seed Database
# ============================================================

def seed_database(
    conn: sqlite3.Connection,
) -> None:
    """
    Seed the database only when the main Candidates table
    is empty.

    Existing application data is NEVER deleted or replaced.

    This is important because the database may already contain:

    - graph checkpoints
    - HITL tasks
    - failure tickets
    - application state
    - admin configuration
    """

    existing_candidates = conn.execute(
        """
        SELECT COUNT(*)
        FROM Candidates
        """
    ).fetchone()[0]

    if existing_candidates > 0:

        print(
            "Database already contains data. "
            "Skipping seed."
        )

        return

    if not os.path.exists(
        SEED_PATH
    ):
        raise FileNotFoundError(
            f"Database seed file not found: "
            f"{SEED_PATH}"
        )

    with open(
        SEED_PATH,
        "r",
        encoding="utf-8",
    ) as file:

        conn.executescript(
            file.read()
        )

    print(
        "Seed data loaded."
    )


# ============================================================
# Full Database Initialization
# ============================================================

def load_database() -> None:
    """
    Initialize the shared Talenta database.

    IMPORTANT:

    The previous implementation deleted talenta.db on every
    execution. That behavior is NOT allowed anymore.

    The database must survive:

    - process crashes
    - application restarts
    - graph interruptions
    - HITL pauses
    - failure recovery

    LangGraph's SqliteSaver is responsible for creating its
    own checkpoint tables through CheckpointManager.
    """

    database_exists = os.path.exists(
        DB_PATH
    )

    conn = get_connection()

    try:

        # ----------------------------------------------------
        # Application Schema
        # ----------------------------------------------------

        initialize_schema(
            conn
        )

        if not database_exists:

            print(
                "Created new Talenta database."
            )

        # ----------------------------------------------------
        # Seed Only When Empty
        # ----------------------------------------------------

        seed_database(
            conn
        )

        # ----------------------------------------------------
        # Commit
        # ----------------------------------------------------

        conn.commit()

        print(
            f"Database ready at: {DB_PATH}"
        )

    except Exception:

        # Never leave a partially applied transaction.
        conn.rollback()

        raise

    finally:

        conn.close()


# ============================================================
# Database Health Check
# ============================================================

def check_database() -> bool:
    """
    Verify that the shared database can be opened and queried.

    Returns True when the database is healthy.
    """

    conn = get_connection()

    try:

        conn.execute(
            "SELECT 1;"
        ).fetchone()

        return True

    finally:

        conn.close()


# ============================================================
# Script Entry Point
# ============================================================

if __name__ == "__main__":

    load_database()

    if check_database():

        print(
            "Database health check: OK"
        )