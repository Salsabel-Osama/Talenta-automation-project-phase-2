from dataclasses import dataclass


@dataclass
class Scratchpad:
    current_plan: str = ""
    current_subgoal: str = ""
    working_state: str = ""

    def set_plan(self, plan: str) -> None:
        self.current_plan = plan

    def set_subgoal(self, subgoal: str) -> None:
        self.current_subgoal = subgoal

    def set_working_state(self, state: str) -> None:
        self.working_state = state

    def get_context(self) -> dict:
        return {
            "plan": self.current_plan,
            "subgoal": self.current_subgoal,
            "working_state": self.working_state,
        }

    def clear(self) -> None:
        self.current_plan = ""
        self.current_subgoal = ""
        self.working_state = ""

    def __str__(self) -> str:
        return (
            f"Plan: {self.current_plan}\n"
            f"Sub-goal: {self.current_subgoal}\n"
            f"Working State: {self.working_state}"
        )