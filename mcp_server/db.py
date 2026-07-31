import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "db", "talenta.db")


def get_connection() -> sqlite3.Connection:
    """Opens a new connection to the SQLite database for each call."""
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn