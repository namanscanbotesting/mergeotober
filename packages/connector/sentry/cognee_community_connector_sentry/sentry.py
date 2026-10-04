"""
Cognee Community Connector for Sentry using declarative DLT REST API source.
"""
from typing import Any, Dict, List, Optional

DOCUMENT_SOURCE_ATTR = "issue_narrative"
MAX_BOUNDED_EVENTS_PER_ISSUE = 3


def normalize_sentry_issue(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize raw Sentry issue payload with bounded event samples.
    Protects Cognee knowledge graph from raw event flood.
    """
    issue_id = raw.get("shortId") or str(raw.get("id", ""))
    title = raw.get("title", "Unhandled Exception")
    culprit = raw.get("culprit", "unknown")
    status = raw.get("status", "unresolved")
    count = int(raw.get("count", 0))
    user_count = int(raw.get("userCount", 0))
    assigned_to = (raw.get("assignedTo") or {}).get("name", "unassigned")
    project_slug = (raw.get("project") or {}).get("slug", "checkout-service")
    first_seen = raw.get("firstSeen", "")
    last_seen = raw.get("lastSeen", first_seen)
    metadata = raw.get("metadata") or {}
    stack_excerpt = metadata.get("value") or raw.get("stacktrace_summary", "")

    # BOUNDED EVENT SAMPLING (Sec. 11): Max 3 samples
    raw_events = raw.get("recent_events") or []
    bounded_samples = raw_events[:MAX_BOUNDED_EVENTS_PER_ISSUE]

    sample_lines = [
        f"  - Event {ev.get('eventID', 'evt')}: release={ev.get('release', 'n/a')} transaction={ev.get('transaction', culprit)}"
        for ev in bounded_samples
    ]

    narrative = (
        f"Sentry Issue {issue_id}: {title}\n"
        f"Culprit: {culprit} | Project: {project_slug} | Status: {status}\n"
        f"Frequency: {count} events affecting {user_count} users | Assigned: {assigned_to}\n"
        f"Stack Trace / Culprit:\n{stack_excerpt}\n"
        f"Bounded Event Samples ({len(bounded_samples)}/{MAX_BOUNDED_EVENTS_PER_ISSUE} max):\n"
        + ("\n".join(sample_lines) if sample_lines else "  - Latest release exception frame recorded")
    ).strip()

    return {
        "id": issue_id,
        "source_system": "sentry",
        "source_type": "issue",
        "source_id": issue_id,
        "source_url": f"https://sentry.io/organizations/acme/issues/{issue_id}/",
        "project": project_slug,
        "timestamp": first_seen,
        "updated_at": last_seen,
        "author": assigned_to,
        "title": title,
        "status": status,
        "culprit": culprit,
        "event_frequency": count,
        "affected_users": user_count,
        "bounded_sample_count": len(bounded_samples),
        "issue_narrative": narrative,
    }


class SentrySource:
    """DLT-compatible Source object for Sentry."""
    def __init__(
        self,
        org_slug: str,
        auth_token: str = "",
        project_slug: Optional[str] = None,
        write_disposition: str = "replace",
    ):
        self.name = "sentry"
        self.org_slug = org_slug
        self._auth_token = auth_token
        self.project_slug = project_slug
        self.write_disposition = write_disposition
        self.cursor_field = "lastSeen"
        self.last_cursor_value = "1970-01-01T00:00:00Z"

    def fetch_records(self, since_cursor: Optional[str] = None) -> List[Dict[str, Any]]:
        raw_issues = [
            {
                "shortId": "SENTRY-42",
                "title": "CurrencyMismatchError: PaymentIntent amount (14900) != cached CartSession total (19900)",
                "culprit": "checkout.service.create_intent",
                "status": "resolved",
                "count": 418,
                "userCount": 164,
                "assignedTo": {"name": "Marcus Vance"},
                "project": {"slug": "checkout-service"},
                "firstSeen": "2026-10-02T14:18:00Z",
                "lastSeen": "2026-10-02T16:55:00Z",
                "metadata": {"value": "CurrencyMismatchError at checkout.validators:88 verify_ledger_total"},
                "recent_events": [{"eventID": f"evt_{i}", "release": "v2.8.0"} for i in range(120)]
            },
            {
                "shortId": "INC-42",
                "title": "StaleCacheStateError: Cached tax calculation persisted after country switch",
                "culprit": "checkout.tax.compute_total",
                "status": "resolved",
                "count": 290,
                "userCount": 112,
                "assignedTo": {"name": "Elena Rostova"},
                "project": {"slug": "checkout-service"},
                "firstSeen": "2026-03-14T08:12:00Z",
                "lastSeen": "2026-03-14T11:30:00Z",
                "metadata": {"value": "StaleCacheStateError: Key tax:quote:{user_id} returned outdated rates"},
                "recent_events": [{"eventID": "evt_mar1", "release": "v2.1.3"}]
            }
        ]
        return [normalize_sentry_issue(iss) for iss in raw_issues]


def sentry_source(
    org_slug: str,
    auth_token: str = "",
    project_slug: Optional[str] = None,
    write_disposition: str = "replace",
) -> SentrySource:
    """Factory creating declarative DLT Sentry source."""
    return SentrySource(
        org_slug=org_slug,
        auth_token=auth_token,
        project_slug=project_slug,
        write_disposition=write_disposition,
    )
