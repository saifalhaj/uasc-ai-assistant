"""Phase 2+ source stubs. Not implemented — added now so the source registry
compiles and callers can reference these types without a refactor later."""

from .base import ParsedDocument, Source


class NotamSource(Source):
    """NOTAM feed integration. Phase 2."""

    @property
    def name(self) -> str:
        return "notam"

    @property
    def classification(self) -> str:
        return "public"

    @property
    def tier(self) -> str:
        return "authoritative"

    @property
    def mode(self) -> str:
        return "pull"

    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        raise NotImplementedError("NotamSource is Phase 2")


class AirHubSource(Source):
    """AirHub integration. Phase 2."""

    @property
    def name(self) -> str:
        return "airhub"

    @property
    def classification(self) -> str:
        return "internal"

    @property
    def tier(self) -> str:
        return "authoritative"

    @property
    def mode(self) -> str:
        return "pull"

    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        raise NotImplementedError("AirHubSource is Phase 2")


class ThreatSource(Source):
    """Threat intelligence feed. Phase 2."""

    @property
    def name(self) -> str:
        return "threat"

    @property
    def classification(self) -> str:
        return "restricted"

    @property
    def tier(self) -> str:
        return "authoritative"

    @property
    def mode(self) -> str:
        return "push"

    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        raise NotImplementedError("ThreatSource is Phase 2")


class DroneSecSource(Source):
    """DroneSec feed. Phase 2."""

    @property
    def name(self) -> str:
        return "dronesec"

    @property
    def classification(self) -> str:
        return "internal"

    @property
    def tier(self) -> str:
        return "vetted"

    @property
    def mode(self) -> str:
        return "pull"

    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        raise NotImplementedError("DroneSecSource is Phase 2")


class OsintSource(Source):
    """OSINT aggregation. Phase 2."""

    @property
    def name(self) -> str:
        return "osint"

    @property
    def classification(self) -> str:
        return "public"

    @property
    def tier(self) -> str:
        return "open"

    @property
    def mode(self) -> str:
        return "pull"

    async def parse(self, raw: bytes, content_type: str) -> ParsedDocument:
        raise NotImplementedError("OsintSource is Phase 2")
