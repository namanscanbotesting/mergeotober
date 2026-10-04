#!/usr/bin/env python3
"""
Cognee Golden Questions Query Runner (demo/query_demo.py)
Evaluates the 6 Golden Questions across Jira, Vercel, Sentry, PostHog, and historical memory.
"""
import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath("."))
from demo.cognee_runtime import cognee
from demo.ingest_demo import run_pipeline

GOLDEN_QUESTIONS = [
    ("Q1", "Current Release Context", "What changed in the latest checkout release?"),
    ("Q2", "Cross-System Reasoning", "Did that release cause a production issue?"),
    ("Q3", "Root Cause Investigation", "What caused the issue?"),
    ("Q4", "Historical Memory Recall", "Have we experienced something similar before?"),
    ("Q5", "Historical Resolution Memory", "How did we fix it last time?"),
    ("Q6", "Preventive Knowledge", "What should an engineer know before making another caching change?"),
]


async def run_queries():
    # Ensure graph is ingested and cognified
    await run_pipeline()

    print("\n" + "=" * 65)
    print("  Executing 6 Golden Questions Benchmark via `await cognee.search()`")
    print("=" * 65)

    for code, category, question in GOLDEN_QUESTIONS:
        print(f"\n[{code}] {category.upper()}")
        print(f"Question: \"{question}\"")
        results = await cognee.search(question)
        for r in results:
            print(f"Answer:   {r['headline']}")
            print(f"Sources:  {' · '.join(r['sources'])}")
            print(f"Evidence: {r['evidence']}")
        print("-" * 65)


if __name__ == "__main__":
    asyncio.run(run_queries())
