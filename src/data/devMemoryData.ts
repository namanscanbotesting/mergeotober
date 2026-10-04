export type SourceSystem = 'jira' | 'vercel' | 'sentry' | 'posthog' | 'git';

export interface SourceRecord {
  id: string;
  source_system: SourceSystem;
  source_type: string;
  source_id: string;
  source_url: string;
  project: string;
  timestamp: string;
  updated_at: string;
  author: string;
  title: string;
  status: string;
  document_source_attr: string;
  document_content: string;
  write_disposition: 'replace' | 'merge';
  cursor_field: string;
  cursor_value: string;
  related_ids: string[];
  is_historical?: boolean;
}

export interface GoldenQuestion {
  id: string;
  code: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6';
  category: string;
  question: string;
  requiresHistoricalMemory: boolean;
  expectedSources: SourceSystem[];
  headlineAnswer: string;
  rootCauseOrSynthesis: string;
  reasoningSteps: {
    step: number;
    system: SourceSystem;
    recordId: string;
    summary: string;
  }[];
  cogneePythonSnippet: string;
}

export const INITIAL_SOURCE_RECORDS: SourceRecord[] = [
  {
    id: 'PAY-184',
    source_system: 'jira',
    source_type: 'issue',
    source_id: 'PAY-184',
    source_url: 'https://acme-payments.atlassian.net/browse/PAY-184',
    project: 'PAY',
    timestamp: '2026-10-01T09:15:00Z',
    updated_at: '2026-10-02T14:10:00Z',
    author: 'Elena Rostova',
    title: 'Add Redis checkout session caching to reduce payment latency',
    status: 'Done',
    document_source_attr: 'rendered_document',
    write_disposition: 'replace',
    cursor_field: 'fields.updated (JQL updated >=)',
    cursor_value: '2026-10-02T14:10:00Z',
    related_ids: ['abc1234', 'dep-789', 'checkout-cache', 'SENTRY-42'],
    document_content: `Jira Issue PAY-184: Add Redis checkout session caching to reduce payment latency
Project: PAY | Status: Done | Author: Elena Rostova
High p95 latency (480ms) on POST /api/v2/checkout/session during peak flash sales.
Introduce a Redis read-through cache for CartSession objects with a 15-minute TTL keyed by user_id.`
  },
  {
    id: 'abc1234',
    source_system: 'git',
    source_type: 'commit',
    source_id: 'abc1234',
    source_url: 'https://github.com/acme-payments/checkout-service/commit/abc1234',
    project: 'checkout-service',
    timestamp: '2026-10-02T13:42:00Z',
    updated_at: '2026-10-02T13:42:00Z',
    author: 'Elena Rostova',
    title: 'feat(checkout): cache serialized CartSession by user_id in Redis (PAY-184)',
    status: 'Merged',
    document_source_attr: 'commit_diff_summary',
    write_disposition: 'replace',
    cursor_field: 'committed_date',
    cursor_value: '2026-10-02T13:42:00Z',
    related_ids: ['PAY-184', 'dep-789', 'SENTRY-42'],
    document_content: `Commit abc1234 by Elena Rostova (PAY-184)
Added get_cached_cart_session(user_id) with 900s TTL.
Omitted cart_version_hash and cache invalidation on PATCH /cart.`
  },
  {
    id: 'dep-789',
    source_system: 'vercel',
    source_type: 'deployment',
    source_id: 'dep-789',
    source_url: 'https://vercel.com/acme-payments/checkout-web/dep-789',
    project: 'checkout-web',
    timestamp: '2026-10-02T14:05:00Z',
    updated_at: '2026-10-02T14:08:12Z',
    author: 'Elena Rostova',
    title: 'Deployment dep-789 (v2.8.0) — commit abc1234 [PAY-184]',
    status: 'READY',
    document_source_attr: 'deployment_summary',
    write_disposition: 'replace',
    cursor_field: 'created (since ms)',
    cursor_value: '1790949900000',
    related_ids: ['abc1234', 'PAY-184', 'SENTRY-42', 'checkout-cache'],
    document_content: `Vercel Deployment dep-789 (Release v2.8.0) for project checkout-web
State: READY | Author: Elena Rostova | Commit: abc1234
Configured Env Key Names (values scrubbed): STRIPE_SECRET_KEY, REDIS_URL`
  },
  {
    id: 'SENTRY-42',
    source_system: 'sentry',
    source_type: 'issue',
    source_id: 'SENTRY-42',
    source_url: 'https://sentry.io/organizations/acme-payments/issues/SENTRY-42/',
    project: 'checkout-service',
    timestamp: '2026-10-02T14:18:00Z',
    updated_at: '2026-10-02T16:55:00Z',
    author: 'Marcus Vance',
    title: 'CurrencyMismatchError: PaymentIntent amount (14900) != cached CartSession total (19900)',
    status: 'resolved',
    document_source_attr: 'issue_narrative',
    write_disposition: 'replace',
    cursor_field: 'lastSeen',
    cursor_value: '2026-10-02T16:55:00Z',
    related_ids: ['dep-789', 'abc1234', 'PAY-189', 'def4567', 'INC-42'],
    document_content: `Sentry Issue SENTRY-42: CurrencyMismatchError
Culprit: checkout.service.create_intent
Frequency: 418 events affecting 164 users on release v2.8.0.
Cached cart total (19900) diverged from live Stripe PaymentIntent amount (14900).`
  },
  {
    id: 'checkout-cache',
    source_system: 'posthog',
    source_type: 'feature_flag',
    source_id: 'checkout-cache',
    source_url: 'https://app.posthog.com/project/94812/feature_flags/checkout-cache',
    project: 'checkout-web',
    timestamp: '2026-10-02T14:06:00Z',
    updated_at: '2026-10-02T18:00:00Z',
    author: 'Elena Rostova',
    title: 'Feature Flag: checkout-cache (Redis Session Caching)',
    status: 'Active',
    document_source_attr: 'insight_summary',
    write_disposition: 'replace',
    cursor_field: 'updated_at',
    cursor_value: '2026-10-02T18:00:00Z',
    related_ids: ['PAY-184', 'dep-789', 'SENTRY-42', 'dep-794'],
    document_content: `PostHog Feature Flag 'checkout-cache':
Phase 1: p95 latency improved from 480ms -> 95ms, but checkout completion dropped -6.4% due to SENTRY-42 stale reads.
Phase 2: After v2.8.1 hotfix, conversion recovered to 73.8% (+2.6% net lift).`
  },
  {
    id: 'INC-42',
    source_system: 'sentry',
    source_type: 'issue',
    source_id: 'INC-42',
    source_url: 'https://sentry.io/organizations/acme-payments/issues/INC-42/',
    project: 'checkout-service',
    timestamp: '2026-03-14T08:12:00Z',
    updated_at: '2026-03-14T11:30:00Z',
    author: 'Elena Rostova',
    title: '[Historical Precedent] StaleCacheStateError: Cached tax calculation persisted after country switch',
    status: 'resolved',
    document_source_attr: 'issue_narrative',
    write_disposition: 'replace',
    cursor_field: 'lastSeen',
    cursor_value: '2026-03-14T11:30:00Z',
    related_ids: ['PAY-109', '98a1b2c', 'SENTRY-42'],
    is_historical: true,
    document_content: `Historical Sentry Incident INC-42 (March 2026):
Redis cache key 'tax:quote:{user_id}' returned stale tax totals when users changed country mid-checkout.
Resolved in PAY-109 by adding composite digest key + write-through eviction.`
  },
  {
    id: 'PAY-109',
    source_system: 'jira',
    source_type: 'issue',
    source_id: 'PAY-109',
    source_url: 'https://acme-payments.atlassian.net/browse/PAY-109',
    project: 'PAY',
    timestamp: '2026-03-14T08:40:00Z',
    updated_at: '2026-03-14T11:20:00Z',
    author: 'Elena Rostova',
    title: '[Historical] Fix stale tax-rate cache read during multi-currency checkout switch',
    status: 'Done',
    document_source_attr: 'rendered_document',
    write_disposition: 'replace',
    cursor_field: 'fields.updated',
    cursor_value: '2026-03-14T11:20:00Z',
    related_ids: ['INC-42', '98a1b2c', 'PAY-189'],
    is_historical: true,
    document_content: `Jira Issue PAY-109 (March 2026):
Architectural Rule Established: Never key checkout Redis caches by user_id alone; include currency and cart_version_hash, and evict on cart mutation.`
  }
];

export const GOLDEN_QUESTIONS: GoldenQuestion[] = [
  {
    id: 'release_change',
    code: 'Q1',
    category: 'Current Release Context',
    question: 'What changed in the latest checkout release?',
    requiresHistoricalMemory: false,
    expectedSources: ['jira', 'git', 'vercel', 'posthog'],
    headlineAnswer: 'Release v2.8.0 (Vercel deployment dep-789) shipped commit abc1234 for Jira PAY-184, introducing a 15-minute Redis read-through cache for CartSession objects behind the PostHog feature flag checkout-cache.',
    rootCauseOrSynthesis: 'Cognee links Jira planning intent (PAY-184) to Git commit abc1234, Vercel deployment dep-789, and PostHog feature flag checkout-cache.',
    reasoningSteps: [
      { step: 1, system: 'jira', recordId: 'PAY-184', summary: 'Jira PAY-184 planned Redis checkout session caching.' },
      { step: 2, system: 'git', recordId: 'abc1234', summary: 'Commit abc1234 implemented Redis cache with key "checkout:session:{user_id}".' },
      { step: 3, system: 'vercel', recordId: 'dep-789', summary: 'Vercel dep-789 deployed commit abc1234 to production (release v2.8.0).' },
      { step: 4, system: 'posthog', recordId: 'checkout-cache', summary: 'PostHog enabled rollout and measured p95 latency reduction (480ms -> 95ms).' }
    ],
    cogneePythonSnippet: `results = await cognee.search("What changed in the latest checkout release?")`
  },
  {
    id: 'release_production_impact',
    code: 'Q2',
    category: 'Cross-System Reasoning',
    question: 'Did that release cause a production issue?',
    requiresHistoricalMemory: false,
    expectedSources: ['vercel', 'sentry', 'posthog'],
    headlineAnswer: 'Yes. Ten minutes after Vercel deployment dep-789 went live, Sentry recorded 418 CurrencyMismatchError events (SENTRY-42) affecting 164 users, and PostHog showed a -6.4% drop in checkout conversion.',
    rootCauseOrSynthesis: 'Cognee correlates Vercel deployment timestamps with the Sentry exception spike and PostHog funnel conversion drop.',
    reasoningSteps: [
      { step: 1, system: 'vercel', recordId: 'dep-789', summary: 'Vercel deployment promoted release v2.8.0.' },
      { step: 2, system: 'sentry', recordId: 'SENTRY-42', summary: 'Sentry SENTRY-42 spiked with 418 CurrencyMismatchError events.' },
      { step: 3, system: 'posthog', recordId: 'checkout-cache', summary: 'PostHog measured -6.4% drop in checkout conversion for active cohort.' }
    ],
    cogneePythonSnippet: `results = await cognee.search("Did that release cause a production issue?")`
  },
  {
    id: 'incident_root_cause',
    code: 'Q3',
    category: 'Root Cause Investigation',
    question: 'What caused the issue?',
    requiresHistoricalMemory: false,
    expectedSources: ['jira', 'git', 'vercel', 'sentry'],
    headlineAnswer: 'Commit abc1234 keyed the Redis cache strictly by user_id without including cart_version_hash and lacked invalidation on PATCH /cart. When users modified cart items, live Stripe totals diverged from the stale cached total, causing CurrencyMismatchError (SENTRY-42).',
    rootCauseOrSynthesis: 'Root cause spans 4 tools: Jira intent (PAY-184), Git implementation omission (abc1234), Vercel release (dep-789), and Sentry stack trace (SENTRY-42).',
    reasoningSteps: [
      { step: 1, system: 'jira', recordId: 'PAY-184', summary: 'Jira issue requested a user-scoped session cache.' },
      { step: 2, system: 'git', recordId: 'abc1234', summary: 'Commit omitted cache invalidation on cart modification.' },
      { step: 3, system: 'sentry', recordId: 'SENTRY-42', summary: 'Sentry trace confirmed stale cached amount (19900) vs live intent amount (14900).' }
    ],
    cogneePythonSnippet: `results = await cognee.search("What caused the checkout failure after release v2.8.0?")`
  },
  {
    id: 'historical_incident',
    code: 'Q4',
    category: 'Institutional Historical Memory',
    question: 'Have we experienced something similar before?',
    requiresHistoricalMemory: true,
    expectedSources: ['sentry', 'jira'],
    headlineAnswer: 'Yes. 7 months earlier in March 2026, Sentry incident INC-42 (Jira PAY-109) failed with the exact same pattern: user-scoped Redis key "tax:quote:{user_id}" returned stale tax totals when users changed countries.',
    rootCauseOrSynthesis: 'Cognee semantic graph connects SENTRY-42 to March 2026 INC-42 via shared concept: user-scoped Redis cache lacking state versioning.',
    reasoningSteps: [
      { step: 1, system: 'sentry', recordId: 'SENTRY-42', summary: 'Current October 2026 incident with user-scoped cache.' },
      { step: 2, system: 'sentry', recordId: 'INC-42', summary: 'March 2026 historical incident with user-scoped tax cache.' },
      { step: 3, system: 'jira', recordId: 'PAY-109', summary: 'Documented rule to always scope Redis keys by immutable state digest.' }
    ],
    cogneePythonSnippet: `results = await cognee.search("Have we experienced a similar stale cache incident before?")`
  },
  {
    id: 'previous_fix',
    code: 'Q5',
    category: 'Historical Resolution Memory',
    question: 'How did we fix it last time?',
    requiresHistoricalMemory: true,
    expectedSources: ['jira', 'sentry', 'git'],
    headlineAnswer: 'In March 2026 (Jira PAY-109 / commit 98a1b2c), Elena resolved INC-42 by replacing user_id keys with composite digest keys ({user_id}:{currency}:{digest}) and publishing eviction events on cart mutation.',
    rootCauseOrSynthesis: 'Cognee retrieves historical fix from PAY-109 and shows how hotfix PAY-189 / commit def4567 applied that exact architectural resolution.',
    reasoningSteps: [
      { step: 1, system: 'jira', recordId: 'PAY-109', summary: 'Documented historical composite key design.' },
      { step: 2, system: 'git', recordId: '98a1b2c', summary: 'Historical commit scoping cache by line item digest.' },
      { step: 3, system: 'git', recordId: 'def4567', summary: 'Reused fix in commit def4567 scoping by cart_version_hash.' }
    ],
    cogneePythonSnippet: `results = await cognee.search("How did we fix the stale cache bug last time?")`
  },
  {
    id: 'preventive_guidance',
    code: 'Q6',
    category: 'Preventive Knowledge',
    question: 'What should an engineer know before making another caching change?',
    requiresHistoricalMemory: true,
    expectedSources: ['jira', 'git', 'vercel', 'sentry', 'posthog'],
    headlineAnswer: 'Never key checkout caches by user_id alone; always include (currency, cart_version_hash), hook synchronous eviction into all mutation endpoints, and monitor both p95 latency and checkout conversion in PostHog.',
    rootCauseOrSynthesis: 'Synthesizes 7 months of history into concrete guardrails before code is committed.',
    reasoningSteps: [
      { step: 1, system: 'jira', recordId: 'PAY-109', summary: 'Rule: Composite keys only.' },
      { step: 2, system: 'sentry', recordId: 'SENTRY-42', summary: 'Rule: Test cart quantity mutations before releasing.' },
      { step: 3, system: 'posthog', recordId: 'checkout-cache', summary: 'Rule: Always guard latency wins with conversion guardrails.' }
    ],
    cogneePythonSnippet: `results = await cognee.search("What should an engineer know before modifying checkout caching?")`
  }
];
