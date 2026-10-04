#!/usr/bin/env python3
"""
Test runner for DevMemory / Cognee connector test suites.
Can be executed with:
    python3 tests/run_tests.py
"""
import sys
import os
import unittest

# Ensure current directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath("."))

def main():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Discover and add all tests from packages/ and tests/
    suite.addTests(loader.discover("packages/connector/jira/tests", pattern="test_*.py", top_level_dir="."))
    suite.addTests(loader.discover("packages/connector/vercel/tests", pattern="test_*.py", top_level_dir="."))
    suite.addTests(loader.discover("packages/connector/sentry/tests", pattern="test_*.py", top_level_dir="."))
    suite.addTests(loader.discover("packages/connector/posthog/tests", pattern="test_*.py", top_level_dir="."))
    suite.addTests(loader.discover("tests", pattern="test_*.py", top_level_dir="."))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print(f"\n✅ ALL {result.testsRun} TESTS PASSED CLEANLY.")
        sys.exit(0)
    else:
        print(f"\n❌ {len(result.failures)} failures, {len(result.errors)} errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
