"""Background ingestion worker.

Phase 1: processes documents queued from the upload API.
Deployed as a Render background worker.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../apps/api"))

from dotenv import load_dotenv

load_dotenv()

from dependencies import build_container


async def main() -> None:
    print("[ingestion-worker] Starting — Phase 1 runs inline in the API; this worker is a Phase 2 placeholder.")
    container = await build_container()
    print("[ingestion-worker] Container built. Listening for queued documents...")

    # Phase 2: poll documents table for status='queued' and process them here.
    # Phase 1: indexing runs synchronously in the upload API endpoint.
    while True:
        await asyncio.sleep(30)
        print("[ingestion-worker] Heartbeat OK")


if __name__ == "__main__":
    asyncio.run(main())
