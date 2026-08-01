import asyncio
from agent import RecruitmentAgent


async def main():

    agent = RecruitmentAgent()

    print("=" * 50)
    print("Gemini")
    print("=" * 50)

    print(agent.ask("Say hello in one sentence."))

    await agent.connect_mcp()

    print("=" * 50)
    print("Resources")
    print("=" * 50)

    print(await agent.list_resources())

    print("=" * 50)
    print("HR Login")
    print("=" * 50)

    print(
        await agent.hr_login(
            "Youssef",
            "HR_MANAGER"
        )
    )

    print("=" * 50)
    print("Batch Match")
    print("=" * 50)

    print(
        await agent.batch_match(
            1,
            75,
            True
        )
    )

    print("=" * 50)
    print("Analyze Note")
    print("=" * 50)

    print(
        await agent.analyze_note(
            1,
            "sentiment"
        )
    )

    print("=" * 50)
    print("Approve Hire")
    print("=" * 50)

    print(
        await agent.approve_hire(
            4,
            "Youssef",
            "Excellent Candidate overall"
        )
    )

    await agent.close()


asyncio.run(main())