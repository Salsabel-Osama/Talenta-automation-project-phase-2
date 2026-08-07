from typing import List, Dict


class ShortTermMemory:

    def __init__(self, max_turns: int = 20):
        self.max_turns = max_turns
        self.messages: List[Dict[str, str]] = []

    def add(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content
        })

        self.messages = self.messages[-self.max_turns:]

    def get_context(self):
        return self.messages

    def clear(self):
        self.messages.clear()

    def size(self):
        return len(self.messages)

    def __repr__(self):
        return f"ShortTermMemory(messages={len(self.messages)})"