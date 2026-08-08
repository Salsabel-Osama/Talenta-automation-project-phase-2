import time
import google.generativeai as genai

from rag.vector_db import VectorDatabase

from agent.config import (
    GEMINI_API_KEY,
    MODEL_NAME
)


genai.configure(
    api_key=GEMINI_API_KEY
)


class AgenticRAG:

    def __init__(self):

        self.vector_db = VectorDatabase()

        self.model = genai.GenerativeModel(
            MODEL_NAME
        )

        # Maximum number of retrieval cycles
        self.max_iterations = 3

    # ==========================================
    # LLM Generation
    # ==========================================
    def generate(self, prompt: str) -> str:

        try:

            response = self.model.generate_content(
                prompt
            )

            if not response or not response.text:

                return ""

            return response.text.strip()

        except Exception as e:

            print(
                f"[Agentic RAG] Generation error: {e}"
            )

            return ""
    # ==========================================
    # Initial Reasoning
    # ==========================================

    def reason(self, question: str):

        prompt = f"""
You are an intelligent retrieval planning agent for Talenta Partners Group.

Your job is to decide what information is needed from the company
knowledge base to answer the recruiter's question.

Question:
{question}

Generate:

1. The goal of the retrieval.
2. The first search query that should be used.

The search query should target the relevant company policies,
handbooks, playbooks, or workflow documents.

Return exactly:

Goal: <retrieval goal>
Search Query: <first search query>
"""

        response = self.generate(prompt)

        goal = ""
        query = ""

        for line in response.split("\n"):

            line = line.strip()

            if line.startswith("Goal:"):

                goal = line.replace(
                    "Goal:",
                    "",
                    1
                ).strip()

            elif line.startswith("Search Query:"):

                query = line.replace(
                    "Search Query:",
                    "",
                    1
                ).strip()

        # Safety fallback
        if not query:
            query = question

        return {
            "question": question,
            "goal": goal,
            "query": query,
            "iteration": 0,
            "evidence": [],
            "retrieved_queries": [],
            "reasoning_history": [
                {
                    "step": "reason",
                    "goal": goal,
                    "query": query
                }
            ]
        }

    # ==========================================
    # Retrieve
    # ==========================================

    def retrieve(self, query: str):

        results = self.vector_db.retrieve(
            query=query,
            top_k=5
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

        return documents

    # ==========================================
    # Observe Retrieved Evidence
    # ==========================================
    def observe(
        self,
        state,
        documents
    ):

        if documents:

            existing = set(
                state["evidence"]
            )

            for document in documents:

                if document not in existing:

                    state["evidence"].append(
                        document
                    )

                    existing.add(
                        document
                    )

        state["retrieved_queries"].append(
            state["query"]
        )

        state["reasoning_history"].append(
            {
                "step": "observe",
                "query": state["query"],
                "documents_found": len(documents),
                "total_unique_evidence": len(
                    state["evidence"]
                ),
            }
        )

        return state

    # ==========================================
    # Reason Again
    # ==========================================

    def reason_again(self, state):

        context = "\n\n".join(
            state["evidence"]
        )

        prompt = f"""
You are the reasoning component of an Agentic RAG system.

Your task is to determine whether another retrieval step is necessary.

Question:
{state["question"]}

Retrieved Information:
{context}

Rules:

1. Use ONLY the retrieved information.
2. If the information is sufficient to answer the question,
   return COMPLETE.
3. If important information is missing,
   return NEED_MORE.
4. If NEED_MORE, generate a NEW and more specific search query.
5. Do not use outside knowledge.
6. Do not return COMPLETE if the evidence does not directly
   support the answer.

Return exactly:

Decision: COMPLETE or NEED_MORE
New Query: <query if more information is needed>
"""

        response = self.generate(prompt)

        decision = "NEED_MORE"
        new_query = ""

        for line in response.split("\n"):

            line = line.strip()

            if line.startswith("Decision:"):

                decision = line.replace(
                    "Decision:",
                    "",
                    1
                ).strip().upper()

            elif line.startswith("New Query:"):

                new_query = line.replace(
                    "New Query:",
                    "",
                    1
                ).strip()

        # Normalize unexpected LLM output
        if decision not in {
            "COMPLETE",
            "NEED_MORE"
        }:
            decision = "NEED_MORE"

        state["reasoning_history"].append(
            {
                "step": "reason_again",
                "decision": decision,
                "new_query": new_query
            }
        )

        # Retrieval is sufficient
        if decision == "COMPLETE":

            return True, state

        # Fallback query
        if not new_query:

            new_query = state["question"]

        # Prevent repeating the exact same query
        if new_query.strip().lower() in [
            q.strip().lower()
            for q in state["retrieved_queries"]
        ]:

            return True, state

        state["query"] = new_query

        return False, state

    # ==========================================
    # Final Answer
    # ==========================================
    def answer(self, state):

        context = "\n\n".join(
            state["evidence"]
        )

        if not context.strip():

            return (
                "I don't have enough information."
            )

        prompt = f"""
    You are Talenta AI Recruitment Assistant.

    Answer the recruiter's question ONLY using
    the retrieved Talenta Partners Group documents.

    Question:
    {state["question"]}

    Retrieved Evidence:
    {context}

    Rules:

    1. Use ONLY the retrieved evidence.
    2. Do NOT use outside knowledge.
    3. Do NOT invent policies, rules, or procedures.
    4. Do NOT contradict the evidence.
    5. If the evidence is insufficient, say exactly:

    I don't have enough information.

    6. Give a direct answer to the question.
    7. When possible, mention the specific policy,
    rule, or document evidence supporting the answer.
    8. For multi-condition questions, address EVERY
    condition explicitly.

    Answer:
    """

        return self.generate(
            prompt
        )
    # ==========================================
    # Main Agentic RAG Loop
    # ==========================================

    def run(self, question: str):

        start_time = time.time()

        # --------------------------------------
        # Step 1: Reason
        # --------------------------------------

        state = self.reason(
            question
        )

        # --------------------------------------
        # Step 2:
        # Retrieve → Observe → Reason Again
        # --------------------------------------

        while (
            state["iteration"]
            < self.max_iterations
        ):

            documents = self.retrieve(
                state["query"]
            )

            state = self.observe(
                state,
                documents
            )

            state["iteration"] += 1

            finished, state = self.reason_again(
                state
            )

            if finished:

                break

        # --------------------------------------
        # Step 3: Final Answer
        # --------------------------------------

        response = self.answer(
            state
        )

        latency = time.time() - start_time

        return {
            "query": question,
            "response": response,
            "retrieved_context": state["evidence"],
            "iterations": state["iteration"],
            "reasoning_history": state[
                "reasoning_history"
            ],
            "latency": latency
        }


# ==========================================
# Test
# ==========================================

if __name__ == "__main__":

    rag = AgenticRAG()

    result = rag.run(
        "Can recruiters send offer letters?"
    )

    print("=" * 60)
    print("QUESTION")
    print("=" * 60)

    print(
        result["query"]
    )

    print("\n")

    print("=" * 60)
    print("ANSWER")
    print("=" * 60)

    print(
        result["response"]
    )

    print("\n")

    print("=" * 60)
    print("ITERATIONS")
    print("=" * 60)

    print(
        result["iterations"]
    )

    print("\n")

    print("=" * 60)
    print("REASONING HISTORY")
    print("=" * 60)

    for step in result[
        "reasoning_history"
    ]:

        print(step)