from datetime import datetime
from typing import Dict, List, Optional

from semantic_models import SemanticFact, FactVersion


class SemanticMemory:

    def __init__(self):

        self.facts: Dict[str, SemanticFact] = {}

    # =====================================
    # Add New Fact
    # =====================================

    def add_fact(self, fact: SemanticFact):

        self.facts[fact.fact_key] = fact

    # =====================================
    # Get Fact
    # =====================================

    def get_fact(self, fact_key: str) -> Optional[SemanticFact]:

        return self.facts.get(fact_key)

    # =====================================
    # Update Existing Fact
    # =====================================

    def update_fact(
        self,
        fact_key: str,
        new_value: str,
        source_episode: str = ""
    ):

        fact = self.get_fact(fact_key)

        if fact is None:
            return False

        version = FactVersion(

            version=len(fact.versions) + 1,

            value=new_value,

            source_episode=source_episode

        )

        fact.versions.append(version)

        fact.current_value = new_value

        fact.updated_at = datetime.now()

        return True

    # =====================================
    # Search
    # =====================================

    def search(self, keyword: str):

        keyword = keyword.lower()

        results = []

        for fact in self.facts.values():

            if (

                keyword in fact.fact_key.lower()

                or keyword in fact.current_value.lower()

            ):

                results.append(fact)

        return results

    # =====================================
    # Expire Facts
    # =====================================

    def expire_old_facts(self):

        now = datetime.now()

        for fact in self.facts.values():

            if now > fact.expires_at and not fact.expired:

                fact.expired = True

                print(f"[EXPIRED] {fact.fact_key}")

    # =====================================
    # Get All
    # =====================================

    def get_all(self):

        return list(self.facts.values())

    # =====================================
    # Remove
    # =====================================

    def remove(self, fact_key):

        if fact_key in self.facts:

            del self.facts[fact_key]

    # =====================================
    # Size
    # =====================================

    def size(self):

        return len(self.facts)