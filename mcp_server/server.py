from mcp.server.fastmcp import FastMCP

# Capability negotiation & Transports
mcp = FastMCP("TalentaRecruitmentServer")

if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport")
    mcp.run(transport="stdio")
    

# Resources
@mcp.resource("talenta://policies/hiring")
def get_hiring_policies() -> str:
    """ Talenta's official hiring policies and constraints """
    
    return """
    TALENTA OFFICIAL HIRING POLICIES & EVALUATION RULES:

    1. Experience Constraint: 
       A candidate MUST NOT be accepted if their `experience_years` (from Candidates table) is strictly less than the job's `min_experience` (from Jobs table). Such applications should be marked as 'REJECTED'.

    2. Education Matching:
       The candidate's `education` should closely match the job's `required_degree`. If it is completely unrelated, flag the application for manual review ('PENDING').

    3. Match Score Threshold:
       Applications with a calculated `match_score` (based on overlapping CandidateSkills and JobSkills) below 75.00% cannot be automatically accepted. They must remain 'PENDING' for HR review.

    4. Zero-Tolerance Policy:
       Any candidate applying for a job in the 'Cybersecurity' department without 'Linux' or 'Networking' skills must be 'REJECTED' immediately.

    5. Human-in-the-Loop Rule:
       The AI is authorized to automatically reject candidates who violate rules 1 and 4. However, moving an application to 'ACCEPTED' requires explicit confirmation from a logged-in HR Manager.
    """
    

# run server
if __name__ == "__main__":
    print("Starting Talenta MCP Server on stdio transport...")
    mcp.run(transport="stdio")