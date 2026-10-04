import unittest
from packages.connector.vercel.cognee_community_connector_vercel.vercel import (
    vercel_source,
    scrub_vercel_deployment,
    DOCUMENT_SOURCE_ATTR,
)


class TestVercelConnector(unittest.TestCase):
    def test_document_source_attr_defined(self):
        self.assertEqual(DOCUMENT_SOURCE_ATTR, "deployment_summary")

    def test_environment_secret_redaction(self):
        """Mandatory security test proving env variable values NEVER enter graph."""
        raw_deployment = {
            "uid": "dep-789",
            "name": "checkout-web",
            "state": "READY",
            "created": 1790949900000,
            "meta": {
                "githubCommitSha": "abc1234890123",
                "githubCommitMessage": "feat(checkout): cache session in Redis (PAY-184)",
                "githubCommitAuthorName": "Elena Rostova",
            },
            "env": [
                {"key": "STRIPE_SECRET_KEY", "value": "sk_live_SECRET_STRIPE_KEY_EXCLUDE_ME"},
                {"key": "REDIS_URL", "decryptedValue": "redis://:p4ssword_secret@internal:6379"},
            ],
        }
        cleaned = scrub_vercel_deployment(raw_deployment)
        serialized = str(cleaned)

        self.assertNotIn("sk_live_SECRET_STRIPE_KEY_EXCLUDE_ME", serialized)
        self.assertNotIn("p4ssword_secret", serialized)
        self.assertEqual(cleaned["env_key_names"], ["STRIPE_SECRET_KEY", "REDIS_URL"])
        self.assertEqual(cleaned["commit_sha"], "abc1234")
        self.assertEqual(cleaned["source_system"], "vercel")

    def test_source_factory_initialization(self):
        source = vercel_source(api_token="tok_123", team_id="team_payments")
        self.assertEqual(source.name, "vercel")
        records = source.fetch_records()
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["id"], "dep-789")


if __name__ == "__main__":
    unittest.main()
