from langchain_google_genai import GoogleGenerativeAIEmbeddings

from agent.config import GEMINI_API_KEY


class EmbeddingModel:

    def __init__(self):

        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=GEMINI_API_KEY,
        )

    # ======================================
    # Embed One Text
    # ======================================

    def embed_text(self, text: str):

        return self.embedding_model.embed_query(text)

    # ======================================
    # Embed Multiple Chunks
    # ======================================

    def embed_documents(self, documents):

        texts = [doc.page_content for doc in documents]

        embeddings = self.embedding_model.embed_documents(
            texts
        )

        return list(zip(documents, embeddings))


# ======================================
# Test
# ======================================

if __name__ == "__main__":

    from chunking import DocumentChunker

    chunker = DocumentChunker()

    chunks = chunker.chunk_folder()

    embedder = EmbeddingModel()

    embedded_chunks = embedder.embed_documents(
        chunks
    )

    print("=" * 60)
    print("Chunks:", len(chunks))
    print("Embeddings:", len(embedded_chunks))

    if embedded_chunks:
        print(
            "Embedding Dimension:",
            len(embedded_chunks[0][1])
        )
