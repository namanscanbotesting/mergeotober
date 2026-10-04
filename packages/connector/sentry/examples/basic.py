import asyncio
from packages.connector.sentry.cognee_community_connector_sentry.sentry import sentry_source

async def main():
    source = sentry_source(org_slug="acme-payments", auth_token="test")
    records = source.fetch_records()
    print(f"Fetched {len(records)} Sentry issues:")
    for r in records:
        print(f" - {r['source_id']}: {r['title']} ({r['event_frequency']} events)")

if __name__ == "__main__":
    asyncio.run(main())
