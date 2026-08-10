import re
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
        encoder.encode(str(text))
    )


# ============================================================
# Extract LLM Score
# ============================================================

def _extract_score(text: str) -> float:

    if not text:
        raise ValueError(
            "Empty evaluator response"
        )

    text = str(text).strip()

    # --------------------------------------------------------
    # Preferred format:
    #
    # FINAL_SCORE: 1.0
    # --------------------------------------------------------

    match = re.search(
        r"FINAL_SCORE\s*:\s*(0(?:\.\d+)?|1(?:\.0+)?)",
        text,
        re.IGNORECASE
    )

    if match:

        score = float(
            match.group(1)
        )

        return min(
            max(score, 0.0),
            1.0
        )

    # --------------------------------------------------------
    # Fallback:
    #
    # 1.0
    # Score: 0.75
    # 0.5/1
    # --------------------------------------------------------

    match = re.search(
        r"(?<!\d)(0(?:\.\d+)?|1(?:\.0+)?)(?!\d)",
        text
    )

    if not match:

        raise ValueError(
            "Could not extract score from "
            f"evaluator response: {text!r}"
        )

    score = float(
        match.group(1)
    )

    return min(
        max(score, 0.0),
        1.0
    )


# ============================================================
# LLM Accuracy Evaluation
# ============================================================

def evaluate_accuracy_with_llm(
    llm_client,
    question: str,
    ground_truth: str,
    generated_answer: str
) -> float:

    question = str(
        question or ""
    ).strip()

    ground_truth = str(
        ground_truth or ""
    ).strip()

    generated_answer = str(
        generated_answer or ""
    ).strip()

    # --------------------------------------------------------
    # Empty answer
    # --------------------------------------------------------

    if not generated_answer:

        print(
            "[Accuracy] Empty generated answer -> 0.0"
        )

        return 0.0

    # --------------------------------------------------------
    # LLM Evaluation Prompt
    # --------------------------------------------------------

    eval_prompt = f"""
You are an expert evaluator judging a RAG answer.

Your task is to evaluate ONLY the factual correctness
of the Generated Answer against the Ground Truth.

Question:
{question}

Ground Truth:
{ground_truth}

Generated Answer:
{generated_answer}

Scoring:

1.0 = Fully correct.
0.75 = Mostly correct, only a minor omission.
0.5 = Partially correct.
0.25 = Mostly incorrect, but contains a small correct part.
0.0 = Incorrect, irrelevant, or does not answer the question.

Rules:

- Compare meaning, not exact wording.
- Do not require the same sentence structure.
- Do not penalize concise answers.
Check every required condition and every important fact
in the Ground Truth.

For multi-step or multi-condition questions:
- Missing one major required condition means the answer
  cannot receive 1.0.
- Missing multiple required conditions should receive
  0.5 or lower depending on completeness.
- A correct answer to only one part of a multi-part question
  is not fully correct.
- If the question has multiple required conditions,
  verify all of them.
- Do not give credit to unsupported or contradictory claims.
- The answer must address the actual Question.
- Use ONLY the information provided in the Ground Truth
  and Generated Answer.
- This is a semantic/factual evaluation, not a keyword match.
Do not reward an answer merely because it contains keywords
from the Ground Truth. The facts must be correctly connected
to the question.
You MUST return exactly one line.

The line MUST have this format:

FINAL_SCORE: X

where X is exactly one of:

0.0
0.25
0.5
0.75
1.0

Do not return explanations.
Do not return markdown.
Do not return any other text.

FINAL_SCORE:
""".strip()

    # --------------------------------------------------------
    # Call LLM
    # --------------------------------------------------------

    try:

        response = llm_client.generate(
            eval_prompt
        )

        print(
            "[Accuracy] Raw evaluator response:",
            repr(response)
        )

        # ----------------------------------------------------
        # Parse LLM score
        # ----------------------------------------------------

        score = _extract_score(
            response
        )

        print(
            f"[Accuracy] Parsed LLM score: {score:.2f}"
        )

        return score

    except Exception as e:

        print(
            "[Accuracy] Evaluation error:",
            e
        )

        # IMPORTANT:
        # None means evaluator failed.
        # It must NOT become fake 0% accuracy.

        raise
