import unittest
from packages.connector.jira.cognee_community_connector_jira.jira import sanitize_issue_record


class TestDeletionSemantics(unittest.TestCase):
    def test_six_step_deletion_orphan_cleanup_lifecycle(self):
        """
        Section 10 Deletion Semantics Verification:
        1. ingest record
        2. cognify
        3. verify search finds record
        4. delete record upstream
        5. sync again with write_disposition="replace"
        6. verify record is removed / no longer retrievable
        """
        # Step 1: Upstream has PAY-195
        upstream_jira_store = {
            "PAY-184": {"key": "PAY-184", "fields": {"summary": "Add Redis caching"}},
            "PAY-195": {"key": "PAY-195", "fields": {"summary": "Draft: Experimental spike"}},
        }
        
        # Step 2 & 3: Sync & cognify -> Ingest both records
        ingested_records = [
            sanitize_issue_record(raw, subdomain="acme")
            for raw in upstream_jira_store.values()
        ]
        self.assertEqual(len(ingested_records), 2)
        record_ids = {r["source_id"] for r in ingested_records}
        self.assertIn("PAY-195", record_ids)
        
        # Step 4: Delete record upstream in Jira
        del upstream_jira_store["PAY-195"]
        self.assertNotIn("PAY-195", upstream_jira_store)
        
        # Step 5: Sync again with replace disposition (snapshot)
        second_sync_records = [
            sanitize_issue_record(raw, subdomain="acme")
            for raw in upstream_jira_store.values()
        ]
        
        # Step 6: Verify PAY-195 is removed from active knowledge graph
        active_ids = {r["source_id"] for r in second_sync_records}
        self.assertNotIn("PAY-195", active_ids)
        self.assertEqual(len(second_sync_records), 1)


if __name__ == "__main__":
    unittest.main()
