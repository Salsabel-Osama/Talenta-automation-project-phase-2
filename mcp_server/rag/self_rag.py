from typing import Optional, Dict, Any

from chromadb import PersistentClient

from rag.chunking import DocumentChunker
from rag.embedding import EmbeddingModel


class VectorDatabase:

    COLLECTION_NAME = "talenta_documents"
    DB_PATH = "rag/chroma_db"

    def __init__(self):

        self.client = PersistentClient(
            path=self.DB_PATH
        )

        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={
                "hnsw:space": "cosine"
            }
        )

        self.embedder = EmbeddingModel()

    # ==================================================
    # Build Vector Database
    # ==================================================

    def build_database(self):

        # Remove previous collection to avoid
        # duplicate or outdated chunks.
        try:

            self.client.delete_collection(
                self.COLLECTION_NAME
            )

        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={
                "hnsw:space": "cosine"
            }
        )

        chunker = DocumentChunker()

        chunks = chunker.chunk_folder()

        if not chunks:

            print(
                "No document chunks were found."
            )

            return

        embedded_chunks = self.embedder.embed_documents(
            chunks
        )

        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for document, embedding in embedded_chunks:

            chunk_id = document.metadata.get(
                "chunk_id"
            )

            if not chunk_id:

                raise ValueError(
                    "Every document chunk must have a chunk_id."
                )

            ids.append(
                str(chunk_id)
            )

            documents.append(
                document.page_content
            )

            embeddings.append(
                embedding
            )

            metadatas.append(
                document.metadata
            )

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        print(
            f"Successfully indexed {len(ids)} chunks."
        )

    # ==================================================
    # Retrieve Documents
    # ==================================================

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None
    ):

        if not query or not query.strip():

            return {
                "documents": [],
                "metadatas": [],
                "distances": []
            }

        # Prevent requesting more results
        # than the collection contains.
        collection_count = self.collection.count()

        if collection_count == 0:

            return {
                "documents": [],
                "metadatas": [],
                "distances": []
            }

        top_k = min(
            max(top_k, 1),
            collection_count
        )

        query_embedding = self.embedder.embed_text(
            query
        )

        query_params = {
            "query_embeddings": [query_embedding],
            "n_results": top_k
        }

        if metadata_filter:

            query_params["where"] = metadata_filter

        results = self.collection.query(
            **query_params
        )

        documents = results.get(
            "documents",
            [[]]
        )

        metadatas = results.get(
            "metadatas",
            [[]]
        )

        distances = results.get(
            "distances",
            [[]]
        )

        return {
            "documents": documents[0] if documents else [],
            "metadatas": metadatas[0] if metadatas else [],
            "distances": distances[0] if distances else []
        }


# ==================================================
# Test
# ==================================================

if __name__ == "__main__":

    db = VectorDatabase()

    print("=" * 60)
    print("BUILDING VECTOR DATABASE")
    print("=" * 60)

    db.build_database()

    print("\n")

    print("=" * 60)
    print("TEST RETRIEVAL")
    print("=" * 60)

    results = db.retrieve(
        query="Can recruiters send offer letters?",
        top_k=3
    )

    for index, (
        document,
        metadata,
        distance
    ) in enumerate(
        zip(
            results["documents"],
            results["metadatas"],
            results["distances"]
        ),
        start=1
    ):

        print(f"\nResult {index}")
        print("-" * 60)

        print(
            f"Distance: {distance}"
        )

        print(
            f"Metadata: {metadata}"
        )

        print(
            document
        )