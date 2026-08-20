# Talenta Automation Project

## Project Overview

**Talenta Partners Group** is a recruitment and staffing agency connecting qualified candidates with client companies across technology, finance, healthcare, and administration.

The project introduces an **AI Recruitment Assistant** that helps recruiters search, evaluate, compare, and manage candidate information while maintaining controlled access to sensitive recruitment data.

The project evolves across three connected phases, each building on the previous one rather than creating a separate application.

```text
PHASE 2                  PHASE 3                    PHASE 4
Secure Data Access  →   Memory + Context + RAG  →   Task Decomposition & Planning
```

---

## Phase 2 — Secure Recruitment Data Access (Summary)

Instead of letting the AI model talk directly to the recruitment database, Phase 2 introduced an **MCP-based architecture**:

```text
Recruiter → AI Agent → MCP Client → MCP Server → Validated MCP Tools → Recruitment Database
```

The MCP Server handles authentication, input validation, protected write operations, human confirmation for sensitive actions, dynamic tool availability, and read-only access to policies.

This enabled realistic workflows (candidate search → details → skills → job requirements → application history → interview evaluation → policy check → matching → hiring decision), but longer workflows exposed two limitations: **context getting buried under tool outputs**, and **no way to retrieve unstructured policy knowledge**.

---

## Phase 3 — Memory, Context Management & RAG (Summary)

Phase 3 extended the Phase 2 system with three capabilities:

**1. Context Management** — Four strategies (Sliding Window, Observation Masking, Recursive Summarization, Zone-Based Pruning) were built and evaluated on retention, tokens, and latency. **Recursive Summarization** was selected as the best strategy (10/10 retention, 635 avg input tokens, 5 avg output tokens, 2.46 ms latency).

**2. Persistent Memory** — A layered memory system (Short-Term Memory → Promote/Drop Router → Episodic Memory → Consolidation → Semantic Memory), plus a Scratchpad for agent state. Includes fact versioning, "Latest Version Wins" conflict resolution, and fact expiration.

**3. Knowledge Retrieval / RAG** — Three RAG architectures were built and compared: Naive RAG (83.3% accuracy), Hybrid Search RAG (BM25 + vector fusion, 71.9% accuracy), and Agentic RAG (iterative retrieval, 94.4% accuracy — the best performer, especially on multi-step questions). Includes document chunking, Gemini embeddings, ChromaDB vector storage, and Self-RAG verification (currently implemented in the Naive RAG pipeline).

The project structure includes `agent/`, `mcp_server/rag/`, `memory/`, `context_eval/`, and `retrieval_eval/` directories, with evaluation scripts runnable via `python -m vector_db`, `python -m retrieval_eval.evaluator`, and `python -m context_eval.evaluation`.

---

# Phase 4 — Task Decomposition & Planning

## Overview

In the previous phases, the Talenta AI Recruitment Assistant gained several important capabilities.

**Phase 2** introduced secure access to recruitment data through MCP tools, allowing the agent to retrieve and manage candidate, application, and recruitment information.

**Phase 3** extended the system with context management, persistent memory, and RAG, allowing the agent to manage long conversations, retain important information, and retrieve knowledge from recruitment policies and documents.

However, having access to these capabilities does not automatically mean that the agent knows **how to combine them to solve a complex task**.

Phase 4 addresses this problem by introducing **Task Decomposition, DAG-Based Planning, Execution, and Reflexion**.

---

## The Problem

A recruiter does not always ask for a single operation.

For example, the recruiter may ask:

> "Review the active applicants for the Backend Developer position, compare their skills, experience, and application information against the job requirements and hiring policy, then recommend who should advance and who should be rejected."

This request cannot be handled by a single MCP call.

To answer it, the agent needs to first understand what the recruiter is asking for, determine what information is required, and then execute several related operations.

The workflow may involve:

- Identifying the correct job.
- Retrieving the job requirements.
- Finding the active applications.
- Retrieving information for every candidate.
- Checking candidate skills and experience.
- Reviewing application history.
- Retrieving available interview evaluations.
- Comparing candidates against the job requirements.
- Checking the relevant hiring policy.
- Producing a recommendation for each candidate.

The challenge is therefore not only **retrieving information**, but deciding:

> What tasks need to be performed, in what order, which tasks depend on each other, and what should happen when the available information is incomplete?

---

## Task Decomposition

Phase 4 allows the agent to transform a high-level recruiter request into smaller, executable tasks.

For the candidate review workflow, the request can be decomposed as follows:

```text
Recruiter Request
        │
        ▼
Identify Job
        │
        ▼
Get Job Requirements
        │
        ▼
Get Active Applications
        │
        ▼
Evaluate Each Candidate
```

For each candidate, the agent may need to collect multiple pieces of information:

```text
Candidate
    │
    ├── Candidate Details
    ├── Skills & Experience
    ├── Application History
    └── Interview Evaluation
```

Once this information is collected, the agent can evaluate the candidate against the job requirements.

---

## DAG-Based Planning

The workflow is represented as a **Directed Acyclic Graph (DAG)**.

This is important because the workflow is not simply one long sequence of tasks.

Some tasks must wait for previous results.

For example, the agent cannot evaluate candidates before retrieving the active applications, and it cannot compare candidates against the role before knowing the job requirements.

At the same time, once the candidates are known, their evaluations can be handled independently.

```text
Get Job Requirements
          │
          ▼
Get Active Applications
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
Candidate Candidate Candidate
    A       B       C
    │       │       │
    ▼       ▼       ▼
Evaluate Evaluate Evaluate
    │       │       │
    └───────┼───────┘
            ▼
    Compare Candidates
            │
            ▼
      Check Policy
            │
            ▼
       Final Decision
```

The DAG allows the agent to understand both:

- **Dependencies** — tasks that must be completed before another task can start.
- **Independent branches** — tasks that can be executed separately, such as evaluating multiple candidates.

After the independent candidate evaluations are completed, their results are combined for comparison and decision-making.

---

## Planning and Execution

The planner receives the original request and creates a structured plan.

Each task contains the action that needs to be performed and its relationship to other tasks.

The agent then executes the plan step by step using the capabilities developed in the previous phases.

```text
                    Planner
                       │
                       ▼
                Decompose Task
                       │
                       ▼
                    DAG Plan
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       MCP Tools     Memory         RAG
          │            │            │
          ▼            ▼            ▼
    Recruitment    Previous       Hiring
       Data       Information     Policies
          └────────────┼────────────┘
                       ▼
                Candidate Evidence
```

This means that Phase 4 does not replace the previous phases.

Instead, it acts as the layer that **orchestrates them**.

The planner decides when it needs:

- MCP tools for structured recruitment data.
- Memory for previously stored information.
- RAG for policies or other unstructured knowledge.

---

## Candidate Evaluation and Decision

After collecting the required information, the agent compares each candidate against the requirements of the Backend Developer position.

The evaluation considers factors such as:

- Required experience.
- Required skills.
- Preferred skills.
- Application information.
- Available interview feedback.
- Hiring criteria and policy.

The agent then produces a recommendation instead of simply returning raw data.

For example:

| Candidate | Experience | Skill Match | Recommendation |
|---|---:|---:|---|
| Alex Johnson | 4 years | 74% | **PENDING** |
| Priya Patel | 2 years | — | **REJECT** |
| Marcus Lee | 5 years | 86% | **ADVANCE** |
| Elena Rodriguez | 6 years | 79% | **ADVANCE** |

The different outcomes demonstrate that the agent evaluates the available evidence for each candidate individually.

For example:

- **Marcus Lee** meets the experience and skill requirements and receives strong interview feedback, so the recommendation is **ADVANCE**.
- **Elena Rodriguez** also meets the required criteria and is recommended to **ADVANCE**.
- **Priya Patel** has strong skills but does not meet the minimum experience requirement, resulting in **REJECT**.
- **Alex Johnson** meets the experience requirement but falls slightly below the skill-match threshold, so the agent recommends **PENDING** for manual review.

---

## Reflexion and Re-Planning

A plan cannot always assume that every task will succeed.

During execution, the agent may discover that:

- Interview information is unavailable.
- Candidate information is incomplete.
- A retrieval result is insufficient.
- A previous task did not return the expected result.

Phase 4 therefore supports **Reflexion**.

After executing a task, the agent evaluates the result and determines whether it has enough information to continue.

```text
Execute Task
      │
      ▼
Observe Result
      │
      ▼
Is the Result Sufficient?
     │           │
    Yes          No
     │           │
     ▼           ▼
 Continue     Reflexion
                  │
                  ▼
              Re-Plan
                  │
                  ▼
               Continue
```

Instead of immediately failing when something unexpected happens, the agent can reconsider the remaining workflow and adjust its plan.

---

## Human-in-the-Loop

The planning system can recommend an action, but sensitive recruitment changes remain controlled.

For example, after evaluating the candidates, the agent may recommend:

```text
Marcus Lee  → ADVANCE
Elena Rodriguez → ADVANCE
Alex Johnson → PENDING
Priya Patel → REJECT
```

However, the recommendation is separated from the actual database update.

```text
AI Recommendation
        │
        ▼
Human Confirmation
        │
        ▼
Approved Decision
        │
        ▼
Update Application Status
```

This preserves the controlled write operations and human confirmation mechanisms introduced in Phase 2.

---

## Example Execution

The workflow was executed through the planning CLI:

```bash
python -m planning_lab.cli "Review active applicants for the Backend Developer position, compare their skills, experience, applications against the job requirements and hiring policy, then recommend who should advance or be rejected." --mode reflexion
```

The execution successfully produced a complete recruitment review, including:

1. Job requirements.
2. Individual candidate evaluation.
3. Skills and experience comparison.
4. Interview feedback where available.
5. Candidate-specific recommendations.
6. Final advance, reject, or pending decisions.

This demonstrates the main purpose of Phase 4: a single high-level recruiter request can be transformed into a structured workflow that gathers information, evaluates multiple candidates, and produces actionable recommendations.

---

## Phase 4 Outcome

Phase 4 moves the Talenta AI Assistant beyond individual tool calls.

The system can now:

- Understand a complex recruiter request.
- Break the request into smaller tasks.
- Represent task dependencies using a DAG.
- Execute independent candidate evaluation branches.
- Combine MCP, Memory, and RAG capabilities.
- Aggregate evidence from multiple sources.
- Compare and rank candidates.
- Produce candidate-specific recommendations.
- Reflect on incomplete or failed results.
- Re-plan when necessary.
- Preserve human confirmation before sensitive application updates.

```text
Phase 2
Secure MCP Data Access
        +
Phase 3
Context Management + Memory + RAG
        +
Phase 4
Task Decomposition
        +
DAG Planning
        +
Execution
        +
Reflexion & Re-Planning
```

The result is an AI Recruitment Assistant that can take a high-level recruitment request and transform it into a structured, multi-step workflow instead of relying on a single tool call.
