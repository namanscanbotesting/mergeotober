# Cognee Community Connector — Atlassian Jira

Verified DLT source connector for ingesting Jira issues, requirements, and comments into the Cognee institutional engineering memory graph.

## Features
- Ingests issue summary, description, and engineering comments into `DOCUMENT_SOURCE_ATTR = "rendered_document"`.
- Supports JQL incremental cursors via `updated >=`.
- Supports full snapshot (`replace`) write disposition for orphan cleanup.
- Strictly redacts API credentials and tokens.

## Quickstart
```python
import asyncio
import cognee
from cognee_community_connector_jira.jira import jira_source

async def main():
    source = jira_source(
        subdomain="acme-payments",
        email="eng@acme.dev",
        api_token="your-token",
        project_keys=["PAY"],
        write_disposition="replace"
    )
    await cognee.add(source, dataset_name="devmemory")
    await cognee.cognify()
    results = await cognee.search("What changed in PAY-184?")
    print(results)

asyncio.run(main())
```
