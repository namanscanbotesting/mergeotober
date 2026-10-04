import unittest
from packages.connector.jira.cognee_community_connector_jira.jira import sanitize_issue_record
from packages.connector.vercel.cognee_community_connector_vercel.vercel import scrub_vercel_deployment


class TestSecretExclusion(unittest.TestCase):
    def test_secrets_never_enter_documents_or_graph_nodes(self):
        """
        Section 11 Security Rule:
        API token -> connector configuration only
        API token -> NEVER document content
        API token -> NEVER graph node
        """
        secret_keys = [
            "sk_live_51N_SUPER_SECRET_PAYMENT_KEY_999",
            "redis://:my_ultra_secret_password@cluster:6379",
            "ATATT3xFfGF0_SECRET_ATLASSIAN_TOKEN"
        ]

        # 1. Test Vercel environment variable values
        raw_vercel = {
            "uid": "dep-789",
            "name": "checkout-web",
            "created": 1790949900000,
            "env": [
                {"key": "STRIPE_SECRET_KEY", "value": secret_keys[0]},
                {"key": "REDIS_URL", "decryptedValue": secret_keys[1]}
            ]
        }
        cleaned_vercel = scrub_vercel_deployment(raw_vercel)
        serialized_vercel = str(cleaned_vercel)
        self.assertNotIn(secret_keys[0], serialized_vercel)
        self.assertNotIn(secret_keys[1], serialized_vercel)
        self.assertEqual(cleaned_vercel["env_key_names"], ["STRIPE_SECRET_KEY", "REDIS_URL"])

        # 2. Test Jira auth token
        raw_jira = {
            "key": "PAY-184",
            "fields": {
                "summary": "Caching",
                "description": "Clean description",
                "secret_token": secret_keys[2]
            }
        }
        cleaned_jira = sanitize_issue_record(raw_jira, subdomain="acme")
        serialized_jira = str(cleaned_jira)
        self.assertNotIn(secret_keys[2], serialized_jira)


if __name__ == "__main__":
    unittest.main()
