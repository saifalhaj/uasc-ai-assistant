from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ParsedDocument:
    text: str
    metadata: dict[str, Any]


class Source(ABC):
    """Base class for all document sources.

    Phase 1: UploadSource (user-uploaded files).
    Phase 2: NotamSource, AirHubSource, ThreatSource, DroneSecSource, OsintSource.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def classification(self) -> str:
        pass

    @property
    @abstractmethod
    def tier(self) -> str:
        pass

    @property
    @abstractmethod
    def mode(self) -> str:
        """upload | pull | push"""
        pass

    @abstractmethod
    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        pass
