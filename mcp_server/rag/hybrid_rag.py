from typing import Any, Dict
from hybrid_search import HybridSearchRAG

class HybridRAGPipeline:
    def __init__(self, vector_db, documents, llm_client):
        self.retriever = HybridSearchRAG(vector_db=vector_db, documents=documents)
        self.llm_client = llm_client

    def answer_question(self, query: str) -> Dict[str, Any]:
        retrieved_docs = self.retriever.search(query, alpha=0.5)
        
        context_str = "\n\n".join([doc["content"] for doc in retrieved_docs])

        prompt = f"""Use the following retrieved context to answer the question accurately.
        
Context:
{context_str}

Question: {query}
Answer:"""

        response = self.llm_client.generate(prompt)

        return {
            "query": query,
            "response": response,
            "retrieved_context": retrieved_docs
        }