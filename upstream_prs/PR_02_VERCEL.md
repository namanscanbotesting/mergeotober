# Pull Request 2: feat(connector): add Vercel deployment DLT connector with secret scrubbing

## Target Repository
- `topoteretes/cognee` (branch: `feat/connector-vercel`)

## Title
`feat(connector): add Vercel deployment declarative DLT REST API source`

## Description
This PR implements the Vercel connector for Cognee using DLT's declarative `RESTAPIConfig` on the `/v6/deployments` endpoint.

### Features
1. **Declarative DLT REST API**: Uses DLT declarative configuration without manual requests loops.
2. **Document vs. Relational Ingestion**: Sets `DOCUMENT_SOURCE_ATTR = "deployment_summary"` summarizing deployment UID, state, commit SHA, and author.
3. **Incremental Synchronization**: Uses `incremental: { cursor_path: "created", start_param: "since" }` in epoch milliseconds.
4. **Mandatory Secret Exclusion**: Implements `scrub_vercel_deployment` mapping step. Proves that environment variable values (`value`, `decryptedValue`, `secret`) are scrubbed before `cognee.add()`. Only key names are retained.
5. **Orphan Cleanup**: Supports snapshot replacement so pruned deployments are removed from the graph.

### Package Layout
```text
packages/connector/vercel/
├── README.md
├── pyproject.toml
├── cognee_community_connector_vercel/
│   ├── __init__.py
│   └── vercel.py
├── examples/
│   └── basic.py
└── tests/
    ├── __init__.py
    └── test_vercel.py
```

### Verification
```bash
python3 -m unittest packages/connector/vercel/tests/test_vercel.py
# Ran 3 tests in 0.001s: OK
```
