from typing import List, Dict, Any

from rank_bm25 import BM25Okapi


class HybridSearchRAG:

    def __init__(
        self,
        vector_db,
        documents: List[Dict[str, Any]],
        top_k: int = 3
    ):

        
        self.vector_db = vector_db
        self.documents = documents
        self.top_k = top_k

        # ======================================
        # BM25 Corpus
        # ======================================

        self.corpus_tokens = [
            doc["content"].lower().split()
            for doc in self.documents
        ]

        self.bm25 = BM25Okapi(
            self.corpus_tokens
        )

    # ======================================
    # Normalize Scores
    # ======================================

    def _normalize_scores(
        self,
        scores: List[float]
    ) -> List[float]:

        if not scores:
            return []

        min_score = min(scores)
        max_score = max(scores)

        if max_score == min_score:

            return [
                1.0
                for _ in scores
            ]

        return [
            (score - min_score)
            / (max_score - min_score)
            for score in scores
        ]

    # ======================================
    # Hybrid Search
    # ======================================

    def search(
        self,
        query: str,
        alpha: float = 0.5
    ) -> List[Dict[str, Any]]:

        if not query or not query.strip():
            return []

        if not self.documents:
            return []

        # Keep alpha between 0 and 1
        alpha = min(
            max(alpha, 0.0),
            1.0
        )

        # ==================================
        # 1. BM25 Retrieval
        # ==================================

        tokenized_query = (
            query.lower().split()
        )

        bm25_scores = self.bm25.get_scores(
            tokenized_query
        )

        bm25_normalized = (
            self._normalize_scores(
                bm25_scores.tolist()
            )
        )

        # ==================================
        # 2. Vector Retrieval
        # ==================================

        vector_results = self.vector_db.retrieve(
            query=query,
            top_k=len(self.documents)
        )

        vector_documents = vector_results.get(
            "documents",
            []
        )

        vector_metadatas = vector_results.get(
            "metadatas",
            []
        )

        vector_distances = vector_results.get(
            "distances",
            []
        )

        # ==================================
        # Chroma returns documents ordered
        # by similarity.
        #
        # We map every returned document to
        # its original document index using
        # the content.
        # ==================================

        vector_score_map = {}

        for index, document in enumerate(
            vector_documents
        ):

            if index >= len(vector_distances):
                continue

            distance = vector_distances[index]

            # Chroma cosine distance:
            # smaller distance = better result
            #
            # Convert it to similarity.
            similarity = 1.0 - distance

            vector_score_map[
                document
            ] = similarity

        vector_raw_scores = []

        for document in self.documents:

            content = document["content"]

            vector_raw_scores.append(
                vector_score_map.get(
                    content,
                    0.0
                )
            )

        vector_normalized = (
            self._normalize_scores(
                vector_raw_scores
            )
        )

        # ==================================
        # 3. Combine Scores
        # ==================================

        hybrid_results = []

        for index, document in enumerate(
            self.documents
        ):

            vector_score = (
                vector_normalized[index]
            )

            bm25_score = (
                bm25_normalized[index]
            )

            hybrid_score = (
                alpha * vector_score
                +
                (1.0 - alpha) * bm25_score
            )

            result = dict(document)

            result["hybrid_score"] = round(
                hybrid_score,
                4
            )

            result["vector_score"] = round(
                vector_score,
                4
            )

            result["bm25_score"] = round(
                bm25_score,
                4
            )

            hybrid_results.append(
                result
            )

        # ==================================
        # 4. Sort by Hybrid Score
        # ==================================

        hybrid_results.sort(
            key=lambda item:
                item["hybrid_score"],
            reverse=True
        )

        return hybrid_results[
            :self.top_k
        ]