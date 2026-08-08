import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import asyncio

from agent import RecruitmentAgent


async def main():

    agent = RecruitmentAgent()

    try:

        # ==========================================
        # Gemini
        # ==========================================

        print("=" * 50)
        print("Gemini")
        print("=" * 50)

        print(
            agent.ask(
                "Say hello in one sentence."
            )
        )

        # ==========================================
        # MCP Connection
        # ==========================================

        await agent.connect_mcp()

        # ==========================================
        # Resources
        # ==========================================

        print("=" * 50)
        print("Resources")
        print("=" * 50)

        resources = await agent.list_resources()

        for resource in resources.resources:
            print(f"- {resource.uri}")

        # ==========================================
        # HR Login
        # ==========================================

        print("=" * 50)
        print("HR Login")
        print("=" * 50)

        response = await agent.hr_login(
            "Youssef",
            "HR_MANAGER"
        )

        for item in response.content:
            if hasattr(item, "text"):
                print(item.text)

        # ==========================================
        # Batch Match
        # ==========================================

        print("=" * 50)
        print("Batch Match")
        print("=" * 50)

        response = await agent.batch_match(
            job_id=1,
            minimum_match=75,
            include_pending=True
        )

        for item in response.content:
            if hasattr(item, "text"):
                print(item.text)

        # ==========================================
        # Analyze Recruiter Note
        # ==========================================

        print("=" * 50)
        print("Analyze Note")
        print("=" * 50)

        response = await agent.analyze_note(
            application_id=1,
            analysis_type="sentiment"
        )

        for item in response.content:
            if hasattr(item, "text"):
                print(item.text)

        # ==========================================
        # Human-in-the-Loop Confirmation
        # ==========================================

        print("=" * 50)
        print("Approve Hire - Human Confirmation")
        print("=" * 50)

        application_id = 8
        approved_by = "Youssef"
        approval_reason = "Excellent Candidate overall"

        print(
            f"\nApplication {application_id} "
            f"is ready for final approval."
        )

        print(
            f"Approved by: {approved_by}"
        )

        print(
            f"Reason: {approval_reason}"
        )

        confirmation = input(
            "\nConfirm hiring? (yes/no): "
        ).strip().lower()

        if confirmation not in {
            "yes",
            "y"
        }:

            print(
                f"\nHiring for application "
                f"{application_id} was cancelled."
            )

            return

        # ==========================================
        # Final Hire
        # ==========================================

        print("=" * 50)
        print("Final Hire")
        print("=" * 50)

        response = await agent.approve_hire(
            application_id=application_id,
            approved_by=approved_by,
            approval_reason=approval_reason
        )

        for item in response.content:
            if hasattr(item, "text"):
                print(item.text)

    finally:

        # ==========================================
        # Close MCP
        # ==========================================

        await agent.close()


if __name__ == "__main__":
    asyncio.run(main())