from supabase import AsyncClient

from interfaces.object_store import ObjectStore, UploadResult


class SupabaseStorageStore(ObjectStore):
    """Supabase Storage implementation of ObjectStore.

    Future swap-in: AzureBlobStore (Azure UAE North), LocalFileStore.
    """

    def __init__(self, client: AsyncClient) -> None:
        self._client = client

    async def upload(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str,
    ) -> UploadResult:
        response = await self._client.storage.from_(bucket).upload(
            path=key,
            file=data,
            file_options={"content-type": content_type, "upsert": "true"},
        )

        public_url = self._client.storage.from_(bucket).get_public_url(key)

        return UploadResult(
            key=key,
            public_url=public_url,
            size_bytes=len(data),
        )

    async def get_public_url(self, bucket: str, key: str) -> str:
        return self._client.storage.from_(bucket).get_public_url(key)

    async def delete(self, bucket: str, key: str) -> None:
        await self._client.storage.from_(bucket).remove([key])
