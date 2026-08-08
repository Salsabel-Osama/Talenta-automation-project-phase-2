import tiktoken


# ============================================================
# Token Counter
# ============================================================

encoder = tiktoken.get_encoding(
    "cl100k_base"
)


def count_tokens(text: str) -> int:

    if not text:
        return 0

    return len(
        encoder.encode(text)
    )


# ============================================================
# Accuracy Evaluation
# ============================================================

def evaluate_accuracy_with_llm(
    llm_client,
    question: str,
    ground_truth: str,
    generated_answer: str
) -> float:

    eval_prompt = f"""
You are an expert evaluator for a Retrieval-Augmented Generation system.

Evaluate the generated answer against the ground truth.

Question:
{question}

Ground Truth:
{ground_truth}

Generated Answer:
{generated_answer}

Evaluation Rules:

1. Give a score between 0.0 and 1.0.
2. 1.0 means the generated answer is fully correct.
3. 0.5 means the answer is partially correct.
4. 0.0 means the answer is incorrect or does not answer the question.
5. Do not give credit for information that contradicts the ground truth.
6. Ignore differences in wording.
7. Focus on factual correctness.

Return ONLY the numeric score.

Example:
0.85
"""

    try:

        response = llm_client.generate(
            eval_prompt
        )

        score = float(
            response.strip()
        )

        return min(
            max(score, 0.0),
            1.0
        )

    except Exception as e:

        print(
            f"Accuracy evaluation error: {e}"
        )

        return 0.0