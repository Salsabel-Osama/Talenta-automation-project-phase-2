from copy import deepcopy


def tool_output(index: int):

    return {
        "role": "tool",
        "content": (
            f"""
Tool Output #{index}

Candidate ID: {1000 + index}
Skills:
Python
Java
Docker
Kubernetes
AWS
Git
Linux

Experience:
{index % 10 + 1} years

Projects:
Project A
Project B
Project C

Certificates:
AWS
Azure
Google Cloud

Status:
Processed successfully.
"""
        )
    }


def generate_tool_outputs(count: int):

    return [
        tool_output(i)
        for i in range(count)
    ]


TEST_CASES = [

    {
        "id": 1,

        "name": "Early Decision Buried",

        "description":
        "Important hiring decision appears early then disappears under heavy tool output.",

        "messages":

            [

                {
                    "role": "user",
                    "content":
                    "Evaluate Ahmed for Backend Engineer."
                },

                {
                    "role": "assistant",
                    "content":
                    "Ahmed rejected because experience is below minimum."
                }

            ]

            +

            generate_tool_outputs(120)

            +

            [

                {
                    "role": "user",
                    "content":
                    "Why was Ahmed rejected?"
                }

            ],

        "expected_answer":
        "experience is below minimum"

    },

    {
        "id": 2,

        "name": "Huge Tool Output",

        "description":
        "Conversation dominated by MCP tool outputs.",

        "messages":

            [

                {
                    "role": "user",
                    "content":
                    "Compare Sarah and Omar."
                }

            ]

            +

            generate_tool_outputs(150)

            +

            [

                {
                    "role": "assistant",
                    "content":
                    "Sarah has stronger Python experience."
                },

                {
                    "role": "user",
                    "content":
                    "Who has stronger Python skills?"
                }

            ],

        "expected_answer":
        "Sarah"

    },

    {
        "id": 3,

        "name": "Long Recruitment Planning",

        "description":
        "Long recruiter discussion before asking about original hiring criteria.",

        "messages":

            [

                {
                    "role": "user",
                    "content":
                    "Hire only candidates with Python Docker AWS."
                }

            ]

            +

            [

                {
                    "role": "assistant",
                    "content":
                    f"Discussion message {i}"
                }

                for i in range(80)

            ]

            +

            [

                {
                    "role": "user",
                    "content":
                    "What were the original hiring requirements?"
                }

            ],

        "expected_answer":
        "Python Docker AWS"

    },

    {
        "id": 4,

        "name": "Important Tool Output",

        "description":
        "Critical information exists only inside a tool response.",

        "messages":

            [

                {
                    "role": "tool",
                    "content":
                    "Candidate location updated to Germany."
                }

            ]

            +

            generate_tool_outputs(100)

            +

            [

                {
                    "role": "user",
                    "content":
                    "Where is the candidate located?"
                }

            ],

        "expected_answer":
        "Germany"

    },

    {
        "id": 5,

        "name": "Real Recruitment Workflow",

        "description":
        "End-to-end Talenta recruitment workflow with heavy MCP activity.",

        "messages":

            [

                {
                    "role": "user",
                    "content":
                    "Open Backend Engineer position."
                },

                {
                    "role": "assistant",
                    "content":
                    "Job opened successfully."
                }

            ]

            +

            generate_tool_outputs(180)

            +

            [

                {
                    "role": "assistant",
                    "content":
                    "Final decision: Sara selected because match score is 92%."
                },

                {
                    "role": "user",
                    "content":
                    "Who was selected?"
                }

            ],

        "expected_answer":
        "Sara"

    }

]