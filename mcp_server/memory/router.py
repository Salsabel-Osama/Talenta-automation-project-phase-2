from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List
from episodic import Episode, EpisodicMemory  
from short_term_memory  import ShortTermMemory  


@dataclass
class RoutingDecision:
    item: str
    decision: str  
    reason: str
    timestamp: datetime = field(default_factory=datetime.now)


class PromoteOrDropRouter:

    def __init__(self, episodic_memory: EpisodicMemory):
        self.episodic_memory = episodic_memory  
        self.decision_log: List[RoutingDecision] = []

    def evaluate_importance(self, item: Any) -> bool:
    
        if isinstance(item, dict):
            content = item.get("content", "")
            role = item.get("role", "")
        else:
            content = str(item)
            role = ""

        if role in ["user", "system"] or len(content) > 30:
            return True

        return False

    def log_decision(self, item: Any, decision: str, reason: str) -> RoutingDecision:

        entry = RoutingDecision(item=str(item), decision=decision, reason=reason)
        self.decision_log.append(entry)
        return entry

    def process_aging_item(self, item: Any) -> str:
    
        important = self.evaluate_importance(item)

        if important:
            decision = "promote"
            reason = "Important event: Message carries high retention value for episodic context."
        else:
            decision = "drop"
            reason = "Not important: Routine turn with low long-term value."

        self.log_decision(item=item, decision=decision, reason=reason)

        if decision == "promote":
            content_str = item.get("content", str(item)) if isinstance(item, dict) else str(item)
            role_str = item.get("role", "unknown") if isinstance(item, dict) else "unknown"

            episode = Episode(  
                task="ShortTermMemory Overflow Eviction", 
                summary=f"[{role_str.upper()}] {content_str}",
                outcome="Promoted to Episodic Memory upon ShortTermMemory overflow.", 
                metadata={"routed_at": datetime.now().isoformat()},
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
 
    def __init__(self, router: PromoteOrDropRouter, max_turns: int = 20): 
        super().__init__(max_turns=max_turns)  
        self.router = router

    def add(self, role: str, content: str) -> None:  
        self.messages.append({"role": role, "content": content})  

        if len(self.messages) > self.max_turns: 
            aging_item = self.messages.pop(0)
            self.router.process_aging_item(aging_item)

