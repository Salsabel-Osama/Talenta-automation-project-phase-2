from chromadb import PersistentClient

from rag.chunking import DocumentChunker
from rag.embedding import EmbeddingModel


class VectorDatabase:

    def __init__(self):

        self.client = PersistentClient(
            path="rag/chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="talenta_documents",
            metadata={
                "hnsw:space": "cosine"
            }
        )

        self.embedder = EmbeddingModel()

    # ======================================
    # Build Vector Database
    # ======================================

    def build_database(self):

        # Delete old collection to avoid duplicate chunks
        try:
            self.client.delete_collection(
                "talenta_documents"
            )
        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name="talenta_documents",
            metadata={
                "hnsw:space": "cosine"
            }
        )

        chunker = DocumentChunker()

        chunks = chunker.chunk_folder()

        if not chunks:
            print("No documents found to index.")
            return

        embedded_chunks = self.embedder.embed_documents(
            chunks
        )

        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for document, embedding in embedded_chunks:

            chunk_id = document.metadata.get("chunk_id")

            if not chunk_id:
                continue

            ids.append(chunk_id)

            documents.append(
                document.page_content
            )

            embeddings.append(embedding)

            metadatas.append(
                document.metadata
            )

        if not ids:
            print("No valid document chunks were generated.")
            return

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        print(
            f"Successfully indexed {len(ids)} chunks."
        )

    # ======================================
    # Retrieve Documents
    # ======================================

    def retrieve(
        self,
        query,
        top_k=5,
        metadata_filter=None,
    ):

        if not query or not query.strip():

            return {
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]],
            }

        top_k = max(1, int(top_k))

        # Check whether the collection contains documents
        collection_count = self.collection.count()

        if collection_count == 0:

            return {
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]],
            }

        # Do not request more documents than exist
        top_k = min(
            top_k,
            collection_count
        )

        query_embedding = self.embedder.embed_text(
            query
        )

        query_params = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
        }

        if metadata_filter:
            query_params["where"] = metadata_filter

        results = self.collection.query(
            **query_params
        )

        return {
            "documents": results.get(
                "documents",
                [[]]
            ),
            "metadatas": results.get(
                "metadatas",
                [[]]
            ),
            "distances": results.get(
                "distances",
                [[]]
            ),
        }


# ======================================
# Test
# ======================================

if __name__ == "__main__":

    db = VectorDatabase()

    db.build_database()

    results = db.retrieve(
        "How are candidates evaluated?",
        top_k=3,
    )

    print("=" * 60)

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, score in zip(
        documents,
        metadatas,
        distances,
    ):

        print(
            f"Similarity Score : {score}"
        )

        print(
            f"Metadata         : {meta}"
        )

        print("-" * 60)

        print(doc)

        print("=" * 60)