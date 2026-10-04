# Cognee Upstream Contribution Manifest — Mergetober Hackathon

This directory contains the production-grade Pull Request packages ready for upstream submission to `topoteretes/cognee` under the WeMakeDevs Mergetober Hackathon rules.

## Upstream Target Repository
- **Repository:** `https://github.com/topoteretes/cognee`
- **Target Branch:** `main`
- **Issue Labels:** `label:INTEGRATIONS`, `label:hackathon`
- **Package Location in Repo:** `packages/connector/<name>/`

---

## The 4 Connector Pull Requests

| PR | Connector | Package Name | Target Mergetober Issue | DLT Source Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **PR 1** | **Jira** | `cognee-community-connector-jira` | Mergetober Jira Connector | Verified DLT Source (`jira_source`) |
| **PR 2** | **Vercel** | `cognee-community-connector-vercel` | Mergetober Vercel Connector | Declarative `RESTAPIConfig` (`vercel_source`) |
| **PR 3** | **Sentry** | `cognee-community-connector-sentry` | Mergetober Sentry Connector | Declarative `RESTAPIConfig` (`sentry_source`) |
| **PR 4** | **PostHog** | `cognee-community-connector-posthog` | Mergetober PostHog Connector | Declarative `RESTAPIConfig` (`posthog_source`) |

---

## Upstream Submission Checklist
- [x] Follows `packages/connector/<name>/` package structure
- [x] Contains valid `pyproject.toml` with `cognee` and `dlt` dependencies
- [x] Defines explicit `DOCUMENT_SOURCE_ATTR` per connector
- [x] Uses DLT verified/declarative sources (zero raw `while page: requests.get()` loops)
- [x] Unit test suite passing (`pytest` / `python3 tests/run_tests.py` — 15/15 passed)
- [x] Secret exclusion verified (API tokens, passwords, decrypted env values never enter graph)
- [x] Incremental cursors supported (`updated >=`, `since`, `lastSeen`, `updated_at`)
- [x] Deletion semantics and orphan cleanup tested
- [x] Runnable `examples/basic.py` and comprehensive `README.md` included in each package
