from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
import uuid


@dataclass
class Episode:

    episode_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    task: str = ""
    summary: str = ""
    outcome: str = ""

    timestamp: datetime = field(default_factory=datetime.now)

    metadata: Dict = field(default_factory=dict)


class EpisodicMemory:

    def __init__(self):
        self.episodes: List[Episode] = []


    def add_episode(self, episode: Episode) -> None:
        
        self.episodes.append(episode)

    def get_all(self) -> List[Episode]:
       
        return self.episodes.copy()

    def get_recent(self, limit: int = 5) -> List[Episode]:
    
        return self.episodes[-limit:]

    def get_by_id(self, episode_id: str) -> Optional[Episode]:
        """
        Find an episode using its ID.
        """
        for episode in self.episodes:
            if episode.episode_id == episode_id:
                return episode
        return None


    def search(self, keyword: str) -> List[Episode]:
        
        keyword = keyword.lower()

        results = []

        for episode in self.episodes:

            if (
                keyword in episode.task.lower()
                or keyword in episode.summary.lower()
                or keyword in episode.outcome.lower()
            ):
                results.append(episode)

        return results

    def remove_episode(self, episode_id: str) -> bool:

        for episode in self.episodes:

            if episode.episode_id == episode_id:

                self.episodes.remove(episode)

                return True

        return False

    def size(self) -> int:
        """
        Number of stored episodes.
        """
        return len(self.episodes)

    def clear(self) -> None:
        """
        Remove every episode.
        """
        self.episodes.clear()