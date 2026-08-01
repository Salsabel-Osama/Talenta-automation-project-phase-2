import google.generativeai as genai

from config import (
    GEMINI_API_KEY,
    MODEL_NAME,
    TEMPERATURE,
    MAX_OUTPUT_TOKENS
)

from client import MCPClient


genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": TEMPERATURE,
        "max_output_tokens": MAX_OUTPUT_TOKENS
    }
)


class RecruitmentAgent:

    def __init__(self):
        self.model = model
        self.client = MCPClient()

    # ===========================
    # Gemini
    # ===========================

    def ask(self, prompt: str) -> str:

        try:
            response = self.model.generate_content(prompt)
            return response.text

        except Exception as e:
            return f"Error: {e}"

    # ===========================
    # MCP
    # ===========================

    async def connect_mcp(self):
        await self.client.connect()

    async def close(self):
        await self.client.close()

    # ===========================
    # Resources
    # ===========================

    async def list_resources(self):
        return await self.client.list_resources()

    async def read_resource(self, uri):
        return await self.client.read_resource(uri)

    # ===========================
    # Tools
    # ===========================

    async def hr_login(self, username, role):

        return await self.client.call_tool(
            "simulate_hr_login",
            {
                "username": username,
                "role": role
            }
        )

    async def batch_match(
        self,
        job_id,
        minimum_match=75,
        include_pending=True
    ):

        return await self.client.call_tool(
            "batch_match_candidates",
            {
                "job_id": job_id,
                "minimum_match": minimum_match,
                "include_pending": include_pending
            }
        )

    async def analyze_note(
        self,
        application_id,
        analysis_type="sentiment"
    ):

        return await self.client.call_tool(
            "analyze_recruiter_note",
            {
                "application_id": application_id,
                "analysis_type": analysis_type
            }
        )

    async def approve_hire(
        self,
        application_id,
        approved_by,
        approval_reason
    ):

        return await self.client.call_tool(
            "approve_final_hire",
            {
                "application_id": application_id,
                "approved_by": approved_by,
                "approval_reason": approval_reason
            }
        )

    async def approve_hire_with_confirmation(
        self,
        application_id,
        approved_by,
        approval_reason
    ):

        return await self.client.call_tool(
            "approve_final_hire_with_confirmation",
            {
                "application_id": application_id,
                "approved_by": approved_by,
                "approval_reason": approval_reason
            }
        )