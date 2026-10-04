# Pull Request 4: feat(connector): add PostHog feature flags and insights DLT connector

## Target Repository
- `topoteretes/cognee` (branch: `feat/connector-posthog`)

## Title
`feat(connector): add PostHog declarative DLT REST API source`

## Description
This PR implements the PostHog connector for Cognee using DLT declarative `RESTAPIConfig` for feature flags and experiment telemetry.

### Features
1. **Product Impact Intelligence**: Maps flag key, rollout percentage, and conversion delta into `DOCUMENT_SOURCE_ATTR = "insight_summary"`.
2. **Incremental Synchronization**: Uses `cursor_path: "updated_at"` to fetch only modified feature flags on subsequent syncs.
3. **Bearer Token Isolation**: Personal API keys are strictly configured on the DLT client auth and never leak into document text or graph nodes.

### Package Layout
```text
packages/connector/posthog/
├── README.md
├── pyproject.toml
├── cognee_community_connector_posthog/
│   ├── __init__.py
│   └── posthog.py
├── examples/
│   └── basic.py
└── tests/
    ├── __init__.py
    └── test_posthog.py
```

### Verification
```bash
python3 -m unittest packages/connector/posthog/tests/test_posthog.py
# Ran 3 tests in 0.001s: OK
```
