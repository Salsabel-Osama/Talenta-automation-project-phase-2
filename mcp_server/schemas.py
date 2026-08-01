
# -------------------------------
# Approve Hire Schema
# -------------------------------

APPROVE_HIRE_SCHEMA = {
    "type": "object",
    "properties": {
        "application_id": {
            "type": "integer",
            "minimum": 1
        },
        "approved_by": {
            "type": "string",
            "minLength": 5,
            "maxLength": 100
        },
        "approval_reason": {
            "type": "string",
            "minLength": 20,
            "maxLength": 500
        }
    },
    "required": [
        "application_id",
        "approved_by",
        "approval_reason"
    ],
    "additionalProperties": False
}

# -------------------------------
# Batch Match Schema
# -------------------------------

BATCH_MATCH_SCHEMA = {
    "type": "object",
    "properties": {
        "job_id": {
            "type": "integer",
            "minimum": 1
        },
        "minimum_match": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
        },
        "include_pending": {
            "type": "boolean"
        }
    },
    "required": [
        "job_id",
        "minimum_match",
        "include_pending"
    ],
    "additionalProperties": False
}

# -------------------------------
# Recruiter Note Schema
# -------------------------------

RECRUITER_NOTE_SCHEMA = {
    "type": "object",
    "properties": {
        "application_id": {
            "type": "integer",
            "minimum": 1
        },
        "analysis_type": {
            "type": "string",
            "enum": [
                "sentiment",
                "summary",
                "risk"
            ]
        }
    },
    "required": [
        "application_id",
        "analysis_type"
    ],
    "additionalProperties": False
}

# -------------------------------
# HR Login Schema
# -------------------------------

HR_LOGIN_SCHEMA = {
    "type": "object",
    "properties": {
        "username": {
            "type": "string",
            "minLength": 5,
            "maxLength": 100
        },
        "role": {
            "type": "string",
            "enum": [
                "HR_MANAGER"
            ]
        }
    },
    "required": [
        "username",
        "role"
    ],
    "additionalProperties": False
}

# -------------------------------
# Interview Prompt Schema
# -------------------------------

INTERVIEW_PROMPT_SCHEMA = {
    "type": "object",
    "properties": {
        "candidate_name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
        "job_title": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
        "interview_date": {
            "type": "string",
            "format": "date"
        }
    },
    "required": [
        "candidate_name",
        "job_title",
        "interview_date"
    ],
    "additionalProperties": False
}

# -------------------------------
# Job Offer Schema
# -------------------------------

JOB_OFFER_SCHEMA = {
    "type": "object",
    "properties": {
        "candidate_name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
        "job_title": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
      "salary": {
    "type": "string",
    "pattern": "^[0-9]+\\s(EGP|USD)$"
}
    },
    "required": [
        "candidate_name",
        "job_title",
        "salary"
    ],
    "additionalProperties": False
}

# -------------------------------
# Candidate Schema
# -------------------------------

CANDIDATE_SCHEMA = {

    "type": "object",

    "properties": {

        "name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },

        "email": {
            "type": "string",
            "format": "email"
        },

        "phone": {
            "type": "string",
            "pattern": "^01[0125][0-9]{8}$"
        },

        "experience_years": {
            "type": "integer",
            "minimum": 0,
            "maximum": 40
        },

        "education": {
            "type": "string",
            "minLength": 2
        }

    },

    "required": [
        "name",
        "email",
        "phone",
        "experience_years",
        "education"
    ],

    "additionalProperties": False
}

REJECTION_PROMPT_SCHEMA = {
    "type": "object",

    "properties": {

        "candidate_name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },

        "job_title": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        }

    },

    "required": [
        "candidate_name",
        "job_title"
    ],

    "additionalProperties": False
}

# -------------------------------
# Search Knowledge Base Schema
# -------------------------------
SEARCH_KB_SCHEMA = {
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "minLength": 2,
            "maxLength": 100
        },
        "top_k": {
            "type": "integer",
            "minimum": 1,
            "maximum": 10
        }
    },
    "required": ["query"],
    "additionalProperties": False
}

# -------------------------------
# All Schemas
# -------------------------------

SCHEMAS = {
    "approve_hire": APPROVE_HIRE_SCHEMA,
    "batch_match": BATCH_MATCH_SCHEMA,
    "recruiter_note": RECRUITER_NOTE_SCHEMA,
    "hr_login": HR_LOGIN_SCHEMA,
    "interview_prompt": INTERVIEW_PROMPT_SCHEMA,
    "job_offer": JOB_OFFER_SCHEMA,
    "candidate": CANDIDATE_SCHEMA,
    "rejection_prompt": REJECTION_PROMPT_SCHEMA,
    "search_kb": SEARCH_KB_SCHEMA
}
