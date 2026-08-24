from typing import Dict, List


class ShortTermMemory:
    """
    Rolling short-term conversation memory.

    This memory only keeps the most recent messages.
    Long-term retention decisions are handled by the router.
    """

    def __init__(self, max_turns: int = 20):
        if max_turns < 1:
            raise ValueError("max_turns must be at least 1")

        self.max_turns = max_turns
        self.messages: List[Dict[str, str]] = []

    def add(self, role: str, content: str) -> None:
        self.messages.append(
            {
                "role": role,
                "content": content,
            }
        )

        self.messages = self.messages[-self.max_turns :]

    def get_context(self) -> List[Dict[str, str]]:
        return self.messages.copy()

    def clear(self) -> None:
        self.messages.clear()

    def size(self) -> int:
        return len(self.messages)

    def __repr__(self) -> str:
        return f"ShortTermMemory(messages={len(self.messages)})"