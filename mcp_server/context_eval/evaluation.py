import time
from collections import defaultdict
from context_eval.test_cases import TEST_CASES
from context_eval.strategies import (
    sliding_window,
    observation_masking,
    recursive_summarization,
    zone_based_pruning,
)


class ContextEvaluator:

    def __init__(self, test_cases):
        self.test_cases = test_cases

    # ========================================================
    # Token Counting
    # ========================================================

    @staticmethod
    def count_tokens(messages):

        return sum(
            len(
                str(message.get("content", "")).split()
            )
            for message in messages
        )

    # ========================================================
    # Input Tokens
    # ========================================================

    @staticmethod
    def count_input_tokens(messages):

        return sum(
            len(
                str(message.get("content", "")).split()
            )
            for message in messages
            if message.get("role") != "assistant"
        )

    # ========================================================
    # Output Tokens
    # ========================================================

    @staticmethod
    def count_output_tokens(messages):

        return sum(
            len(
                str(message.get("content", "")).split()
            )
            for message in messages
            if message.get("role") == "assistant"
        )

    # ========================================================
    # Accuracy
    # ========================================================

    @staticmethod
    def calculate_accuracy(
        messages,
        expected_answer
    ):

        conversation = " ".join(
            str(message.get("content", ""))
            for message in messages
        )

        return int(
            expected_answer.lower()
            in conversation.lower()
        )

    # ========================================================
    # Evaluate One Strategy
    # ========================================================

    def evaluate_strategy(
        self,
        strategy_name,
        strategy,
        messages,
        expected_answer,
        **kwargs
    ):

        start = time.perf_counter()

        pruned_messages = strategy(
            messages,
            **kwargs
        )

        latency = (
            time.perf_counter()
            - start
        )

        return {

            "Strategy":
                strategy_name,

            "Accuracy":
                self.calculate_accuracy(
                    pruned_messages,
                    expected_answer
                ),

            "InputTokens":
                self.count_input_tokens(
                    pruned_messages
                ),

            "OutputTokens":
                self.count_output_tokens(
                    pruned_messages
                ),

            "Latency":
                latency
        }

    # ========================================================
    # Run Evaluation
    # ========================================================

    def run(self):

        results = []

        strategies = [

            (
                "Sliding Window",
                sliding_window,
                {
                    "window_size": 20
                }
            ),

            (
                "Observation Masking",
                observation_masking,
                {
                    "keep_recent_tool_outputs": 3
                }
            ),

            (
                "Recursive Summarization",
                recursive_summarization,
                {
                    "chunk_size": 15,
                    "keep_recent": 5
                }
            ),

            (
                "Zone-Based Pruning",
                zone_based_pruning,
                {
                    "keep_initial": 2,
                    "keep_recent": 5
                }
            ),
        ]

        for test in self.test_cases:

            messages = test["messages"]

            expected = test[
                "expected_answer"
            ]

            for (
                name,
                strategy,
                kwargs
            ) in strategies:

                result = self.evaluate_strategy(
                    name,
                    strategy,
                    messages,
                    expected,
                    **kwargs
                )

                results.append(
                    result
                )

        return results

    # ========================================================
    # Summarize Results
    # ========================================================

    @staticmethod
    def summarize_results(results):

        summary = defaultdict(
            lambda: {
                "Accuracy": [],
                "InputTokens": [],
                "OutputTokens": [],
                "Latency": []
            }
        )

        for row in results:

            strategy = row["Strategy"]

            summary[strategy][
                "Accuracy"
            ].append(
                row["Accuracy"]
            )

            summary[strategy][
                "InputTokens"
            ].append(
                row["InputTokens"]
            )

            summary[strategy][
                "OutputTokens"
            ].append(
                row["OutputTokens"]
            )

            summary[strategy][
                "Latency"
            ].append(
                row["Latency"]
            )

        table = []

        for strategy, values in summary.items():

            table.append({

                "Strategy":
                    strategy,

                "Accuracy":
                    round(
                        sum(
                            values["Accuracy"]
                        )
                        /
                        len(
                            values["Accuracy"]
                        ),
                        2
                    ),

                "InputTokens":
                    round(
                        sum(
                            values["InputTokens"]
                        )
                        /
                        len(
                            values["InputTokens"]
                        ),
                        2
                    ),

                "OutputTokens":
                    round(
                        sum(
                            values["OutputTokens"]
                        )
                        /
                        len(
                            values["OutputTokens"]
                        ),
                        2
                    ),

                "Latency": (
                    sum(values["Latency"]) /
                    len(values["Latency"])
                ) * 1000
            })

        return table

    # ========================================================
    # Recommendation
    # ========================================================

    @staticmethod
    def recommend(summary_table):

        best = max(

            summary_table,

            key=lambda row: (

                row["Accuracy"],

                -(
                    row["InputTokens"]
                    +
                    row["OutputTokens"]
                ),

                -row["Latency"]

            )
        )

        return {

            "Recommended Strategy":
                best["Strategy"],

            "Justification":
                (
                    f"{best['Strategy']} achieved the "
                    f"highest average accuracy "
                    f"({best['Accuracy']}) while maintaining "
                    f"lower token usage "
                    f"({best['InputTokens']} input + "
                    f"{best['OutputTokens']} output tokens) "
                    f"and latency "
                    f"({best['Latency']} s)."
                )
        }

    # ========================================================
    # Print Final Table
    # ========================================================

    @staticmethod
    def print_table(summary_table):

        print()

        print(
            f"{'Strategy':30}"
            f"{'Allergy Detail':20}"
            f"{'Avg. Input Tokens':20}"
            f"{'Avg. Output Tokens':20}"
            f"{'Avg. Latency'}"
        )

        print(
            "-" * 106
        )

        for row in summary_table:

            accuracy = row["Accuracy"]

            recalled = (
                f"{accuracy * 10:.0f}/10"
            )

            print(
                f"{row['Strategy']:30}"
                f"{recalled:20}"
                f"{row['InputTokens']:<20.0f}"
                f"{row['OutputTokens']:<21.0f}"
                f"{row['Latency']:.2f} ms"
            )
# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    evaluator = ContextEvaluator(
        TEST_CASES
    )

    results = evaluator.run()

    summary = evaluator.summarize_results(
        results
    )

    evaluator.print_table(
        summary
    )

    print("\nRecommended Strategy:")

    recommendation = evaluator.recommend(
        summary
    )

    print(
        recommendation["Recommended Strategy"]
    )

    print(
        recommendation["Justification"]
    )