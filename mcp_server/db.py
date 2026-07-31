import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        conn = pyodbc.connect(
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_DATABASE')};"
            "Trusted_Connection=yes;"
        )
        return conn

    except pyodbc.Error as e:
        print("Database connection failed.")
        print(e)
        return None
    
#To test connection
# if __name__ == "__main__":

#     conn = get_connection()

#     if conn:
#         print("Database connected successfully!")

#         cursor = conn.cursor()

#         cursor.execute("SELECT COUNT(*) FROM Candidates")

#         count = cursor.fetchone()[0]

#         print(f"Candidates table contains {count} records.")

#         conn.close()

#     else:
#         print("Connection failed.")