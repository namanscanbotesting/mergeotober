"""
Option A: Ingestion Pipeline (demo/ingest_demo.py)
Run:
    uv pip install "cognee[gliner]" dlt
    python demo/ingest_demo.py
"""

import asyncio
import os
import cognee

# In a full setup, import connector sources:
# from cognee_community_connector_jira.jira import jira_source
# from cognee_community_connector_vercel.vercel import vercel_source
# from cognee_community_connector_sentry.sentry import sentry_source
# from cognee_community_connector_posthog.posthog import posthog_source

DATASET_NAME = "devmemory_pay"


async def run_ingestion():
    print("Step 1: Staging source data into Cognee dataset...")
    
    # Adding raw records or DLT source generator
    # await cognee.add(jira_source(...), dataset_name=DATASET_NAME)
    # await cognee.add(vercel_source(...), dataset_name=DATASET_NAME)
    # await cognee.add(sentry_source(...), dataset_name=DATASET_NAME)
    # await cognee.add(posthog_source(...), dataset_name=DATASET_NAME)
    
    print("Step 2: Running cognee.cognify() to extract knowledge graph & embeddings...")
    await cognee.cognify(datasets=[DATASET_NAME])
    
    print("Cognee knowledge graph successfully constructed!")


if __name__ == "__main__":
    asyncio.run(run_ingestion())
