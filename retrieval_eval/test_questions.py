TEST_DATASET = [

    # ============================================================
    # NAIVE RAG - Direct Fact Retrieval
    # ============================================================
    {
        "id": 1,
        "question":
            "What are the match score categories for candidate suitability?",

        "ground_truth":
            "90–100 is Excellent Match, 75–89 is Qualified Candidate, "
            "60–74 requires Manual HR Review, and below 60 is Reject.",

        "required_facts": [
            "90-100",
            "Excellent Match",
            "75-89",
            "Qualified Candidate",
            "60-74",
            "Manual HR Review",
            "below 60",
            "Reject"
        ],

        "category": "Direct Fact Retrieval",
        "expected_architecture": "Naive RAG"
    },

    {
        "id": 2,
        "question":
            "What factors are used to calculate the candidate match score?",

        "ground_truth":
            "The match score is calculated using technical skills, "
            "years of experience, education, and job requirements.",

        "required_facts": [
            "Technical skills",
            "Years of experience",
            "Education",
            "Job requirements"
        ],

        "category": "Direct Fact Retrieval",
        "expected_architecture": "Naive RAG"
    },

    {
        "id": 3,
        "question":
            "What happens when a candidate has a match score below 60?",

        "ground_truth":
            "A candidate with a match score below 60 is rejected.",

        "required_facts": [
            "below 60",
            "Reject"
        ],

        "category": "Direct Fact Retrieval",
        "expected_architecture": "Naive RAG"
    },


    # ============================================================
    # HYBRID SEARCH RAG - Exact Identifier Retrieval
    # ============================================================

    {
        "id": 4,
        "question":
            "According to policy HR-108, what conditions must be satisfied "
            "before an official offer letter can be generated?",

        "ground_truth":
            "All interviews must be completed, background verification must "
            "succeed, and HR Manager approval must be recorded.",

        "required_facts": [
            "HR-108",
            "All interviews",
            "completed",
            "background verification",
            "succeed",
            "HR Manager approval",
            "recorded"
        ],

        "category": "Exact Identifier Retrieval",
        "expected_architecture": "Hybrid Search RAG"
    },

    {
        "id": 5,
        "question":
            "What does policy HR-102 say about education requirements?",

        "ground_truth":
            "Candidates should have an educational background related to "
            "the position. Examples include Computer Science for Software "
            "Engineer and Information Systems for Data Analyst.",

        "required_facts": [
            "HR-102",
            "educational background",
            "related to the position",
            "Computer Science",
            "Software Engineer",
            "Information Systems",
            "Data Analyst"
        ],

        "category": "Exact Identifier Retrieval",
        "expected_architecture": "Hybrid Search RAG"
    },

    {
        "id": 6,
        "question":
            "According to WF-103, how is a candidate match score interpreted?",

        "ground_truth":
            "90–100 is Excellent Match, 75–89 is Qualified, "
            "60–74 is Manual Review, and below 60 is Reject.",

        "required_facts": [
            "WF-103",
            "90-100",
            "Excellent Match",
            "75-89",
            "Qualified",
            "60-74",
            "Manual Review",
            "Below 60",
            "Reject"
        ],

        "category": "Exact Identifier Retrieval",
        "expected_architecture": "Hybrid Search RAG"
    },


    # ============================================================
    # AGENTIC RAG - Multi-Step / Multi-Document
    # ============================================================

    {
        "id": 7,
        "question":
            "A candidate has completed all interviews and passed background "
            "verification, but the interview feedback is incomplete. Can an "
            "offer letter be generated, and which recruitment rules explain "
            "the decision?",

        "ground_truth":
            "No. An offer letter cannot be generated because all interview "
            "stages must be completed and required interviewer feedback must "
            "be submitted before a hiring decision. Incomplete evaluations "
            "require manual HR review, and offer letters require HR Manager approval.",

        "required_facts": [
            "cannot be generated",
            "interview feedback",
            "incomplete",
            "interviews",
            "completed",
            "interviewer feedback",
            "hiring decision",
            "HR Manager approval"
        ],

        "category": "Multi-Step / Multi-Document Retrieval",
        "expected_architecture": "Agentic RAG"
    },

    {
        "id": 8,
        "question":
            "A candidate has a borderline match score and their education "
            "does not clearly match the role. What should the recruiter do?",

        "ground_truth":
            "The recruiter should escalate the application for HR Manager "
            "review because borderline match scores and unclear education "
            "matches require escalation.",

        "required_facts": [
            "borderline",
            "match score",
            "education",
            "does not clearly match",
            "escalate",
            "HR Managers"
        ],

        "category": "Multi-Step / Multi-Document Retrieval",
        "expected_architecture": "Agentic RAG"
    },

    {
        "id": 9,
        "question":
            "An applicant has completed the interviews but background "
            "verification has not succeeded. Can the recruiter generate "
            "an official offer letter?",

        "ground_truth":
            "No. An official offer letter cannot be generated because "
            "background verification must succeed and HR Manager approval "
            "must be recorded.",

        "required_facts": [
            "cannot",
            "offer letter",
            "background verification",
            "succeed",
            "HR Manager approval",
            "recorded"
        ],

        "category": "Multi-Step / Multi-Document Retrieval",
        "expected_architecture": "Agentic RAG"
    }
]