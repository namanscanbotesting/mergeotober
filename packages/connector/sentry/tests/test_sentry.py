import unittest
from packages.connector.sentry.cognee_community_connector_sentry.sentry import (
    sentry_source,
    normalize_sentry_issue,
    DOCUMENT_SOURCE_ATTR,
    MAX_BOUNDED_EVENTS_PER_ISSUE,
)


class TestSentryConnector(unittest.TestCase):
    def test_document_source_attr_defined(self):
        self.assertEqual(DOCUMENT_SOURCE_ATTR, "issue_narrative")

    def test_bounded_event_sample_cap(self):
        """Verify high-frequency issues are capped to MAX_BOUNDED_EVENTS_PER_ISSUE (3)."""
        raw_issue = {
            "shortId": "SENTRY-42",
            "title": "CurrencyMismatchError",
            "culprit": "checkout.service.create_intent",
            "count": 418,
            "userCount": 164,
            "recent_events": [{"eventID": f"evt_{i}", "release": "v2.8.0"} for i in range(500)],
        }
        normalized = normalize_sentry_issue(raw_issue)
        self.assertEqual(normalized["bounded_sample_count"], MAX_BOUNDED_EVENTS_PER_ISSUE)
        self.assertEqual(normalized["event_frequency"], 418)
        self.assertIn("Bounded Event Samples (3/3 max)", normalized[DOCUMENT_SOURCE_ATTR])

    def test_source_factory_initialization(self):
        source = sentry_source(org_slug="acme-payments", auth_token="token_xyz")
        self.assertEqual(source.name, "sentry")
        records = source.fetch_records()
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["source_id"], "SENTRY-42")


if __name__ == "__main__":
    unittest.main()
