from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class UploadResult:
    key: str
    public_url: str
    size_bytes: int


class ObjectStore(ABC):
    """Provider-agnostic object storage interface.

    Phase 1 implementation: SupabaseStorageStore.
    Future: AzureBlobStore (Azure UAE North), LocalFileStore.
    """

    @abstractmethod
    async def upload(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str,
    ) -> UploadResult:
        pass

    @abstractmethod
    async def get_public_url(self, bucket: str, key: str) -> str:
        pass

    @abstractmethod
    async def delete(self, bucket: str, key: str) -> None:
        pass
