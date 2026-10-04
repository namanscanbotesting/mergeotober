"""
Option A: Interactive Python CLI Chat with Cognee (demo/chat_cli.py)
Run directly in your terminal:
    python demo/chat_cli.py
"""

import asyncio
import os
import cognee

# Ensure Cognee dataset name matches the ingested data
DATASET_NAME = "devmemory_pay"


async def main():
    print("=" * 65)
    print("  MergeStream / Cognee — Option A: Interactive Engineering Chat")
    print("=" * 65)
    print("Loaded Cognee Knowledge Graph across Jira, Vercel, Sentry, PostHog.")
    print("Type your engineering question below (or 'exit' to quit).\n")
    print("Suggested questions to test:")
    print("  1. What changed in the latest checkout release?")
    print("  2. Did that release cause a production issue?")
    print("  3. What caused the issue?")
    print("  4. Have we experienced something similar before?")
    print("  5. How did we fix it last time?")
    print("  6. What should an engineer know before making another caching change?")
    print("-" * 65)

    while True:
        try:
            prompt = input("\nYou > ").strip()
            if not prompt:
                continue
            if prompt.lower() in ("exit", "quit", "q"):
                print("Goodbye!")
                break

            print(f"\n[Cognee Engine] Searching knowledge graph for: '{prompt}'...")
            
            # Canonical Cognee search call across the graph
            results = await cognee.search(
                query_text=prompt,
                datasets=[DATASET_NAME]
            )

            print("\nCognee Response:")
            if not results:
                print("  No matching entities found in the graph.")
            else:
                for idx, result in enumerate(results, start=1):
                    print(f"\n--- [Source Evidence #{idx}] ---")
                    print(result)

        except (KeyboardInterrupt, EOFError):
            print("\nSession ended.")
            break


if __name__ == "__main__":
    asyncio.run(main())
