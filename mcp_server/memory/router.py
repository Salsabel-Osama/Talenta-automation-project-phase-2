from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List

from .episodic import Episode, EpisodicMemory
from .short_term_memory import ShortTermMemory


@dataclass
class RoutingDecision:
    item: str
    decision: str
    reason: str
    timestamp: datetime = field(default_factory=datetime.now)


class PromoteOrDropRouter:
    """
    Decide whether an item evicted from short-term memory
    should be promoted to episodic memory or dropped.

    The router does NOT write to semantic memory.
    """

    def __init__(self, episodic_memory: EpisodicMemory):
        self.episodic_memory = episodic_memory
        self.decision_log: List[RoutingDecision] = []

    def evaluate_importance(self, item: Any) -> bool:
        if isinstance(item, dict):
            content = str(item.get("content", ""))
            role = str(item.get("role", ""))
        else:
            content = str(item)
            role = ""

        # User/system messages are considered more important.
        # Longer messages are more likely to contain useful context.
        return role in {"user", "system"} or len(content) > 30

    def log_decision(
        self,
        item: Any,
        decision: str,
        reason: str,
    ) -> RoutingDecision:

        entry = RoutingDecision(
            item=str(item),
            decision=decision,
            reason=reason,
        )

        self.decision_log.append(entry)

        return entry

    def process_aging_item(self, item: Any) -> str:
        important = self.evaluate_importance(item)

        if important:
            decision = "promote"
            reason = (
                "Important event: message carries high "
                "retention value for episodic context."
            )
        else:
            decision = "drop"
            reason = (
                "Not important: routine turn with low "
                "long-term retention value."
            )

        self.log_decision(
            item=item,
            decision=decision,
            reason=reason,
        )

        if decision == "promote":
            if isinstance(item, dict):
                content = str(item.get("content", ""))
                role = str(item.get("role", "unknown"))
            else:
                content = str(item)
                role = "unknown"

            episode = Episode(
                task="ShortTermMemory Overflow Eviction",
                summary=f"[{role.upper()}] {content}",
                outcome=(
                    "Promoted to Episodic Memory after "
                    "ShortTermMemory overflow."
                ),
                metadata={
                    "routed_at": datetime.now().isoformat(),
                    "source": "short_term_memory",
                },
            )

            self.episodic_memory.add_episode(episode)

        return decision

    def get_grader_logs(self) -> List[Dict[str, Any]]:
        return [
            {
                "item": log.item,
                "decision": log.decision,
                "reason": log.reason,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in self.decision_log
        ]


class ManagedShortTermMemory(ShortTermMemory):
    """
    Short-term memory with promote-or-drop routing.

    When the buffer overflows, the oldest message is removed
    and passed to the router.
    """

    def __init__(
        self,
        router: PromoteOrDropRouter,
        max_turns: int = 20,
    ):
        super().__init__(max_turns=max_turns)
        self.router = router

    def add(self, role: str, content: str) -> None:
        self.messages.append(
            {
                "role": role,
                "content": content,
            }
        )

        if len(self.messages) > self.max_turns:
            aging_item = self.messages.pop(0)
            self.router.process_aging_item(aging_item)