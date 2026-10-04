import asyncio
from packages.connector.jira.cognee_community_connector_jira.jira import jira_source

async def run_example():
    source = jira_source(
        subdomain="acme-payments",
        email="eng@acme.dev",
        api_token="test-token",
        project_keys=["PAY"]
    )
    records = source.fetch_records()
    print(f"Fetched {len(records)} Jira records:")
    for r in records:
        print(f" - {r['source_id']}: {r['title']}")

if __name__ == "__main__":
    asyncio.run(run_example())
