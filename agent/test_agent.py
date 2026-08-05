import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
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

    resources = await agent.list_resources()

    for r in resources.resources:
        print(f"- {r.uri}")

    print("=" * 50)
    print("HR Login")
    print("=" * 50)

    response = await agent.hr_login(
        "Youssef",
        "HR_MANAGER"
    )

    for item in response.content:
        print(item.text)

    print("=" * 50)
    print("Batch Match")
    print("=" * 50)

    response = await agent.batch_match(
    1,
    75,
    True
)

    for item in response.content:
        print(item.text)

    print("=" * 50)
    print("Analyze Note")
    print("=" * 50)

    response = await agent.analyze_note(
        1,
        "sentiment"
    )

    for item in response.content:
        print(item.text)

    print("=" * 50)
    print("Approve Hire with Confirmation (Elicitation)")
    print("=" * 50)

    response = await agent.approve_hire_with_confirmation(
        8,
        "Youssef",
        "Excellent Candidate overall"
    )

    for item in response.content:
        print(item.text)
  



if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception:
        pass


