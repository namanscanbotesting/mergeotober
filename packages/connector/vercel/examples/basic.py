import asyncio
from packages.connector.vercel.cognee_community_connector_vercel.vercel import vercel_source

async def main():
    source = vercel_source(api_token="test", team_id="team_payments")
    records = source.fetch_records()
    print(f"Fetched {len(records)} Vercel deployments:")
    for r in records:
        print(f" - {r['source_id']}: {r['title']} (status: {r['status']})")

if __name__ == "__main__":
    asyncio.run(main())
