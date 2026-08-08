import time
from tabulate import tabulate

import google.generativeai as genai

from retrieval_eval.test_questions import TEST_DATASET
from retrieval_eval.metrics import (
    count_tokens,
    evaluate_accuracy_with_llm
)

from mcp_server.rag.naive_rag import run_naive_rag
from mcp_server.rag.hybrid_rag import run_hybrid_rag
from mcp_server.rag.agentic_rag import run_agentic_rag

from config import (
    GEMINI_API_KEY,
    MODEL_NAME,
    TEMPERATURE,
    MAX_OUTPUT_TOKENS
)


# ============================================================
# Gemini Evaluator
# ============================================================

genai.configure(api_key=GEMINI_API_KEY)

evaluator_model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": TEMPERATURE,
        "max_output_tokens": MAX_OUTPUT_TOKENS
    }
)


class GeminiEvaluator:

    def generate(self, prompt: str):
        return evaluator_model.generate_content(prompt)


llm_evaluator = GeminiEvaluator()


# ============================================================
# RAG Architectures
# ============================================================

ARCHITECTURES = {
    "Naive RAG": run_naive_rag,
    "Hybrid Search RAG": run_hybrid_rag,
    "Agentic RAG": run_agentic_rag
}


# ============================================================
# Evaluation
# ============================================================

def run_evaluation():

    results = {
        arch: {
            "accuracy": [],
            "latency": [],
            "tokens": []
        }
        for arch in ARCHITECTURES
    }

    print("🚀 Starting Retrieval Evaluation...\n")

    for arch_name, run_fn in ARCHITECTURES.items():

        print(f"Testing Architecture: {arch_name}...")

        for item in TEST_DATASET:

            question = item["question"]
            ground_truth = item["ground_truth"]

            # --------------------------------------------
            # Run RAG
            # --------------------------------------------

            start_time = time.perf_counter()

            try:
                output = run_fn(question)

            except Exception as e:
                print(
                    f"Error running {arch_name} "
                    f"for question {item['id']}: {e}"
                )
                output = ""

            end_time = time.perf_counter()

            latency = end_time - start_time

            # --------------------------------------------
            # Extract Answer
            # --------------------------------------------

            if isinstance(output, dict):
                generated_text = output.get("answer", "")
            else:
                generated_text = str(output)

            # --------------------------------------------
            # Token Count
            # --------------------------------------------

            tokens = count_tokens(
                question + generated_text
            )

            # --------------------------------------------
            # LLM Accuracy Evaluation
            # --------------------------------------------

            accuracy = evaluate_accuracy_with_llm(
                llm_evaluator,
                question,
                ground_truth,
                generated_text
            )

            # --------------------------------------------
            # Store Metrics
            # --------------------------------------------

            results[arch_name]["latency"].append(latency)
            results[arch_name]["tokens"].append(tokens)
            results[arch_name]["accuracy"].append(accuracy)

            print(
                f"  Q{item['id']}: "
                f"Accuracy={accuracy:.2f}, "
                f"Latency={latency:.2f}s, "
                f"Tokens={tokens}"
            )

        print()

    # ========================================================
    # Summary
    # ========================================================

    summary_table = []

    for arch_name, metrics in results.items():

        avg_accuracy = (
            sum(metrics["accuracy"])
            / len(metrics["accuracy"])
        )

        avg_latency = (
            sum(metrics["latency"])
            / len(metrics["latency"])
        )

        avg_tokens = (
            sum(metrics["tokens"])
            / len(metrics["tokens"])
        )

        summary_table.append([
            arch_name,
            f"{avg_accuracy * 100:.1f}%",
            f"{avg_latency:.2f}s",
            f"{int(avg_tokens)}"
        ])

    # ========================================================
    # Print Results
    # ========================================================

    headers = [
        "Architecture",
        "Avg Accuracy",
        "Avg Latency (s)",
        "Avg Tokens / Query"
    ]

    print(
        "\n================== "
        "Retrieval Evaluation Results "
        "=================="
    )

    print(
        tabulate(
            summary_table,
            headers=headers,
            tablefmt="github"
        )
    )


if __name__ == "__main__":
    run_evaluation()