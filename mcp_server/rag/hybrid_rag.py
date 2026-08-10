
from typing import Any, Dict



from hybrid_search import HybridSearchRAG
from vector_db import VectorDatabase
import os

from mistralai.client import Mistral
from dotenv import load_dotenv

load_dotenv()



# ============================================================
#  Client
# ============================================================



class MistralClient:

    def __init__(self):

        api_key = os.getenv("MISTRAL_API_KEY")

        if not api_key:
            raise RuntimeError(
                "MISTRAL_API_KEY is not set. "
                "Add it to your .env file."
            )

        self.client = Mistral(
            api_key=api_key
        )

        self.model = os.getenv(
            "MISTRAL_RAG_MODEL",
            "mistral-small-2603"
        )

    def generate(self, prompt: str) -> str:

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
                max_tokens=300
            )

            if not response:
                return "I don't have enough information."

            if not response.choices:
                return "I don't have enough information."

            message = response.choices[0].message

            if not message:
                return "I don't have enough information."

            content = message.content

            if content is None:
                return "I don't have enough information."

            return str(content).strip()

        except Exception as e:

            print(
                f"[Mistral] Generation Error: {e}"
            )

            return "I don't have enough information."

# ============================================================
# Hybrid RAG Pipeline
# ============================================================

class HybridRAGPipeline:

    def __init__(
        self,
        vector_db,
        documents,
        llm_client
    ):

        self.retriever = HybridSearchRAG(
            vector_db=vector_db,
            documents=documents
        )

        self.llm_client = llm_client

    # ========================================================
    # Answer Question
    # ========================================================

    def answer_question(
        self,
        query: str
    ) -> Dict[str, Any]:

        retrieved_docs = self.retriever.search(
            query,
            alpha=0.5
        )

        if not retrieved_docs:

            return {
                "query": query,
                "answer": "I don't have enough information.",
                "retrieved_context": []
            }

        context_str = "\n\n".join(
            [
                doc["content"]
                for doc in retrieved_docs
            ]
        )

        prompt = f"""
You are Talenta AI Recruitment Assistant.

Answer the question using ONLY the retrieved
Talenta recruitment documents.

Do not use outside knowledge.
Do not invent company policies.

If the retrieved context does not contain
enough information, answer:

I don't have enough information.

Retrieved Context:
{context_str}

Question:
{query}

Answer:
"""

        response = self.llm_client.generate(
            prompt
        )

        return {
            "query": query,
            "answer": response,
            "retrieved_context": retrieved_docs
        }


# ============================================================
# Helper: Load Documents
# ============================================================

def _load_documents(vector_db):

    results = vector_db.collection.get(
        include=["documents", "metadatas"]
    )

    documents = results.get(
        "documents",
        []
    )

    metadatas = results.get(
        "metadatas",
        []
    )

    loaded_documents = []

    for index, content in enumerate(documents):

        metadata = (
            metadatas[index]
            if index < len(metadatas)
            else {}
        )

        loaded_documents.append(
            {
                "content": content,
                "metadata": metadata
            }
        )

    return loaded_documents


# ============================================================
# Public Function Used By Evaluator
# ============================================================

def run_hybrid_rag(
    question: str,
    top_k: int = 3
):

    vector_db = VectorDatabase()

    documents = _load_documents(
        vector_db
    )

    if not documents:

        return {
            "answer": "I don't have enough information.",
            "retrieved_context": []
        }

    llm_client = MistralClient()

    pipeline = HybridRAGPipeline(
        vector_db=vector_db,
        documents=documents,
        llm_client=llm_client
    )

    # Match the evaluator's expected top_k
    pipeline.retriever.top_k = top_k

    return pipeline.answer_question(
        query=question
    )


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    question = "Can recruiters send offer letters?"

    result = run_hybrid_rag(
        question=question,
        top_k=3
    )

    print("=" * 60)
    print("QUESTION")
    print("=" * 60)

    print(question)

    print("\n" + "=" * 60)
    print("ANSWER")
    print("=" * 60)

    print(
        result["answer"]
    )

    print("\n" + "=" * 60)
    print("RETRIEVED DOCUMENTS")
    print("=" * 60)

    for document in result["retrieved_context"]:

        print(
            f"\nHybrid Score: "
            f"{document.get('hybrid_score', 0)}"
        )

        print(
            document.get(
                "content",
                ""
            )[:500]
        )

