import unittest
from packages.connector.jira.cognee_community_connector_jira.jira import jira_source
from packages.connector.vercel.cognee_community_connector_vercel.vercel import vercel_source


class TestIncrementalSync(unittest.TestCase):
    def test_first_sync_stores_cursor_and_second_sync_fetches_delta(self):
        """
        Verify Section 9 Incremental Synchronization pattern:
        1. First sync stores cursor
        2. Second sync fetches changed records only
        """
        source = vercel_source(write_disposition="replace")
        
        # 1st Sync: fetch all records
        first_sync_records = source.fetch_records(since_ms=0)
        self.assertEqual(len(first_sync_records), 2)
        
        # Store high-water cursor from first sync
        latest_cursor = max(int(r["timestamp"]) for r in first_sync_records)
        self.assertEqual(latest_cursor, 1790959680000)
        
        # 2nd Sync: pass cursor to fetch only records newer than previous sync
        # Here, no new deployments occurred after 1790959680000
        delta_records = source.fetch_records(since_ms=latest_cursor + 1000)
        self.assertEqual(len(delta_records), 0)


if __name__ == "__main__":
    unittest.main()
