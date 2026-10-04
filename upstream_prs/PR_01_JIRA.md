# Pull Request 1: feat(connector): add Atlassian Jira DLT connector for Cognee

## Target Repository
- `topoteretes/cognee` (branch: `feat/connector-jira`)

## Title
`feat(connector): add Atlassian Jira verified DLT source connector`

## Description
This PR implements the official Atlassian Jira connector for Cognee as requested in the Mergetober Integrations track.

### Features
1. **Verified DLT Source Pattern**: Uses Jira verified DLT source (`jira_source`) with `OffsetPaginator` (`startAt`/`maxResults`).
2. **Document vs. Relational Ingestion**: Sets `DOCUMENT_SOURCE_ATTR = "rendered_document"` containing issue summary, description, and chronological engineering comments for graph entity extraction.
3. **Incremental Synchronization**: Supports JQL incremental cursors via `updated >= "{cursor_date}"` to fetch only changed issues on subsequent syncs.
4. **Deletion Semantics**: Configured with `write_disposition="replace"` by default so that Cognee orphan cleanup removes issues deleted upstream.
5. **Security & Secret Exclusion**: Credentials (`api_token`, `email`) are bound strictly to DLT `HttpBasicAuth` headers and never appear in document text, graph nodes, or logs.

### Package Layout
```text
packages/connector/jira/
├── README.md
├── pyproject.toml
├── cognee_community_connector_jira/
│   ├── __init__.py
│   └── jira.py
├── examples/
│   └── basic.py
└── tests/
    ├── __init__.py
    └── test_jira.py
```

### Verification
```bash
python3 -m unittest packages/connector/jira/tests/test_jira.py
# Ran 3 tests in 0.001s: OK
```
