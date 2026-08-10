import json
from datetime import datetime

import google.generativeai as genai

from agent.config import (
    GEMINI_API_KEY,
    MODEL_NAME
)

from memory.episodic import EpisodicMemory
from memory.semantic import SemanticMemory
from memory.semantic_models import (
    SemanticFact,
    FactVersion
)

genai.configure(api_key=GEMINI_API_KEY)


class ConsolidationEngine:

    def __init__(
        self,
        episodic_store: EpisodicMemory,
        semantic_store: SemanticMemory
    ):

        self.episodic = episodic_store
        self.semantic = semantic_store

        # Keep track of already consolidated episodes
        self.processed_episodes = set()

        self.model = genai.GenerativeModel(
            MODEL_NAME
        )

    # ==================================================
    # Periodic Consolidation
    # ==================================================

    def consolidate_if_needed(self, threshold=5):

        unprocessed = [

            episode

            for episode in self.episodic.get_all()

            if episode.episode_id not in self.processed_episodes

        ]

        if len(unprocessed) < threshold:
            return

        self.consolidate()

    # ==================================================
    # Run Consolidation
    # ==================================================

    def consolidate(self):

        episodes = self.episodic.get_all()

        for episode in episodes:

            if episode.episode_id in self.processed_episodes:
                continue

            self.process_episode(episode)

            self.processed_episodes.add(
                episode.episode_id
            )

        self.semantic.expire_old_facts()

    # ==================================================
    # Reset Consolidation Cache
    # ==================================================

    def reset_processed(self):

        self.processed_episodes.clear()

    # ==================================================
    # Process One Episode
    # ==================================================

    def process_episode(self, episode):

        facts = self.extract_facts(episode)

        for fact in facts:

            self.upsert_fact(

                fact_key=fact["fact_key"],

                value=fact["fact_value"],

                episode_id=episode.episode_id

            )

    # ==================================================
    # Extract Semantic Facts
    # ==================================================

    def extract_facts(self, episode):

        prompt = f"""
You are building Semantic Memory for Talenta AI Recruitment Assistant.

Extract ALL stable long-term reusable facts.

Do NOT extract:

- greetings
- timestamps
- IDs
- temporary interview events
- one-time actions
- conversation details

Extract reusable facts such as:

- candidate_status
- preferred_role
- required_skill
- hiring_policy
- recruiter_preference
- department_rule

There may be multiple facts.

If no reusable fact exists, return:

[]

Return ONLY valid JSON.

Example

[
 {{
   "fact_key":"candidate_status",
   "fact_value":"Accepted"
 }},
 {{
   "fact_key":"preferred_role",
   "fact_value":"Backend Developer"
 }}
]

Episode

Task:
{episode.task}

Summary:
{episode.summary}

Outcome:
{episode.outcome}
"""

        try:

            response = self.model.generate_content(prompt)

            text = response.text.strip()

            if text.startswith("```json"):

                text = (
                    text
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            return json.loads(text)

        except Exception as e:

            print("Fact Extraction Error:", e)

            return []

    # ==================================================
    # Insert / Update Semantic Fact
    # ==================================================

    def upsert_fact(

        self,

        fact_key,

        value,

        episode_id

    ):

        existing = self.semantic.get_fact(fact_key)

        # ------------------------
        # New Fact
        # ------------------------

        if existing is None:

            version = FactVersion(

                version=1,

                value=value,

                source_episode=episode_id

            )

            fact = SemanticFact(

                fact_key=fact_key,

                current_value=value,

                versions=[version],

                metadata={

                    "created_from": episode_id,

                    "last_source": episode_id,

                    "conflict": False,

                    "resolution": None

                }

            )

            self.semantic.add_fact(fact)

            print(f"[NEW FACT] {fact_key} -> {value}")

            return

        # ------------------------
        # Same Fact
        # ------------------------

        if existing.current_value == value:

            return

        # ------------------------
        # Conflict
        # ------------------------

        self.resolve_conflict(

            existing,

            value,

            episode_id

        )

    # ==================================================
    # Conflict Resolution
    # ==================================================

    def resolve_conflict(

        self,

        fact,

        new_value,

        episode_id

    ):

        print("\n========== Conflict Detected ==========")

        print(f"Fact : {fact.fact_key}")

        print(f"Old  : {fact.current_value}")

        print(f"New  : {new_value}")

        version = FactVersion(

            version=len(fact.versions) + 1,

            value=new_value,

            source_episode=episode_id

        )

        fact.versions.append(version)

        fact.current_value = new_value

        fact.updated_at = datetime.now()

        resolution = "Latest Version Wins"

        fact.metadata["last_source"] = episode_id

        fact.metadata["conflict"] = True

        fact.metadata["resolution"] = resolution

        fact.metadata["last_conflict"] = datetime.now().isoformat()

        print(f"Resolution : {resolution}")

        print("=======================================\n")

    # ==================================================
    # Statistics
    # ==================================================

    def statistics(self):

        facts = self.semantic.get_all()

        return {

            "facts": len(facts),

            "processed_episodes": len(self.processed_episodes),

            "expired": sum(

                fact.expired

                for fact in facts

            ),

            "conflicts": sum(

                1

                for fact in facts

                if fact.metadata.get("conflict")

            )

        }

    # ==================================================
    # Show Semantic Memory
    # ==================================================

    def show_semantic_memory(self):

        print()

        print("=" * 70)

        print("SEMANTIC MEMORY")

        print("=" * 70)

        for fact in self.semantic.get_all():

            print(f"Fact Key      : {fact.fact_key}")

            print(f"Current Value : {fact.current_value}")

            print(f"Expired       : {fact.expired}")

            print(f"Conflict      : {fact.metadata.get('conflict', False)}")

            print(f"Resolution    : {fact.metadata.get('resolution')}")

            print("Versions:")

            for version in fact.versions:

                print(

                    f"   V{version.version}"

                    f"  {version.value}"

                    f"  ({version.created_at.strftime('%Y-%m-%d %H:%M')})"

                )

            print("-" * 70)