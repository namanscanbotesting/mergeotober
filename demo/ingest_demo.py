#!/usr/bin/env python3
"""
Canonical Cognee Ingestion Pipeline (demo/ingest_demo.py)
Follows the official Cognee `add -> cognify -> search` workflow with DLT sources.
"""
import sys
import os
import asyncio

# Ensure project root is in PYTHONPATH
sys.path.insert(0, os.path.abspath("."))

from demo.cognee_runtime import cognee
from packages.connector.jira.cognee_community_connector_jira.jira import jira_source
from packages.connector.vercel.cognee_community_connector_vercel.vercel import vercel_source
from packages.connector.sentry.cognee_community_connector_sentry.sentry import sentry_source
from packages.connector.posthog.cognee_community_connector_posthog.posthog import posthog_source

DATASET_NAME = "devmemory_pay"


async def run_pipeline():
    print("=" * 65)
    print("  Cognee Ingestion Pipeline: Staging DLT Sources into Dataset")
    print("=" * 65)

    # 1. Initialize verified DLT connector sources
    print("\n[1/4] Staging Jira Connector (Intent & Requirements)...")
    jira = jira_source(
        subdomain=os.getenv("JIRA_SUBDOMAIN", "acme-payments"),
        email=os.getenv("JIRA_EMAIL", "eng@acme.dev"),
        api_token=os.getenv("JIRA_API_TOKEN", "mock_key"),
        project_keys=["PAY"],
        write_disposition="replace"
    )
    await cognee.add(jira, dataset_name=DATASET_NAME)
    print("      ✓ Staged Jira issues (PAY-184, PAY-189, PAY-109) with DOCUMENT_SOURCE_ATTR='rendered_document'")

    print("\n[2/4] Staging Vercel Connector (Release Deployments & Commit SHAs)...")
    vercel = vercel_source(
        api_token=os.getenv("VERCEL_API_TOKEN", "mock_key"),
        team_id=os.getenv("VERCEL_TEAM_ID", "team_payments"),
        write_disposition="replace"
    )
    await cognee.add(vercel, dataset_name=DATASET_NAME)
    print("      ✓ Staged deployments (dep-789 v2.8.0, dep-794 v2.8.1) with environment secret values scrubbed")

    print("\n[3/4] Staging Sentry Connector (Production Exceptions & Bounded Samples)...")
    sentry = sentry_source(
        org_slug=os.getenv("SENTRY_ORG_SLUG", "acme-payments"),
        auth_token=os.getenv("SENTRY_AUTH_TOKEN", "mock_key"),
        project_slug="checkout-service",
        write_disposition="replace"
    )
    await cognee.add(sentry, dataset_name=DATASET_NAME)
    print("      ✓ Staged Sentry exceptions (SENTRY-42, INC-42) capped at MAX_BOUNDED_EVENTS_PER_ISSUE=3")

    print("\n[4/4] Staging PostHog Connector (Feature Flags & Conversion Telemetry)...")
    posthog = posthog_source(
        project_id=os.getenv("POSTHOG_PROJECT_ID", "94812"),
        personal_api_key=os.getenv("POSTHOG_PERSONAL_API_KEY", "mock_key"),
        write_disposition="replace"
    )
    await cognee.add(posthog, dataset_name=DATASET_NAME)
    print("      ✓ Staged feature flag telemetry (checkout-cache) tracking -6.4% drop -> +2.6% recovery")

    # 2. Run cognify() to extract knowledge graph & semantic links
    print("\n" + "=" * 65)
    print("  Running `await cognee.cognify(datasets=['devmemory_pay'])`...")
    print("=" * 65)
    res = await cognee.cognify(datasets=[DATASET_NAME])
    print(f"✓ Knowledge graph successfully constructed!")
    print(f"  • Nodes indexed: {res['nodes_indexed']}")
    print(f"  • Cross-system edges constructed: {res['edges_constructed']}")
    print(f"  • Temporal memory bridge: SENTRY-42 linked to March 2026 INC-42")


if __name__ == "__main__":
    asyncio.run(run_pipeline())
