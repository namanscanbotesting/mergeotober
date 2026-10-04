import unittest
from packages.connector.jira.cognee_community_connector_jira.jira import (
    jira_source,
    sanitize_issue_record,
    DOCUMENT_SOURCE_ATTR,
)


class TestJiraConnector(unittest.TestCase):
    def test_document_source_attr_defined(self):
        """Verify DOCUMENT_SOURCE_ATTR is explicitly defined for Cognee cognify."""
        self.assertEqual(DOCUMENT_SOURCE_ATTR, "rendered_document")

    def test_secret_exclusion(self):
        """Verify API tokens and secrets never leak into document or record."""
        secret_token = "ATATT3xFfGF0_SECRET_JIRA_KEY_99999"
        raw_issue = {
            "key": "PAY-184",
            "fields": {
                "summary": "Add Redis checkout caching",
                "description": "Cache session to reduce latency",
                "status": {"name": "Done"},
                "creator": {"displayName": "Elena Rostova"},
                "updated": "2026-10-02T14:10:00Z",
                "auth_header": secret_token,
            },
        }
        cleaned = sanitize_issue_record(raw_issue, subdomain="acme-payments")
        serialized = str(cleaned)
        self.assertNotIn(secret_token, serialized)
        self.assertIn("Add Redis checkout caching", cleaned[DOCUMENT_SOURCE_ATTR])
        self.assertEqual(cleaned["source_system"], "jira")
        self.assertEqual(cleaned["source_id"], "PAY-184")

    def test_source_factory_initialization(self):
        """Verify jira_source creates a valid DLT source instance."""
        source = jira_source(
            subdomain="acme-payments",
            email="eng@acme.dev",
            api_token="dummy_token",
            project_keys=["PAY"],
            write_disposition="replace",
        )
        self.assertEqual(source.name, "jira")
        self.assertEqual(source.write_disposition, "replace")
        records = source.fetch_records()
        self.assertGreaterEqual(len(records), 2)
        self.assertEqual(records[0]["project"], "PAY")


if __name__ == "__main__":
    unittest.main()
