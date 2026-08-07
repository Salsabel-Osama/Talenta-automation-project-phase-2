from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict
import uuid


@dataclass
class FactVersion:
    """
    Represents one historical version of a semantic fact.
    """

    version: int

    value: str

    created_at: datetime = field(default_factory=datetime.now)

    source_episode: str = ""


@dataclass
class SemanticFact:
    """
    Stable knowledge extracted from episodic memory.
    """

    fact_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    fact_key: str = ""

    current_value: str = ""

    versions: List[FactVersion] = field(default_factory=list)

    metadata: Dict = field(default_factory=dict)

    created_at: datetime = field(default_factory=datetime.now)

    updated_at: datetime = field(default_factory=datetime.now)

    expires_at: datetime = field(
        default_factory=lambda: datetime.now() + timedelta(days=365)
    )

    expired: bool = False