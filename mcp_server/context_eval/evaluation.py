import time
from collections import defaultdict

from strategies import (
    sliding_window,
    observation_masking,
    recursive_summarization,
    zone_based_pruning,
)


class ContextEvaluator:

    def __init__(self, test_cases):
        self.test_cases = test_cases

    @staticmethod
    def count_tokens(messages):

        return sum(
            len(message["content"].split())
            for message in messages
        )

    @staticmethod
    def calculate_accuracy(messages, expected_answer):

        conversation = " ".join(
            message["content"]
            for message in messages
        )

        return int(
            expected_answer.lower()
            in conversation.lower()
        )

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

        latency = time.perf_counter() - start

        return {
            "Strategy": strategy_name,
            "Accuracy": self.calculate_accuracy(
                pruned_messages,
                expected_answer
            ),
            "Tokens": self.count_tokens(
                pruned_messages
            ),
            "Latency": latency
        }

    def run(self):

        results = []

        strategies = [
            (
                "Sliding Window",
                sliding_window,
                {"window_size": 20}
            ),
            (
                "Observation Masking",
                observation_masking,
                {"keep_recent_tool_outputs": 3}
            ),
            (
                "Recursive Summarization",
                recursive_summarization,
                {"chunk_size": 15, "keep_recent": 5}
            ),
            (
                "Zone-Based Pruning",
                zone_based_pruning,
                {"keep_initial": 2, "keep_recent": 5}
            ),
        ]
        for test in self.test_cases:

            messages = test["messages"]
            expected = test["expected_answer"]

            for name, strategy, kwargs in strategies:

                result = self.evaluate_strategy(
                    name,
                    strategy,
                    messages,
                    expected,
                    **kwargs
                )

                results.append(result)

        return results

    @staticmethod
    def summarize_results(results):

        summary = defaultdict(
            lambda: {
                "Accuracy": [],
                "Tokens": [],
                "Latency": []
            }
        )

        for row in results:

            summary[row["Strategy"]]["Accuracy"].append(
                row["Accuracy"]
            )

            summary[row["Strategy"]]["Tokens"].append(
                row["Tokens"]
            )

            summary[row["Strategy"]]["Latency"].append(
                row["Latency"]
            )

        table = []

        for strategy, values in summary.items():

            table.append({

                "Strategy": strategy,

                "Accuracy": round(
                    sum(values["Accuracy"]) /
                    len(values["Accuracy"]),
                    2
                ),

                "Tokens": round(
                    sum(values["Tokens"]) /
                    len(values["Tokens"]),
                    2
                ),

                "Latency": round(
                    sum(values["Latency"]) /
                    len(values["Latency"]),
                    6
                )

            })

        return table

    @staticmethod
    def recommend(summary_table):

        best = max(

            summary_table,

            key=lambda row: (

                row["Accuracy"],
                -row["Tokens"],
                -row["Latency"]

            )

        )

        return {

            "Recommended Strategy": best["Strategy"],

            "Justification":
                f"{best['Strategy']} achieved the highest average "
                f"accuracy ({best['Accuracy']}) while maintaining "
                f"lower token usage ({best['Tokens']}) and latency "
                f"({best['Latency']} s) across the evaluation."

        }

    @staticmethod
    def print_table(summary_table):

        print(
            f"{'Strategy':30}"
            f"{'Accuracy':12}"
            f"{'Tokens':12}"
            f"{'Latency'}"
        )

        print("-" * 72)

        for row in summary_table:

            print(
                f"{row['Strategy']:30}"
                f"{row['Accuracy']:<12}"
                f"{row['Tokens']:<12}"
                f"{row['Latency']}"
            )