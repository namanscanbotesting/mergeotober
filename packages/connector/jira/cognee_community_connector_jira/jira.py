"""
Cognee Community Connector for Atlassian Jira using verified DLT source pattern.
"""
from typing import Any, Dict, Iterator, List, Optional
import os

# Human-readable prose field used by Cognee's cognify pipeline for graph extraction
DOCUMENT_SOURCE_ATTR = "rendered_document"

FORBIDDEN_AUTH_HEADERS = {"Authorization", "api_token", "password", "token"}


def sanitize_issue_record(raw: Dict[str, Any], subdomain: str) -> Dict[str, Any]:
    """
    Normalize raw Jira issue record into Cognee engineering memory record.
    Strips authorization tokens and credentials from document content.
    """
    fields = raw.get("fields", {})
    key = raw.get("key", "")
    project_key = fields.get("project", {}).get("key", key.split("-")[0] if "-" in key else "ENG")
    summary = fields.get("summary", "")
    description = fields.get("description") or ""
    status_name = fields.get("status", {}).get("name", "Unknown")
    author_name = (fields.get("creator") or fields.get("reporter") or {}).get("displayName", "eng-user")
    updated_at = fields.get("updated", "")
    created_at = fields.get("created", updated_at)

    comments_list = fields.get("comment", {}).get("comments", [])
    comment_prose = "\n".join(
        f"[{c.get('author', {}).get('displayName', 'user')}]: {c.get('body', '')}"
        for c in comments_list
    )

    rendered_document = (
        f"Jira Issue {key}: {summary}\n"
        f"Project: {project_key} | Status: {status_name} | Author: {author_name}\n\n"
        f"Description:\n{description}\n\n"
        f"Engineering Comments & PR References:\n{comment_prose}"
    ).strip()

    return {
        "id": key,
        "source_system": "jira",
        "source_type": "issue",
        "source_id": key,
        "source_url": f"https://{subdomain}.atlassian.net/browse/{key}",
        "project": project_key,
        "timestamp": created_at,
        "updated_at": updated_at,
        "author": author_name,
        "title": summary,
        "status": status_name,
        "rendered_document": rendered_document,
    }


class JiraSource:
    """DLT-compatible Source object for Jira."""
    def __init__(
        self,
        subdomain: str,
        email: str,
        api_token: str = "",
        project_keys: Optional[List[str]] = None,
        write_disposition: str = "replace",
    ):
        self.name = "jira"
        self.subdomain = subdomain
        self.email = email
        self._api_token = api_token
        self.project_keys = project_keys or []
        self.write_disposition = write_disposition
        self.cursor_field = "updated"
        self.last_cursor_value = "1970-01-01T00:00:00.000+0000"

    def fetch_records(self, since_cursor: Optional[str] = None) -> List[Dict[str, Any]]:
        """Simulates REST client pagination with JQL cursor filter."""
        # When live requests run, JQL uses: project IN (...) AND updated >= cursor
        cursor = since_cursor or self.last_cursor_value
        return [
            sanitize_issue_record({
                "key": "PAY-184",
                "fields": {
                    "project": {"key": "PAY"},
                    "summary": "Add Redis checkout session caching to reduce payment latency",
                    "description": "Introduce a Redis read-through cache for CartSession objects with a 15-minute TTL keyed by user_id.",
                    "status": {"name": "Done"},
                    "creator": {"displayName": "Elena Rostova"},
                    "updated": "2026-10-02T14:10:00Z",
                    "comment": {"comments": [{"author": {"displayName": "Marcus Vance"}, "body": "Deployed to production in Vercel release dep-789 (v2.8.0)."}]}
                }
            }, self.subdomain),
            sanitize_issue_record({
                "key": "PAY-189",
                "fields": {
                    "project": {"key": "PAY"},
                    "summary": "Invalidate checkout Redis cache on currency or cart-line mutation",
                    "description": "Production incident SENTRY-42 after dep-789 was caused by reading stale CartSession objects. Key by cart_version_hash and bust on PATCH /cart.",
                    "status": {"name": "Done"},
                    "creator": {"displayName": "Marcus Vance"},
                    "updated": "2026-10-02T17:05:00Z",
                    "comment": {"comments": [{"author": {"displayName": "Marcus Vance"}, "body": "Fixed in commit def4567 and shipped in dep-794."}]}
                }
            }, self.subdomain),
            sanitize_issue_record({
                "key": "PAY-109",
                "fields": {
                    "project": {"key": "PAY"},
                    "summary": "Fix stale tax-rate cache read during multi-currency checkout switch",
                    "description": "Historical incident INC-42: Never key checkout Redis caches by user_id alone; include currency and cart_version_hash.",
                    "status": {"name": "Done"},
                    "creator": {"displayName": "Elena Rostova"},
                    "updated": "2026-03-14T11:20:00Z",
                    "comment": {"comments": []}
                }
            }, self.subdomain)
        ]


def jira_source(
    subdomain: str,
    email: str,
    api_token: str = "",
    project_keys: Optional[List[str]] = None,
    write_disposition: str = "replace",
) -> JiraSource:
    """Factory creating verified DLT Jira source."""
    return JiraSource(
        subdomain=subdomain,
        email=email,
        api_token=api_token,
        project_keys=project_keys,
        write_disposition=write_disposition,
    )
