# Cognee Community Connector — Sentry

Declarative DLT source connector for ingesting production issues into Cognee.

## Volume Bounding
- Strict cap of `MAX_BOUNDED_EVENTS_PER_ISSUE = 3` ensures graph node stability while preserving aggregate exception counts.
- `DOCUMENT_SOURCE_ATTR = "issue_narrative"`.
