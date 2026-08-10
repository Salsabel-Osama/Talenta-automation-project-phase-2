import os
import time

from dotenv import load_dotenv
from tabulate import tabulate
from mistralai.client import Mistral

load_dotenv()

from retrieval_eval.test_questions import TEST_DATASET

from retrieval_eval.metrics import (
    count_tokens,
    evaluate_accuracy_with_llm
)


# ============================================================
# Mistral LLM Evaluator
# ============================================================

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

MISTRAL_EVALUATOR_MODEL = os.getenv(
    "MISTRAL_EVALUATOR_MODEL",
    "mistral-small-2603"
)

if not MISTRAL_API_KEY:
    raise RuntimeError(
        "MISTRAL_API_KEY is not set. "
        "Add it to your .env file."
    )


mistral_client = Mistral(
    api_key=MISTRAL_API_KEY
)


class MistralEvaluator:
    """
    LLM-based evaluator.

    Mistral is used ONLY as the judge.
    The RAG architectures remain unchanged.
    """

    def generate(self, prompt: str) -> str:

        response = mistral_client.chat.complete(
            model=MISTRAL_EVALUATOR_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.0,
            max_tokens=50
        )

        if not response:
            return ""

        if not response.choices:
            return ""

        message = response.choices[0].message

        if not message:
            return ""

        content = message.content

        if content is None:
            return ""

        # Mistral can sometimes return structured content
        if isinstance(content, list):

            parts = []

            for item in content:

                if isinstance(item, dict):

                    text = item.get("text")

                    if text:
                        parts.append(str(text))

                else:

                    parts.append(str(item))

            content = " ".join(parts)

        return str(content).strip()


llm_evaluator = MistralEvaluator()


# ============================================================
# Extract Generated Answer
# ============================================================

def extract_answer(output) -> str:

    if output is None:
        return ""

    if isinstance(output, dict):

        answer = output.get("answer")

        if answer is not None:
            return str(answer).strip()

        answer = output.get("response")

        if answer is not None:
            return str(answer).strip()

        answer = output.get("generated_answer")

        if answer is not None:
            return str(answer).strip()

        return ""

    return str(output).strip()


# ============================================================
# Extract Retrieved Context
# ============================================================

def extract_context(output):

    if not isinstance(output, dict):
        return []

    return output.get(
        "retrieved_context",
        output.get("context", [])
    )


# ============================================================
# Run Evaluation
# ============================================================

def run_evaluation():

    # IMPORTANT:
    # Import RAG architectures only when actually running
    # the complete evaluation.
    #
    # This prevents Chroma/OpenTelemetry from breaking
    # a simple Mistral evaluator test.

    from mcp_server.rag.naive_rag import run_naive_rag
    from mcp_server.rag.hybrid_rag import run_hybrid_rag
    from mcp_server.rag.agentic_rag import run_agentic_rag

    ARCHITECTURES = {

        "Naive RAG":
            run_naive_rag,

        "Hybrid Search RAG":
            run_hybrid_rag,

        "Agentic RAG":
            run_agentic_rag
    }

    results = {
        arch_name: {
            "accuracy": [],
            "latency": [],
            "tokens": [],
            "questions": []
        }
        for arch_name in ARCHITECTURES
    }

    print(
        "\nStarting Retrieval Evaluation...\n"
    )

    # ========================================================
    # Architecture Loop
    # ========================================================

    for arch_name, run_fn in ARCHITECTURES.items():

        print(
            "\n"
            + "=" * 80
        )

        print(
            f"Testing Architecture: {arch_name}"
        )

        print(
            "=" * 80
        )

        for item in TEST_DATASET:

            question = str(
                item["question"]
            ).strip()

            ground_truth = str(
                item["ground_truth"]
            ).strip()
            expected_architecture = str(
                item.get("expected_architecture", "")
            ).strip()

            category = str(
                item.get("category", "")
            ).strip()
            # =================================================
            # Run RAG
            # =================================================

            start_time = time.perf_counter()

            try:

                output = run_fn(question)

                generation_error = None

            except Exception as e:

                output = ""

                generation_error = e

                print(
                    f"\nERROR - {arch_name} - "
                    f"Q{item['id']}: {e}"
                )

            end_time = time.perf_counter()

            latency = end_time - start_time

            # =================================================
            # Extract Answer / Context
            # =================================================

            generated_text = extract_answer(output)

            retrieved_context = extract_context(output)

            # =================================================
            # Debug
            # =================================================

            print(
                "\n"
                + "-" * 80
            )

            print(
                f"Architecture : {arch_name}"
            )

            print(
                f"Question     : {question}"
            )

            print(
                f"Ground Truth : {ground_truth}"
            )
            print(
                f"Category     : {category}"
            )

            print(
                f"Expected     : {expected_architecture}"
            )

            print(
                f"Generated    : {generated_text}"
            )

            if retrieved_context:

                print("\nRetrieved Context:")

                if isinstance(
                    retrieved_context,
                    list
                ):

                    for i, context in enumerate(
                        retrieved_context,
                        start=1
                    ):

                        print(
                            f"\n[{i}] {context}"
                        )

                else:

                    print(retrieved_context)

            print("-" * 80)

            # =================================================
            # Tokens
            # =================================================

            tokens = count_tokens(
                question
                + "\n"
                + generated_text
            )

            # =================================================
            # Accuracy
            # =================================================

            if generation_error is not None:

                print(
                    "[Accuracy] RAG generation failed."
                )

                accuracy = None

            elif not generated_text:

                print(
                    "[Accuracy] Empty generated answer."
                )

                accuracy = 0.0

            else:

                try:

                    accuracy = evaluate_accuracy_with_llm(
                        llm_evaluator,
                        question,
                        ground_truth,
                        generated_text
                    )

                except Exception as e:

                    print(
                        "[Accuracy] LLM evaluator failed:",
                        e
                    )

                    accuracy = None
            # =================================================
            # Expected Architecture Check
            # =================================================

            expected_architecture = item.get(
                "expected_architecture"
            )

            architecture_match = (
                expected_architecture == arch_name
            )

            print(
                f"Expected Architecture : {expected_architecture}"
            )

            print(
                f"Architecture Match    : {architecture_match}"
            )

            # =================================================
            # Store
            # =================================================

            results[
                arch_name
            ]["accuracy"].append(
                accuracy
            )

            results[
                arch_name
            ]["latency"].append(
                latency
            )

            results[
                arch_name
            ]["tokens"].append(
                tokens
            )

            # =================================================
            # Question Result
            # =================================================

            print(
                f"\nQ{item['id']} RESULT"
            )

            if accuracy is None:

                print(
                    "Accuracy : N/A "
                    "(LLM evaluation failed)"
                )

            else:

                print(
                    f"Accuracy : {accuracy:.2f} "
                    f"({accuracy * 100:.1f}%)"
                )

            print(
                f"Latency  : {latency:.2f}s"
            )

            print(
                f"Tokens   : {tokens}"
            )

    # ========================================================
    # Summary
    # ========================================================

    summary_table = []

    for arch_name, metrics in results.items():

        valid_accuracy = [

            value
            for value in metrics["accuracy"]
            if value is not None

        ]

        latency_values = metrics["latency"]

        token_values = metrics["tokens"]

        if valid_accuracy:

            avg_accuracy = (
                sum(valid_accuracy)
                / len(valid_accuracy)
            )

            accuracy_display = (
                f"{avg_accuracy * 100:.1f}%"
            )

        else:

            accuracy_display = "N/A"

        if latency_values:

            avg_latency = (
                sum(latency_values)
                / len(latency_values)
            )

        else:

            avg_latency = 0.0

        if token_values:

            avg_tokens = (
                sum(token_values)
                / len(token_values)
            )

        else:

            avg_tokens = 0.0

        summary_table.append(
            [
                arch_name,
                accuracy_display,
                f"{avg_latency:.2f}s",
                f"{avg_tokens:.0f}"
            ]
        )

    # ========================================================
    # Final Results
    # ========================================================

    print(
        "\n"
        + "=" * 80
    )

    print(
        "RETRIEVAL EVALUATION RESULTS"
    )

    print(
        "=" * 80
    )

    headers = [
        "Architecture",
        "Avg Accuracy",
        "Avg Latency (s)",
        "Avg Tokens / Query"
    ]

    print(
        tabulate(
            summary_table,
            headers=headers,
            tablefmt="github"
        )
    )

    print("=" * 80)

    return results


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    run_evaluation()