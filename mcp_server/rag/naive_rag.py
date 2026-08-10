import os

from dotenv import load_dotenv
from mistralai.client import Mistral

from self_rag import SelfRAGVerifier
from vector_db import VectorDatabase

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv(
    "MISTRAL_RAG_MODEL",
    "mistral-small-2603"
)

if not MISTRAL_API_KEY:
    raise RuntimeError(
        "MISTRAL_API_KEY is not set."
    )

mistral_client = Mistral(
    api_key=MISTRAL_API_KEY
)
class NaiveRAG:

    def __init__(self):

        self.vector_db = VectorDatabase()

      
        self.verifier = SelfRAGVerifier()

    # ==========================================
    # Retrieve Documents
    # ==========================================

    def retrieve(
        self,
        question: str,
        top_k: int = 5,
        metadata_filter=None
    ):

        return self.vector_db.retrieve(
            query=question,
            top_k=top_k,
            metadata_filter=metadata_filter
        )

    # ==========================================
    # Build Retrieved Context
    # ==========================================

    def retrieve_context(
        self,
        question: str,
        top_k: int = 5,
        metadata_filter=None
    ):

        results = self.retrieve(
            question=question,
            top_k=top_k,
            metadata_filter=metadata_filter
        )

        documents = results.get(
            "documents",
            []
        )

        # Chroma returns:
        # [["document 1", "document 2", ...]]

        if documents and isinstance(
            documents[0],
            list
        ):

            documents = documents[0]

        if not documents:

            return ""

        return "\n\n".join(
            documents
        )

    # ==========================================
    # Build Prompt
    # ==========================================

    def build_prompt(
        self,
        context: str,
        question: str
    ):

        return f"""
You are Talenta AI Recruitment Assistant.

Your task is to answer recruiter questions ONLY using
the retrieved Talenta Partners Group documents.

Rules:

1. Use ONLY the retrieved context.
2. Do NOT use outside knowledge.
3. Do NOT invent company policies, hiring rules, or procedures.
4. Do NOT contradict the retrieved documents.
5. If the context does not contain enough information
   to answer the question, reply exactly:

I don't have enough information.

6. Keep the answer concise and factual.

==================================================
Retrieved Context
==================================================

{context}

==================================================
Recruiter Question
==================================================

{question}

==================================================
Answer
==================================================
"""

    # ==========================================
    # Generate Answer
    # ==========================================

    def generate_answer(
        self,
        prompt: str
    ):

        try:

            response = mistral_client.chat.complete(
                model=MISTRAL_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.0,
                max_tokens=300
            )

            if not response:
                return "I don't have enough information."

            if not response.choices:
                return "I don't have enough information."

            content = response.choices[0].message.content

            if not content:
                return "I don't have enough information."

            return str(content).strip()

        except Exception as e:

            print(
                f"Mistral Generation Error: {e}"
            )

            return (
                "I don't have enough information."
            )
    # ==========================================
    # Answer Question
    # ==========================================

    def answer(
        self,
        question: str,
        top_k: int = 5,
        metadata_filter=None
    ):

        # --------------------------------------
        # Step 1: Retrieve
        # --------------------------------------

        context = self.retrieve_context(
            question=question,
            top_k=top_k,
            metadata_filter=metadata_filter
        )

        # --------------------------------------
        # No Retrieved Context
        # --------------------------------------

        if not context:

            return {
                "question": question,
                "context": "",
                "answer": (
                    "I don't have enough information."
                ),
                "verification": {
                    "passed": False,
                    "relevant": False,
                    "supported": False,
                    "reason": "No retrieved context."
                }
            }

        # --------------------------------------
        # Step 2: Generate
        # --------------------------------------

        prompt = self.build_prompt(
            context=context,
            question=question
        )

        generated_answer = self.generate_answer(
            prompt
        )

        # --------------------------------------
        # Step 3: Self-RAG Verification
        # --------------------------------------

        verification = self.verifier.verify(
            question=question,
            context=context,
            answer=generated_answer
        )

        # --------------------------------------
        # Step 4: Reject Unsupported Answer
        # --------------------------------------

        if not verification["passed"]:

            return {
                "question": question,
                "context": context,
                "answer": (
                    "I don't have enough information."
                ),
                "verification": verification
            }

        # --------------------------------------
        # Verified Answer
        # --------------------------------------

        return {
            "question": question,
            "context": context,
            "answer": generated_answer,
            "verification": verification
        }

def run_naive_rag(question: str, top_k: int = 5):
    rag = NaiveRAG()

    result = rag.answer(
        question=question,
        top_k=top_k
    )

    return result["answer"]
# ==========================================
# Test
# ==========================================

if __name__ == "__main__":

    rag = NaiveRAG()

    result = rag.answer(
        "Can recruiters send offer letters?"
    )

    print("=" * 70)
    print("QUESTION")
    print("=" * 70)

    print(
        result["question"]
    )

    print("\n")

    print("=" * 70)
    print("RETRIEVED CONTEXT")
    print("=" * 70)

    print(
        result["context"]
    )

    print("\n")

    print("=" * 70)
    print("ANSWER")
    print("=" * 70)

    print(
        result["answer"]
    )

    print("\n")

    print("=" * 70)
    print("VERIFICATION")
    print("=" * 70)

    print(
        result["verification"]
    )