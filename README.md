# Talenta Automation Project

## Project Overview

**Talenta Partners Group** is a recruitment and staffing agency that connects qualified candidates with client companies across technology, finance, healthcare, and administration.

Recruiters work with large amounts of structured and unstructured information, including:

* Candidate profiles and CVs.
* Candidate skills and experience.
* Job requirements.
* Application history.
* Interview evaluations.
* Hiring decisions.
* Recruitment policies and guidelines.

The project introduces an **AI Recruitment Assistant** that helps recruiters search, evaluate, compare, and manage candidate information while maintaining controlled access to sensitive recruitment data.

The project evolved in two connected phases:

```text
PHASE 2
Secure Data Access
        │
        ▼
MCP Server + Recruitment Database
        │
        ▼
Realistic Recruitment Workflows
        │
        ▼
Problems Discovered
        │
        ├──────────────► Long Context
        │
        └──────────────► Missing Knowledge Retrieval
                         │
                         ▼
PHASE 3
Memory + Context Management + RAG
```

The two phases use the **same Talenta project, repository, recruitment database, and MCP server**. Phase 3 extends the Phase 2 system rather than creating a separate application.

---

# Phase 2 — Secure Recruitment Data Access

## Problem

Recruiters need to work with sensitive recruitment information such as candidate profiles, applications, interviews, hiring decisions, and operational data.

Allowing an AI model to communicate directly with the recruitment database would create security and control problems.

The system therefore uses an **MCP-based architecture** to provide the AI assistant with controlled access to recruitment data.

## Architecture

```text
Recruiter
    │
    ▼
AI Agent
    │
    ▼
MCP Client
    │
    ▼
MCP Server
    │
    ▼
Validated MCP Tools
    │
    ▼
Recruitment Database
```

The MCP Server acts as the security and data-access layer.

It provides:

* Authentication and authorization.
* Controlled access to recruitment data.
* Input validation.
* Protected write operations.
* Human confirmation for sensitive actions.
* Dynamic tool availability.
* Read-only access to recruitment policies and resources.
* MCP capability negotiation.
* Notifications.
* Elicitation.
* Sampling.
* Resources.
* Prompt templates.
* Progress tracking.
* Defensive tool design.

During development, the system uses **STDIO transport** between the AI Agent and MCP Server.

## Recruitment Workflow

A realistic recruitment workflow can involve several operations:

```text
Candidate Search
      ↓
Candidate Details
      ↓
Skills Lookup
      ↓
Job Requirements
      ↓
Application History
      ↓
Interview Evaluation
      ↓
Policy Check
      ↓
Candidate Matching
      ↓
Hiring Decision
```

Each operation can produce additional tool output and conversation history.

This worked well for individual operations, but longer workflows exposed two important limitations.

---

# From Phase 2 to Phase 3

## Problems Discovered

### 1. Context Management Problem

During long recruitment workflows, the conversation can become dominated by MCP tool outputs.

Important information may appear early in the conversation and become buried under later tool results.

For example:

```text
Original Hiring Requirement
        ↓
Candidate Search
        ↓
Candidate Details
        ↓
Skills Lookup
        ↓
Interview Data
        ↓
Many MCP Tool Outputs
        ↓
Recruiter asks about original requirement
```

The information still exists somewhere in the conversation, but keeping the entire history active becomes inefficient.

This creates the need to answer:

> **What information should remain in the active context, and how can unnecessary historical context be reduced without losing important recruitment information?**

---

### 2. Long-Term Memory Problem

Not every useful piece of information should remain inside the active conversation.

Some information represents important events that should survive after the session.

Other information represents stable facts that should be reusable later.

For example:

```text
Conversation Event
      ↓
"Ahmed was rejected because
his experience was below the minimum"
      ↓
Episodic Memory
      ↓
Stable Fact
      ↓
Semantic Memory
```

Without persistent memory, the assistant may forget important recruitment information once the active context is no longer available.

This creates the need for:

* Short-term memory.
* Episodic memory.
* Semantic memory.
* Memory consolidation.
* Conflict resolution.
* Fact expiration.

---

### 3. Knowledge Retrieval Problem

The MCP server provides controlled access to structured recruitment data, but Talenta also contains large amounts of unstructured knowledge:

* HR policies.
* Interview guidelines.
* Hiring workflows.
* Offer requirements.
* Onboarding procedures.

It is not practical to expose every policy as a separate MCP tool.

For example, a recruiter may ask:

> "What conditions must be satisfied before an official offer letter can be generated?"

The answer exists in a policy document, but the assistant needs a retrieval mechanism to find the relevant policy instead of guessing.

This creates the need for:

* Knowledge-base retrieval.
* Vector search.
* Keyword search.
* Hybrid retrieval.
* Agentic retrieval.
* Retrieval evaluation.

---

## Why Phase 3 Was Necessary

These problems were reproduced using Talenta-specific evaluation scenarios.

For example:

```text
Early Decision Buried
Ahmed rejected because experience
is below minimum
        ↓
120 simulated tool outputs
        ↓
Recruiter asks:
"Why was Ahmed rejected?"
```

And:

```text
Original Requirement
"Python, Docker, AWS"
        ↓
80 discussion turns
        ↓
Recruiter asks:
"What were the original requirements?"
```

The system therefore evolved from:

```text
Secure Data Access
```

into:

```text
Secure Data Access
        +
Context Management
        +
Persistent Memory
        +
Knowledge Retrieval
        +
Evaluation
```

---

# Phase 3 — Memory, Context Management & RAG

Phase 3 extends the existing Phase 2 system with three major capabilities:

* **Context Management**
* **Persistent Memory**
* **Knowledge Retrieval / RAG**

The goal is not simply to add features, but to solve the limitations discovered during realistic recruitment workflows.

---

# Context Management

## Problem

The active conversation can become dominated by MCP tool outputs during long recruitment workflows.

Important information may appear early in the conversation and become difficult to retain after many subsequent tool calls.

Talenta-specific evaluation scenarios reproduce this problem using large amounts of simulated MCP activity.

| Scenario                  | What is buried                                     |        Buried under |
| ------------------------- | -------------------------------------------------- | ------------------: |
| Early Decision Buried     | Ahmed rejected because experience is below minimum |    120 tool outputs |
| Huge Tool Output          | Sarah has stronger Python experience               |    150 tool outputs |
| Long Recruitment Planning | Python, Docker, AWS requirements                   | 80 discussion turns |
| Important Tool Output     | Candidate location updated to Germany              |    100 tool outputs |
| Real Recruitment Workflow | Sara selected with 92% match score                 |    180 tool outputs |

The goal is to **reduce unnecessary context while preserving information required to answer future recruiter questions**.

## Strategies

Four strategies were implemented:

### Sliding Window

Keeps only the most recent messages.

```text
Old Context
    ↓
Removed

Recent Messages
    ↓
Kept
```

### Observation Masking

Older tool outputs are replaced with a placeholder while recent tool outputs remain available.

```text
Old Tool Output
      ↓
[tool output omitted]

Recent Tool Output
      ↓
Preserved
```

### Recursive Summarization

Historical messages are grouped into chunks and represented by compact summaries while recent messages remain unchanged.

```text
Old Messages
      ↓
Chunking
      ↓
Compact Summaries
      ↓
Recent Messages
```

### Zone-Based Pruning

The conversation is divided into initial, middle, and recent zones.

```text
Initial Zone → Preserved
Middle Zone  → Pruned
Recent Zone  → Preserved
```

## Evaluation

The strategies are evaluated using:

* Information retention.
* Average input tokens.
* Average output tokens.
* Processing latency.

| Strategy                | Retention | Avg. Input Tokens | Avg. Output Tokens | Avg. Latency |
| ----------------------- | --------: | ----------------: | -----------------: | -----------: |
| Sliding Window          |      4/10 |               478 |                 14 |      0.14 ms |
| Observation Masking     |      8/10 |               409 |                 53 |      0.95 ms |
| Recursive Summarization | **10/10** |               635 |              **5** |      2.46 ms |
| Zone-Based Pruning      | **10/10** |               753 |                 53 |      2.43 ms |

### Selected Strategy

**Recursive Summarization** was selected because it achieved maximum information retention while producing a significantly smaller output-token footprint than Zone-Based Pruning.

```text
10/10 Information Retention
635 Average Input Tokens
5 Average Output Tokens
2.46 ms Average Processing Latency
```

---

# Memory Architecture

Context management handles the active conversation, but persistent memory is required for information that should survive beyond the current context.

The memory architecture is implemented under `memory/`.

```text
                    AI Agent
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   Short-Term      Scratchpad    Retrieval
     Memory
          │
       Overflow
          │
          ▼
   Promote / Drop
      Router
       │    │
       │    └──────────────► Drop
       │
       ▼
 Episodic Memory
       │
       ▼
 Consolidation Engine
       │
       ▼
 Semantic Memory
```

## Short-Term Memory

Maintains bounded active conversation history.

## Scratchpad

Stores temporary agent state such as:

* Current plan.
* Current sub-goal.
* Working state.

## Promote / Drop Router

When information leaves Short-Term Memory, it is evaluated and either:

```text
Promote → Episodic Memory
Drop    → Discard
```

The routing decision is logged so that the reasoning behind promotion or dropping can be inspected.

## Episodic Memory

Stores important events from previous recruitment interactions.

Each episode contains:

* Task.
* Summary.
* Outcome.
* Timestamp.
* Metadata.

Episodic memory represents:

> **What happened.**

## Semantic Memory

Stores stable reusable facts.

Example:

```text
candidate_status → Accepted
preferred_role   → Backend Developer
required_skill   → Python
```

Semantic memory represents:

> **What the system currently knows.**

## Consolidation

The consolidation engine converts important episodic information into reusable semantic facts.

```text
Episodic Memory
       ↓
Fact Extraction
       ↓
Semantic Memory
```

Consolidation is triggered after a configurable number of unprocessed episodes rather than after every turn.

## Versioning & Conflict Resolution

When a fact changes, the previous version is preserved.

```text
Candidate Status

V1 → Interviewing
V2 → Accepted

Current Value → Accepted
```

The system uses:

**Latest Version Wins**

The historical values remain available through the fact versions.

## Fact Expiration

Semantic facts have expiration information.

Expired facts are marked as expired instead of being deleted, preventing outdated recruitment information from being treated as permanently valid.

---

# Knowledge Retrieval / RAG

Talenta contains unstructured recruitment knowledge that cannot reasonably be represented as individual MCP tools.

The project therefore adds a `search_knowledge_base` retrieval layer.

```text
Recruiter Question
        ↓
Knowledge Retrieval
        ↓
Retrieved Evidence
        ↓
LLM
        ↓
Grounded Answer
```

Three retrieval architectures were implemented and compared.

---

# RAG Architectures

```text
                 Recruiter Question
                         │
                         ▼
                Knowledge Retrieval
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
           Naive       Hybrid     Agentic
            RAG         RAG         RAG
              │          │          │
              └──────────┼──────────┘
                         ▼
                Retrieved Evidence
                         │
                         ▼
                       Mistral
                         │
                         ▼
                      Answer
```

## Naive RAG

Uses a straightforward retrieve-then-generate pipeline.

```text
Question
   ↓
Vector Retrieval
   ↓
Top-K Documents
   ↓
Context
   ↓
Mistral
   ↓
Self-RAG Verification
   ↓
Final Answer
```

## Hybrid Search RAG

Combines:

* BM25 keyword retrieval.
* Vector similarity retrieval.

```text
             Question
             /      \
            ↓        ↓
         BM25     Vector Search
            \        /
             ↓      ↓
             Score Fusion
                  ↓
             Ranked Results
                  ↓
                Mistral
```

The current implementation uses:

```text
Hybrid Score =
    α × Vector Score
    +
    (1 - α) × BM25 Score

α = 0.5
```

## Agentic RAG

Uses iterative reasoning and retrieval.

```text
Question
   ↓
Reason
   ↓
Search Query
   ↓
Retrieve
   ↓
Observe
   ↓
Reason Again
   │
   ├── COMPLETE → Answer
   │
   └── NEED_MORE
          ↓
     New Search Query
          ↓
        Retrieve
```

The implementation supports up to three retrieval iterations and preserves previously retrieved evidence while removing duplicates.

---

# Document Processing

Knowledge-base documents are processed through:

```text
Markdown Documents
        ↓
Document Chunking
        ↓
Gemini Embeddings
        ↓
ChromaDB
```

Documents are split using:

* 500-character chunk size.
* 100-character overlap.
* Markdown-aware separators.

Each chunk stores metadata including:

* Source.
* Document type.
* Version.
* Chunk ID.
* Chunk index.
* Total chunks.

---

# Vector Database

The vector database uses **ChromaDB** with cosine similarity.

```text
Document Chunk
      ↓
Embedding
      ↓
ChromaDB
      ↓
Vector Retrieval
```

The database stores:

* Chunk embeddings.
* Original chunk content.
* Metadata.

Metadata filtering is supported by `VectorDatabase.retrieve()`.

This allows retrieval to be restricted to relevant document types such as:

```text
policy
workflow
interview
evaluation
security
```

---

# Self-RAG Verification

The project includes an explicit verification layer for grounded answers.

The verifier checks:

```text
Retrieved Context
       +
Generated Answer
       ↓
Relevance Check
       +
Support Check
       ↓
Passed?
   /       \
 Yes        No
 ↓          ↓
Answer    "I don't have enough information."
```

The verifier checks:

* Whether the retrieved context is relevant.
* Whether the generated answer is supported by the retrieved context.

Currently, Self-RAG verification is implemented in the **Naive RAG** pipeline. Extending the same verification layer to Hybrid RAG, Agentic RAG, and memory recall remains an integration improvement.

---

# Retrieval Evaluation

A dedicated evaluation framework under `retrieval_eval/` compares the three RAG architectures.

The dataset contains nine recruitment-specific questions.

| Category                              | Questions | Intended Architecture |
| ------------------------------------- | --------: | --------------------- |
| Direct Fact Retrieval                 |       1–3 | Naive RAG             |
| Exact Identifier Retrieval            |       4–6 | Hybrid Search RAG     |
| Multi-Step / Multi-Document Retrieval |       7–9 | Agentic RAG           |

## Metrics

Each architecture is evaluated using:

* Average Accuracy.
* Average Latency.
* Average Tokens per Query.

Accuracy is evaluated using a separate Mistral LLM judge against the ground-truth answer.

## Results

| Architecture      | Avg. Accuracy | Avg. Latency | Avg. Tokens / Query |
| ----------------- | ------------: | -----------: | ------------------: |
| Naive RAG         |         83.3% |       5.76 s |                  47 |
| Hybrid Search RAG |         71.9% |       6.15 s |                  47 |
| **Agentic RAG**   |     **94.4%** |   **5.66 s** |                  90 |

### Observation

Agentic RAG achieved the highest overall accuracy, especially on multi-step and multi-document recruitment questions.

Naive RAG remained efficient for direct factual questions.

Hybrid RAG showed that BM25/vector fusion may require further tuning for the current Talenta document collection.

---

# Agent & System Flow

Phase 3 is designed to extend the **same Phase 2 agent and MCP server**.

```text
Recruiter Message
        │
        ▼
      AI Agent
        │
   ┌────┼───────────────────────┐
   │    │                       │
   ▼    ▼                       ▼
Short-  Scratchpad        MCP Tools / RAG
Term        │                    │
Memory      │                    │
   │        │                    │
   ▼        ▼                    ▼
Promote/Drop              Recruitment Data
   │                       / Knowledge Base
   ▼
Episodic Memory
   │
   ▼
Consolidation
   │
   ▼
Semantic Memory
```

The important architectural principle is:

> **Phase 3 reuses the Phase 2 MCP server and recruitment database instead of duplicating them.**

---

# Project Structure

```text
Talenta-Automation-Project/
│
├── agent/
│
├── mcp_server/
│   └── rag/
│       ├── documents/
│       ├── chunking.py
│       ├── embedding.py
│       ├── vector_db.py
│       ├── naive_rag.py
│       ├── hybrid_search.py
│       ├── hybrid_rag.py
│       ├── agentic_rag.py
│       └── self_rag.py
│
├── memory/
│   ├── short_term_memory.py
│   ├── scratchpad.py
│   ├── promote_drop_router.py
│   ├── episodic.py
│   ├── semantic.py
│   ├── semantic_models.py
│   └── consolidation.py
│
├── context_eval/
│   ├── test_cases.py
│   ├── strategies.py
│   └── evaluation.py
│
├── retrieval_eval/
│   ├── test_questions.py
│   ├── metrics.py
│   └── evaluator.py
│
├── requirements.txt
├── .env
└── README.md
```

---

# Environment Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_RAG_MODEL=mistral-small-2603
MISTRAL_EVALUATOR_MODEL=mistral-small-2603
```

API keys must **never** be committed to GitHub.

---

# Running the Project

All commands should be executed from the project root.

## 1. Set `PYTHONPATH`

For a new PowerShell session:

```powershell
$env:PYTHONPATH="$PWD\mcp_server;$PWD\mcp_server\rag;$PWD"
```

## 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

## 3. Build the Vector Database

```powershell
python -m vector_db
```

This performs:

```text
Markdown Documents
        ↓
Chunking
        ↓
Gemini Embeddings
        ↓
ChromaDB
```

Rebuild the database whenever the knowledge-base documents change.

## 4. Run Individual RAG Architectures

### Naive RAG

```powershell
python -m naive_rag
```

### Hybrid RAG

```powershell
python -m hybrid_rag
```

### Agentic RAG

```powershell
python -m agentic_rag
```

## 5. Run Retrieval Evaluation

```powershell
python -m retrieval_eval.evaluator
```

Flow:

```text
9 Test Questions
      │
      ├── Naive RAG
      │
      ├── Hybrid RAG
      │
      └── Agentic RAG
             │
             ▼
      Mistral Evaluation
             │
             ▼
    Accuracy / Latency / Tokens
```

## 6. Run Context Evaluation

```powershell
python -m context_eval.evaluation
```

This evaluates:

```text
Sliding Window
Observation Masking
Recursive Summarization
Zone-Based Pruning
```

and recommends the best strategy according to retention, token usage, and latency.

---

# Complete Evaluation Flow

For a fresh setup:

```powershell
$env:PYTHONPATH="$PWD\mcp_server;$PWD\mcp_server\rag;$PWD"

pip install -r requirements.txt

python -m vector_db

python -m retrieval_eval.evaluator

python -m context_eval.evaluation
```

Overall architecture:

```text
                 TALENTA RECRUITMENT ASSISTANT
                           │
                           ▼
                    Phase 2 MCP Layer
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       Recruitment DB            MCP Resources
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                    Phase 3 Extension
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Context Management      Memory             RAG
        │                  │                  │
        ▼                  ▼                  ▼
  Four Strategies    Episodic/Semantic   Naive/Hybrid/
                     Consolidation        Agentic
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                      Evaluation
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       Context Evaluation       Retrieval Evaluation
              │                         │
              ▼                         ▼
      Retention / Tokens       Accuracy / Latency /
          / Latency                Tokens
```

---

# Repository Safety & Reproducibility

* `.env` must be included in `.gitignore`.
* API keys must never be committed.
* `requirements.txt` should contain all required dependencies.
* Evaluation datasets should remain unchanged during evaluation.
* The same Phase 2 database and MCP server are reused by Phase 3.
* The vector database should be rebuilt whenever knowledge-base documents change.

---

# Project Outcome

The project evolves from a secure MCP-based recruitment assistant into a more complete AI recruitment system capable of:

```text
Secure Data Access
        +
Bounded Context
        +
Persistent Memory
        +
Memory Consolidation
        +
Knowledge Retrieval
        +
Multiple RAG Architectures
        +
Grounded Answer Verification
        +
Quantitative Evaluation
```

The main design principle is to **solve real limitations discovered in the recruitment workflow rather than adding isolated AI features**.
