PRAGMA foreign_keys = ON;

-- ============================================================
-- EXISTING RECRUITMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS Candidates (
    candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    phone TEXT,

    location TEXT,

    experience_years INTEGER NOT NULL DEFAULT 0
        CHECK (experience_years >= 0),

    education TEXT
);


CREATE TABLE IF NOT EXISTS CandidateSkills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    candidate_id INTEGER NOT NULL,

    skill TEXT NOT NULL,

    FOREIGN KEY (candidate_id)
        REFERENCES Candidates(candidate_id)
        ON DELETE CASCADE,

    UNIQUE(candidate_id, skill)
);


CREATE TABLE IF NOT EXISTS Jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,

    department TEXT,

    required_degree TEXT,

    min_experience INTEGER NOT NULL DEFAULT 0
        CHECK (min_experience >= 0),

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (
            status IN (
                'OPEN',
                'CLOSED',
                'PAUSED'
            )
        )
);


CREATE TABLE IF NOT EXISTS Applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,

    candidate_id INTEGER NOT NULL,

    job_id INTEGER NOT NULL,

    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'WITHDRAWN'
            )
        ),

    match_score REAL
        CHECK (
            match_score IS NULL
            OR (
                match_score >= 0
                AND match_score <= 100
            )
        ),

    recruiter_notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (candidate_id)
        REFERENCES Candidates(candidate_id)
        ON DELETE CASCADE,

    FOREIGN KEY (job_id)
        REFERENCES Jobs(job_id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS JobSkills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    job_id INTEGER NOT NULL,

    skill TEXT NOT NULL,

    FOREIGN KEY (job_id)
        REFERENCES Jobs(job_id)
        ON DELETE CASCADE,

    UNIQUE(job_id, skill)
);


-- ============================================================
-- ADMIN USERS
-- ============================================================
--
-- Admins are the real people who:
--
--   * resolve HITL requests
--   * investigate failure tickets
--   * manage MCP tools
--   * manage RAG documents
--
-- The platform authenticates the admin.
-- The database stores the application-level identity.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
    admin_id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL UNIQUE,

    display_name TEXT NOT NULL,

    email TEXT UNIQUE,

    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (
            role IN (
                'admin',
                'super_admin'
            )
        ),

    active INTEGER NOT NULL DEFAULT 1
        CHECK (active IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- STATE GRAPH RUNS
-- ============================================================
--
-- One row = one logical graph execution / thread.
--
-- This is the application-level state view.
--
-- LangGraph itself keeps its internal checkpoint records.
-- This table gives the platform a stable representation that
-- the admin dashboard can inspect.
-- ============================================================

CREATE TABLE IF NOT EXISTS graph_runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT,

    thread_id TEXT NOT NULL UNIQUE,

    graph_name TEXT NOT NULL,

    recruitment_id INTEGER,

    candidate_id INTEGER,

    application_id INTEGER,

    job_id INTEGER,

    current_node TEXT,

    status TEXT NOT NULL DEFAULT 'ready'
        CHECK (
            status IN (
                'ready',
                'running',
                'waiting',
                'hitl_pending',
                'failed',
                'recovering',
                'completed',
                'cancelled'
            )
        ),

    next_action TEXT,

    last_checkpoint_id INTEGER,

    retry_count INTEGER NOT NULL DEFAULT 0
        CHECK (retry_count >= 0),

    failure_ticket_id INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    completed_at TEXT
);


-- ============================================================
-- APPLICATION-LEVEL GRAPH CHECKPOINTS
-- ============================================================
--
-- This is NOT a replacement for LangGraph's SqliteSaver.
--
-- LangGraph's own checkpoint tables are responsible for actual
-- graph resume.
--
-- This table gives the application a readable, inspectable
-- checkpoint history for:
--
--   * admin dashboard
--   * debugging
--   * demo evidence
--   * failure recovery inspection
--   * proving what state existed before failure
-- ============================================================

CREATE TABLE IF NOT EXISTS graph_checkpoints (
    checkpoint_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER NOT NULL,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT NOT NULL,

    transition_number INTEGER NOT NULL
        CHECK (transition_number >= 0),

    state_json TEXT NOT NULL,

    status TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (run_id)
        REFERENCES graph_runs(run_id)
        ON DELETE CASCADE,

    UNIQUE(run_id, transition_number)
);


-- ============================================================
-- GRAPH EVENTS / AUDIT TRAIL
-- ============================================================
--
-- Examples:
--
--   RUN_STARTED
--   NODE_STARTED
--   NODE_COMPLETED
--   NODE_FAILED
--   CHECKPOINT_CREATED
--   HITL_CREATED
--   HITL_RESOLVED
--   TICKET_CREATED
--   TICKET_INVESTIGATING
--   TICKET_RESOLVED
--   GRAPH_RESUMED
--   GRAPH_COMPLETED
--   GRAPH_CANCELLED
-- ============================================================

CREATE TABLE IF NOT EXISTS graph_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT,

    event_type TEXT NOT NULL,

    message TEXT,

    metadata_json TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (run_id)
        REFERENCES graph_runs(run_id)
        ON DELETE SET NULL
);


-- ============================================================
-- HUMAN-IN-THE-LOOP TASKS
-- ============================================================
--
-- HITL is an EXPECTED pause.
--
-- It is NOT an error.
--
-- Example:
--
--   Agent detects that an action requires human approval.
--
--   Graph:
--
--       node
--         |
--         v
--       HITL
--         |
--         |--- resolve ---> continue
--         |
--         |--- escalate --> escalation path
--
-- The graph must NOT continue until the admin acts.
-- ============================================================

CREATE TABLE IF NOT EXISTS hitl_tasks (
    hitl_task_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER NOT NULL,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT NOT NULL,

    task_type TEXT NOT NULL,

    reason TEXT NOT NULL,

    state_snapshot TEXT NOT NULL,

    requested_action TEXT,

    allowed_actions TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'resolved',
                'cancelled'
            )
        ),

    admin_id INTEGER,

    admin_decision TEXT,

    admin_feedback TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    resolved_at TEXT,

    FOREIGN KEY (run_id)
        REFERENCES graph_runs(run_id)
        ON DELETE CASCADE,

    FOREIGN KEY (admin_id)
        REFERENCES admin_users(admin_id)
        ON DELETE SET NULL
);


-- ============================================================
-- FAILURE / RECOVERY TICKETS
-- ============================================================
--
-- IMPORTANT:
--
-- This is DIFFERENT from HITL.
--
-- HITL:
--     expected pause
--     agent is not allowed to decide
--
-- FAILURE TICKET:
--     unexpected failure
--
-- Examples:
--
--     tool error
--     connection failure
--     malformed response
--     schema validation error
--     unexpected exception
--
-- The ticket contains the failed node and the state snapshot
-- that existed when the failure occurred.
-- ============================================================

CREATE TABLE IF NOT EXISTS failure_tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,

    run_id INTEGER NOT NULL,

    thread_id TEXT NOT NULL,

    graph_name TEXT NOT NULL,

    node_name TEXT NOT NULL,

    error_type TEXT NOT NULL,

    error_message TEXT NOT NULL,

    state_snapshot TEXT NOT NULL,

    checkpoint_id INTEGER,

    status TEXT NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'investigating',
                'resolved',
                'cancelled'
            )
        ),

    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (
            priority IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    assigned_to INTEGER,

    resolution TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    resolved_at TEXT,

    FOREIGN KEY (run_id)
        REFERENCES graph_runs(run_id)
        ON DELETE CASCADE,

    FOREIGN KEY (checkpoint_id)
        REFERENCES graph_checkpoints(checkpoint_id)
        ON DELETE SET NULL,

    FOREIGN KEY (assigned_to)
        REFERENCES admin_users(admin_id)
        ON DELETE SET NULL
);


-- ============================================================
-- MCP AGENT REGISTRY
-- ============================================================
--
-- Every agent exposed through the platform appears here.
--
-- The platform uses this table to:
--
--   * list agents
--   * enable/disable agents
--   * manage their available tools
-- ============================================================

CREATE TABLE IF NOT EXISTS agents (
    agent_id INTEGER PRIMARY KEY AUTOINCREMENT,

    agent_name TEXT NOT NULL UNIQUE,

    display_name TEXT NOT NULL,

    description TEXT,

    agent_type TEXT NOT NULL
        CHECK (
            agent_type IN (
                'state_graph',
                'rag',
                'planning',
                'general'
            )
        ),

    enabled INTEGER NOT NULL DEFAULT 1
        CHECK (enabled IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- MCP TOOL REGISTRY
-- ============================================================
--
-- Stores the tools known to the MCP server.
--
-- This is necessary for the admin panel to show:
--
--     Tool
--     Description
--     Enabled / Disabled
--
-- Agent-specific availability is stored in agent_tools.
-- ============================================================

CREATE TABLE IF NOT EXISTS mcp_tools (
    tool_id INTEGER PRIMARY KEY AUTOINCREMENT,

    tool_name TEXT NOT NULL UNIQUE,

    display_name TEXT NOT NULL,

    description TEXT,

    enabled INTEGER NOT NULL DEFAULT 1
        CHECK (enabled IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- AGENT <-> MCP TOOL ASSIGNMENTS
-- ============================================================
--
-- Determines which MCP tools a particular agent can use.
--
-- This is the application-level source of truth for the
-- platform's tool management UI.
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_tools (
    agent_tool_id INTEGER PRIMARY KEY AUTOINCREMENT,

    agent_id INTEGER NOT NULL,

    tool_id INTEGER NOT NULL,

    enabled INTEGER NOT NULL DEFAULT 1
        CHECK (enabled IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agent_id, tool_id),

    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id)
        ON DELETE CASCADE,

    FOREIGN KEY (tool_id)
        REFERENCES mcp_tools(tool_id)
        ON DELETE CASCADE
);


-- ============================================================
-- RAG DOCUMENT REGISTRY
-- ============================================================
--
-- This table represents the documents managed by the platform.
--
-- IMPORTANT:
--
-- Adding a row here alone is NOT enough.
--
-- The RAG service must actually ingest the document into its
-- vector store.
--
-- Removing/deactivating a document must also remove it from
-- retrieval or mark it unavailable to the retrieval layer.
-- ============================================================

CREATE TABLE IF NOT EXISTS rag_documents (
    document_id INTEGER PRIMARY KEY AUTOINCREMENT,

    document_name TEXT NOT NULL,

    document_path TEXT,

    document_type TEXT,

    content_hash TEXT UNIQUE,

    active INTEGER NOT NULL DEFAULT 1
        CHECK (active IN (0, 1)),

    uploaded_by INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TEXT,

    FOREIGN KEY (uploaded_by)
        REFERENCES admin_users(admin_id)
        ON DELETE SET NULL
);


-- ============================================================
-- RAG DOCUMENT INGESTION STATUS
-- ============================================================
--
-- Allows the platform to distinguish between:
--
--   uploaded
--   processing
--   indexed
--   failed
--   removed
--
-- This prevents the UI from pretending that a document is
-- searchable when ingestion actually failed.
-- ============================================================

CREATE TABLE IF NOT EXISTS rag_document_status (
    document_status_id INTEGER PRIMARY KEY AUTOINCREMENT,

    document_id INTEGER NOT NULL,

    status TEXT NOT NULL DEFAULT 'uploaded'
        CHECK (
            status IN (
                'uploaded',
                'processing',
                'indexed',
                'failed',
                'removed'
            )
        ),

    error_message TEXT,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id)
        REFERENCES rag_documents(document_id)
        ON DELETE CASCADE
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_candidates_email
ON Candidates(email);


CREATE INDEX IF NOT EXISTS idx_applications_candidate
ON Applications(candidate_id);


CREATE INDEX IF NOT EXISTS idx_applications_job
ON Applications(job_id);


CREATE INDEX IF NOT EXISTS idx_applications_status
ON Applications(status);


CREATE INDEX IF NOT EXISTS idx_graph_runs_thread
ON graph_runs(thread_id);


CREATE INDEX IF NOT EXISTS idx_graph_runs_status
ON graph_runs(status);


CREATE INDEX IF NOT EXISTS idx_graph_runs_graph
ON graph_runs(graph_name);


CREATE INDEX IF NOT EXISTS idx_graph_runs_updated
ON graph_runs(updated_at);


CREATE INDEX IF NOT EXISTS idx_graph_checkpoints_thread
ON graph_checkpoints(thread_id);


CREATE INDEX IF NOT EXISTS idx_graph_checkpoints_run
ON graph_checkpoints(run_id);


CREATE INDEX IF NOT EXISTS idx_graph_checkpoints_transition
ON graph_checkpoints(
    run_id,
    transition_number
);


CREATE INDEX IF NOT EXISTS idx_graph_events_thread
ON graph_events(thread_id);


CREATE INDEX IF NOT EXISTS idx_graph_events_run
ON graph_events(run_id);


CREATE INDEX IF NOT EXISTS idx_graph_events_type
ON graph_events(event_type);


CREATE INDEX IF NOT EXISTS idx_hitl_status
ON hitl_tasks(status);


CREATE INDEX IF NOT EXISTS idx_hitl_run
ON hitl_tasks(run_id);


CREATE INDEX IF NOT EXISTS idx_hitl_admin
ON hitl_tasks(admin_id);


CREATE INDEX IF NOT EXISTS idx_failure_status
ON failure_tickets(status);


CREATE INDEX IF NOT EXISTS idx_failure_run
ON failure_tickets(run_id);


CREATE INDEX IF NOT EXISTS idx_failure_thread
ON failure_tickets(thread_id);


CREATE INDEX IF NOT EXISTS idx_failure_admin
ON failure_tickets(assigned_to);


CREATE INDEX IF NOT EXISTS idx_agent_enabled
ON agents(enabled);


CREATE INDEX IF NOT EXISTS idx_agent_tools_agent
ON agent_tools(agent_id);


CREATE INDEX IF NOT EXISTS idx_agent_tools_tool
ON agent_tools(tool_id);


CREATE INDEX IF NOT EXISTS idx_mcp_tools_enabled
ON mcp_tools(enabled);


CREATE INDEX IF NOT EXISTS idx_rag_documents_active
ON rag_documents(active);


CREATE INDEX IF NOT EXISTS idx_rag_status_document
ON rag_document_status(document_id);


CREATE INDEX IF NOT EXISTS idx_rag_status_status
ON rag_document_status(status);


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_graph_runs_updated_at
AFTER UPDATE ON graph_runs
FOR EACH ROW
BEGIN
    UPDATE graph_runs
    SET updated_at = CURRENT_TIMESTAMP
    WHERE run_id = NEW.run_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_failure_tickets_updated_at
AFTER UPDATE ON failure_tickets
FOR EACH ROW
BEGIN
    UPDATE failure_tickets
    SET updated_at = CURRENT_TIMESTAMP
    WHERE ticket_id = NEW.ticket_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_admin_users_updated_at
AFTER UPDATE ON admin_users
FOR EACH ROW
BEGIN
    UPDATE admin_users
    SET updated_at = CURRENT_TIMESTAMP
    WHERE admin_id = NEW.admin_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_agents_updated_at
AFTER UPDATE ON agents
FOR EACH ROW
BEGIN
    UPDATE agents
    SET updated_at = CURRENT_TIMESTAMP
    WHERE agent_id = NEW.agent_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_mcp_tools_updated_at
AFTER UPDATE ON mcp_tools
FOR EACH ROW
BEGIN
    UPDATE mcp_tools
    SET updated_at = CURRENT_TIMESTAMP
    WHERE tool_id = NEW.tool_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_agent_tools_updated_at
AFTER UPDATE ON agent_tools
FOR EACH ROW
BEGIN
    UPDATE agent_tools
    SET updated_at = CURRENT_TIMESTAMP
    WHERE agent_tool_id = NEW.agent_tool_id;
END;


CREATE TRIGGER IF NOT EXISTS trg_rag_documents_updated_at
AFTER UPDATE ON rag_documents
FOR EACH ROW
BEGIN
    UPDATE rag_documents
    SET updated_at = CURRENT_TIMESTAMP
    WHERE document_id = NEW.document_id;
END;


-- ============================================================
-- DEFAULT ADMIN
-- ============================================================
--
-- Demo/admin identity.
--
-- Authentication credentials MUST NOT be stored here.
-- The real platform authentication layer should handle that.
-- ============================================================

INSERT OR IGNORE INTO admin_users (
    username,
    display_name,
    email,
    role
)
VALUES (
    'admin',
    'Talenta Administrator',
    'admin@talenta.local',
    'super_admin'
);


-- ============================================================
-- DEFAULT AGENTS
-- ============================================================

INSERT OR IGNORE INTO agents (
    agent_name,
    display_name,
    description,
    agent_type
)
VALUES
(
    'recruitment_sla',
    'Recruitment SLA Agent',
    'Tracks recruitment SLA states, delays, alerts, and escalation.',
    'state_graph'
),
(
    'candidate_matching',
    'Candidate Matching Agent',
    'Handles candidate matching and recruitment decisions.',
    'state_graph'
),
(
    'hiring_pipeline',
    'Hiring Pipeline Agent',
    'Manages the multi-step hiring workflow.',
    'state_graph'
),
(
    'memory_rag',
    'Recruitment RAG Agent',
    'Answers recruitment questions using the RAG knowledge base.',
    'rag'
),
(
    'planning',
    'Recruitment Planning Agent',
    'Performs decomposition and planning workflows.',
    'planning'
);


-- ============================================================
-- DEFAULT MCP TOOLS
-- ============================================================
--
-- IMPORTANT:
--
-- These are registry entries only.
--
-- The MCP server must expose the real implementations and use
-- this registry when deciding which tools an agent can access.
-- ============================================================

INSERT OR IGNORE INTO mcp_tools (
    tool_name,
    display_name,
    description
)
VALUES
(
    'get_candidates',
    'Get Candidates',
    'Retrieve candidate information.'
),
(
    'get_jobs',
    'Get Jobs',
    'Retrieve job information.'
),
(
    'get_applications',
    'Get Applications',
    'Retrieve recruitment applications.'
),
(
    'update_application',
    'Update Application',
    'Update application status or recruiter notes.'
),
(
    'get_candidate_skills',
    'Get Candidate Skills',
    'Retrieve skills associated with a candidate.'
),
(
    'get_job_skills',
    'Get Job Skills',
    'Retrieve required skills for a job.'
);


-- ============================================================
-- DEFAULT AGENT TOOL ASSIGNMENTS
-- ============================================================
--
-- These assignments are initial defaults.
--
-- The admin platform can change them later.
-- ============================================================

INSERT OR IGNORE INTO agent_tools (
    agent_id,
    tool_id
)
SELECT
    a.agent_id,
    t.tool_id
FROM agents a
JOIN mcp_tools t
WHERE a.agent_name IN (
    'recruitment_sla',
    'candidate_matching',
    'hiring_pipeline'
);


-- ============================================================
-- END OF SCHEMA
-- ============================================================