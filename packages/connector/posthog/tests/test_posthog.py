import unittest
from packages.connector.posthog.cognee_community_connector_posthog.posthog import (
    posthog_source,
    normalize_posthog_feature_flag,
    DOCUMENT_SOURCE_ATTR,
)


class TestPostHogConnector(unittest.TestCase):
    def test_document_source_attr_defined(self):
        self.assertEqual(DOCUMENT_SOURCE_ATTR, "insight_summary")

    def test_flag_normalization(self):
        raw = {
            "key": "checkout-cache",
            "name": "Redis Session Caching",
            "active": True,
            "rollout_percentage": 100,
            "experiment_summary": "Latency dropped to 95ms; conversion recovered to 73.8%."
        }
        normalized = normalize_posthog_feature_flag(raw)
        self.assertEqual(normalized["source_system"], "posthog")
        self.assertEqual(normalized["source_id"], "checkout-cache")
        self.assertIn("Latency dropped to 95ms", normalized[DOCUMENT_SOURCE_ATTR])

    def test_source_factory_initialization(self):
        source = posthog_source(project_id="94812", personal_api_key="phx_sample")
        self.assertEqual(source.name, "posthog")
        records = source.fetch_records()
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["source_id"], "checkout-cache")


if __name__ == "__main__":
    unittest.main()
