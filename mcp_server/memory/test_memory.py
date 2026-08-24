from mcp_server.memory.router import (
    PromoteOrDropRouter,
    ManagedShortTermMemory,
)

from mcp_server.memory.episodic import EpisodicMemory
from mcp_server.memory.semantic import SemanticMemory
from mcp_server.memory.consolidation import ConsolidationEngine
from mcp_server.memory.scratchpad import Scratchpad

def print_title(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def main():

    # -------------------------------------------------
    # Initialize Memories
    # -------------------------------------------------

    episodic = EpisodicMemory()

    semantic = SemanticMemory()

    router = PromoteOrDropRouter(
        episodic_memory=episodic
    )

    stm = ManagedShortTermMemory(
        router=router,
        max_turns=5
    )

    scratchpad = Scratchpad()

    consolidator = ConsolidationEngine(
        episodic_store=episodic,
        semantic_store=semantic
    )

    # -------------------------------------------------
    # Scratchpad
    # -------------------------------------------------

    scratchpad.set_plan(
        "Evaluate Backend Candidate"
    )

    scratchpad.set_subgoal(
        "Review interview results"
    )

    scratchpad.set_working_state(
        "Interview Finished"
    )

    print_title("SCRATCHPAD")

    print(scratchpad)

    # -------------------------------------------------
    # Conversation
    # -------------------------------------------------

    conversation = [

        ("user",
         "Candidate Alice applied for Backend Developer."),

        ("assistant",
         "Application recorded."),

        ("user",
         "Candidate has Python and SQL skills."),

        ("assistant",
         "Skills stored."),

        ("user",
         "Candidate status is Accepted."),

        ("assistant",
         "Status updated."),

        ("user",
         "Candidate preferred role is Backend Developer."),

        ("assistant",
         "Preference stored."),

        ("user",
         "Candidate status changed to Rejected after HR review."),

        ("assistant",
         "Status updated.")
    ]

    print_title("ADDING TO SHORT TERM MEMORY")

    for role, message in conversation:

        print(f"{role.upper()} -> {message}")

        stm.add(role, message)

    # -------------------------------------------------
    # STM
    # -------------------------------------------------

    print_title("SHORT TERM MEMORY")

    for msg in stm.get_context():

        print(msg)

    # -------------------------------------------------
    # Router Logs
    # -------------------------------------------------

    print_title("PROMOTE OR DROP LOG")

    for log in router.get_grader_logs():

        print(log)

    # -------------------------------------------------
    # Episodic Memory
    # -------------------------------------------------

    print_title("EPISODIC MEMORY")

    for episode in episodic.get_all():

        print(f"Episode : {episode.episode_id}")

        print(f"Task    : {episode.task}")

        print(f"Summary : {episode.summary}")

        print(f"Outcome : {episode.outcome}")

        print("-" * 50)

    # -------------------------------------------------
    # Consolidation
    # -------------------------------------------------

    print_title("RUN CONSOLIDATION")

    consolidator.consolidate()

    # -------------------------------------------------
    # Semantic Memory
    # -------------------------------------------------

    print_title("SEMANTIC MEMORY")

    consolidator.show_semantic_memory()


    def test_router_promotes_important_message():
        episodic = EpisodicMemory()

        router = PromoteOrDropRouter(
            episodic_memory=episodic
        )

        stm = ManagedShortTermMemory(
            router=router,
            max_turns=1,
        )

        stm.add(
            "user",
            "Candidate Alice has been accepted for the Backend Developer role.",
        )

        stm.add(
            "assistant",
            "Okay.",
        )

        assert episodic.size() == 1

        logs = router.get_grader_logs()

        assert logs[0]["decision"] == "promote"
        assert "retention" in logs[0]["reason"].lower()


    def test_router_drops_unimportant_message():
        episodic = EpisodicMemory()

        router = PromoteOrDropRouter(
            episodic_memory=episodic
       )

        stm = ManagedShortTermMemory(
            router=router,
            max_turns=1,
        )

        stm.add("assistant", "Okay.")

        stm.add("assistant", "Done.")

        assert episodic.size() == 0

        logs = router.get_grader_logs()

        assert logs[0]["decision"] == "drop"


if __name__ == "__main__":

    main()