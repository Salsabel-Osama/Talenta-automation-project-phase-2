TEST_DATASET = [

    {
        "id": 1,

        "question":
            "What are the match score categories for candidate suitability?",

        "ground_truth":
            "90–100 is Excellent Match, 75–89 is Qualified Candidate, "
            "60–74 requires Manual HR Review, and below 60 is Reject.",

        "category":
            "Direct Fact Retrieval",

        "expected_architecture":
            "Naive RAG"
    },


    {
        "id": 2,

        "question":
            "According to policy HR-108, what conditions must be satisfied before an official offer letter can be generated?",

        "ground_truth":
            "All interviews must be completed, background verification must succeed, "
            "and HR Manager approval must be recorded.",

        "category":
            "Exact Identifier Retrieval",

        "expected_architecture":
            "Hybrid Search RAG"
    },


    {
        "id": 3,

        "question":
            "A candidate has completed all interviews and passed background verification, but the interview feedback is incomplete. Can an offer letter be generated, and which recruitment rules explain the decision?",

        "ground_truth":
            "No. An offer letter cannot be generated because all interview stages must be completed "
            "and required interviewer feedback must be submitted before a hiring decision. "
            "Incomplete evaluations require manual HR review, and offer letters require HR Manager approval.",

        "category":
            "Multi-Step / Multi-Document Retrieval",

        "expected_architecture":
            "Agentic RAG"
    }

]