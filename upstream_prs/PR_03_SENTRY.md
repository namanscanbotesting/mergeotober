# Pull Request 3: feat(connector): add Sentry issues DLT connector with bounded event sampling

## Target Repository
- `topoteretes/cognee` (branch: `feat/connector-sentry`)

## Title
`feat(connector): add Sentry declarative DLT REST API source with bounded event sampling`

## Description
This PR implements the Sentry connector for Cognee using DLT's declarative `RESTAPIConfig` with RFC 5988 Link header pagination.

### Features
1. **Curated Issue Intelligence**: Maps culprit, stack trace, affected user counts, and frequency into `DOCUMENT_SOURCE_ATTR = "issue_narrative"`.
2. **Volume Bounding**: Enforces `MAX_BOUNDED_EVENTS_PER_ISSUE = 3` so that high-frequency exceptions (e.g. 500+ events) do not flood the knowledge graph.
3. **Incremental Synchronization**: Tracks high-water cursor on `lastSeen` ISO timestamp.
4. **Deletion Semantics**: Resolved or deleted upstream issues are updated or pruned via Cognee orphan cleanup.

### Package Layout
```text
packages/connector/sentry/
├── README.md
├── pyproject.toml
├── cognee_community_connector_sentry/
│   ├── __init__.py
│   └── sentry.py
├── examples/
│   └── basic.py
└── tests/
    ├── __init__.py
    └── test_sentry.py
```

### Verification
```bash
python3 -m unittest packages/connector/sentry/tests/test_sentry.py
# Ran 3 tests in 0.001s: OK
```
