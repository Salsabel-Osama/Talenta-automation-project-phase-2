import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "talenta.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
SEED_PATH = os.path.join(BASE_DIR, "seed_data.sql")


def load_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("Removed old database file.")

    conn = sqlite3.connect(DB_PATH)

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    print("Schema created.")

    with open(SEED_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    print("Seed data loaded.")

    conn.commit()
    conn.close()
    print(f"Database ready at {DB_PATH}")


if __name__ == "__main__":
    load_database()