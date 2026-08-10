
import os

from dotenv import load_dotenv
from mistralai.client import Mistral


load_dotenv()


# ============================================================
# Mistral Client
# ============================================================

MISTRAL_API_KEY = os.getenv(
    "MISTRAL_API_KEY"
)

MISTRAL_MODEL = os.getenv(
    "MISTRAL_RAG_MODEL",
    "mistral-small-2603"
)


if not MISTRAL_API_KEY:

    raise RuntimeError(
        "MISTRAL_API_KEY is not set. "
        "Add it to your .env file."
    )


mistral_client = Mistral(
    api_key=MISTRAL_API_KEY
)


# ============================================================
# Self-RAG Verifier
# ============================================================

class SelfRAGVerifier:

    def __init__(self):

        self.client = mistral_client

        self.model = MISTRAL_MODEL


    # ========================================================
    # Mistral Generation
    # ========================================================

    def generate(
        self,
        prompt: str
    ) -> str:

        try:

            response = self.client.chat.complete(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.0,
                max_tokens=150
            )

            if not response:

                return ""

            if not response.choices:

                return ""

            message = response.choices[0].message

            if not message:

                return ""

            content = message.content

            if content is None:

                return ""

            return str(
                content
            ).strip()

        except Exception as e:

            print(
                f"[Self-RAG] Mistral error: {e}"
            )

            return ""


    # ========================================================
    # Verify
    # ========================================================

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
REASON:
"""


        text = self.generate(
            prompt
        )


        if not text:

            return {
                "passed": False,
                "relevant": False,
                "supported": False,
                "reason": "Verification returned an empty response."
            }


        relevant = False

        supported = False

        reason = ""


        for line in text.split("\n"):

            line = line.strip()


            if line.startswith(
                "RELEVANT:"
            ):

                value = line.replace(
                    "RELEVANT:",
                    "",
                    1
                ).strip().upper()

                relevant = (
                    value == "YES"
                )


            elif line.startswith(
                "SUPPORTED:"
            ):

                value = line.replace(
                    "SUPPORTED:",
                    "",
                    1
                ).strip().upper()

                supported = (
                    value == "YES"
                )


            elif line.startswith(
                "REASON:"
            ):

                reason = line.replace(
                    "REASON:",
                    "",
                    1
                ).strip()


        passed = (
            relevant
            and supported
        )


        return {
            "passed": passed,
            "relevant": relevant,
            "supported": supported,
            "reason": reason
        }

