import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = "models/gemini-2.5-pro"

TEMPERATURE = 0.2

MAX_OUTPUT_TOKENS = 1024