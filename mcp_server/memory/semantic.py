from datetime import datetime
from typing import Dict, Optional

from .semantic_models import SemanticFact, FactVersion


class SemanticMemory:

    def __init__(self):
        self.facts: Dict[str, SemanticFact] = {}

    def add_fact(self, fact: SemanticFact) -> None:
        self.facts[fact.fact_key] = fact

    def get_fact(self, fact_key: str) -> Optional[SemanticFact]:
        return self.facts.get(fact_key)

    def update_fact(
        self,
        fact_key: str,
        new_value: str,
        source_episode: str = "",
    ) -> bool:

        fact = self.get_fact(fact_key)

        if fact is None:
            return False

        version = FactVersion(
            version=len(fact.versions) + 1,
            value=new_value,
            source_episode=source_episode,
        )

        fact.versions.append(version)
        fact.current_value = new_value
        fact.updated_at = datetime.now()

        return True

    def search(self, keyword: str):
        keyword = keyword.lower()

        return [
            fact
            for fact in self.facts.values()
            if (
                keyword in fact.fact_key.lower()
                or keyword in fact.current_value.lower()
            )
        ]

    def expire_old_facts(self) -> None:
        now = datetime.now()

        for fact in self.facts.values():
            if now > fact.expires_at and not fact.expired:
                fact.expired = True
                print(f"[EXPIRED] {fact.fact_key}")

    def get_all(self):
        return list(self.facts.values())

    def remove(self, fact_key: str) -> None:
        self.facts.pop(fact_key, None)

    def size(self) -> int:
        return len(self.facts)