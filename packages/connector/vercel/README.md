# Cognee Community Connector — Vercel

Declarative DLT source connector for ingesting Vercel release deployments and commit SHAs into Cognee.

## Security Guarantee
- `scrub_vercel_deployment` removes all decrypted environment variable values. Only key names are retained.
- Uses `DOCUMENT_SOURCE_ATTR = "deployment_summary"`.
- Supports incremental sync via `since` parameter (created epoch ms).
