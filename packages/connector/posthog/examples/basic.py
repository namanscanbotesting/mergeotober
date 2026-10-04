import asyncio
from packages.connector.posthog.cognee_community_connector_posthog.posthog import posthog_source

async def main():
    source = posthog_source(project_id="94812", personal_api_key="test")
    records = source.fetch_records()
    print(f"Fetched {len(records)} PostHog feature flags:")
    for r in records:
        print(f" - {r['source_id']}: {r['title']}")

if __name__ == "__main__":
    asyncio.run(main())
