import google.generativeai as genai

from agent.config import (
    GEMINI_API_KEY,
    MODEL_NAME
)


genai.configure(
    api_key=GEMINI_API_KEY
)


class SelfRAGVerifier:

    def __init__(self):

        self.model = genai.GenerativeModel(
            MODEL_NAME
        )


    def verify(
        self,
        question,
        context,
        answer
    ):

        if not context:

            return {
                "passed": False,
                "relevant": False,
                "supported": False,
                "reason": "No retrieved content."
            }


        prompt = f"""
You are a Self-RAG verification system.

Your job is to verify a generated answer before it reaches the user.

Question:
{question}

Retrieved Context:
{context}

Generated Answer:
{answer}

Perform two explicit checks.

1. RELEVANCE:
Is the retrieved context actually relevant to answering the question?

2. SUPPORT:
Is the generated answer completely supported by the retrieved context?

Do not use outside knowledge.

Return exactly:

RELEVANT: YES or NO
SUPPORTED: YES or NO
REASON: <short explanation>
"""


        try:

            response = self.model.generate_content(
                prompt
            )

            text = response.text.strip()


        except Exception as e:

            return {
                "passed": False,
                "relevant": False,
                "supported": False,
                "reason": f"Verification error: {e}"
            }


        relevant = False
        supported = False
        reason = ""


        for line in text.split("\n"):

            line = line.strip()


            if line.startswith("RELEVANT:"):

                value = line.replace(
                    "RELEVANT:",
                    ""
                ).strip().upper()

                relevant = value == "YES"


            elif line.startswith("SUPPORTED:"):

                value = line.replace(
                    "SUPPORTED:",
                    ""
                ).strip().upper()

                supported = value == "YES"


            elif line.startswith("REASON:"):

                reason = line.replace(
                    "REASON:",
                    ""
                ).strip()


        passed = relevant and supported


        return {
            "passed": passed,
            "relevant": relevant,
            "supported": supported,
            "reason": reason
        }
