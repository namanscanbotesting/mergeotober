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
  can_simulate_upstream_delete?: boolean;
  security_audit_note?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  system: SourceSystem;
  recordId: string;
  x: number;
  y: number;
  isHistorical?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  isMemoryBridge?: boolean;
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
  preventiveChecklist?: string[];
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  cogneePythonSnippet: string;
  searchLatencyMs?: number;
}

export interface ConnectorPackageSpec {
  id: 'jira' | 'vercel' | 'sentry' | 'posthog';
  packageName: string;
  directoryPath: string;
  lifecycleRole: string;
  coreQuestion: string;
  dltStrategy: 'Verified DLT Source' | 'Declarative DLT RESTAPIConfig';
  sourceFactoryName: string;
  documentSourceAttr: string;
  writeDisposition: 'replace' | 'merge';
  writeDispositionRationale: string;
  cursorMechanism: string;
  deletionSemantics: string;
  securityInvariant: string;
  files: {
    filename: string;
    language: 'python' | 'toml' | 'markdown';
    content: string;
  }[];
  unitTests: {
    name: string;
    category: 'auth' | 'ingestion' | 'pagination' | 'incremental' | 'deletion' | 'security';
    assertionSummary: string;
    durationMs: number;
  }[];
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
    security_audit_note: 'Basic Auth token bound to DLT header; excluded from document content.',
    document_content: `Jira Issue PAY-184: Add Redis checkout session caching to reduce payment latency
Project: PAY | Status: Done | Author: Elena Rostova

Description:
High p95 latency (480ms) on POST /api/v2/checkout/session during peak flash sales.
Introduce a Redis read-through cache for CartSession objects with a 15-minute TTL keyed by user_id.

Engineering Comments:
[Elena Rostova]: Implemented in commit abc1234 behind PostHog flag 'checkout-cache'.
[Marcus Vance]: Deployed to production in Vercel release dep-789 (v2.8.0).`
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
    security_audit_note: 'Verified clean commit diff.',
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
    security_audit_note: 'scrub_vercel_deployment stripped 4 encrypted env secrets; only keys retained.',
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
    security_audit_note: 'Bounded to 3 event samples; duplicate raw bursts dropped.',
    document_content: `Sentry Issue SENTRY-42: CurrencyMismatchError
Culprit: checkout.service.create_intent
Frequency: 418 events affecting 164 users on release v2.8.0.
Cached cart total (19900) diverged from live Stripe PaymentIntent amount (14900) after user modified quantity.`
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
    security_audit_note: 'Personal API key retained in bearer client only.',
    document_content: `PostHog Feature Flag 'checkout-cache':
Phase 1: p95 latency improved from 480ms -> 95ms, but checkout completion dropped -6.4% due to SENTRY-42 stale reads.
Phase 2: After v2.8.1 hotfix, conversion recovered to 73.8% (+2.6% net lift).`
  },
  {
    id: 'PAY-189',
    source_system: 'jira',
    source_type: 'issue',
    source_id: 'PAY-189',
    source_url: 'https://acme-payments.atlassian.net/browse/PAY-189',
    project: 'PAY',
    timestamp: '2026-10-02T14:35:00Z',
    updated_at: '2026-10-02T17:05:00Z',
    author: 'Marcus Vance',
    title: 'Invalidate checkout Redis cache on currency or cart-line mutation',
    status: 'Done',
    document_source_attr: 'rendered_document',
    write_disposition: 'replace',
    cursor_field: 'fields.updated',
    cursor_value: '2026-10-02T17:05:00Z',
    related_ids: ['SENTRY-42', 'def4567', 'dep-794', 'PAY-109'],
    security_audit_note: 'Basic Auth token stripped.',
    document_content: `Jira Issue PAY-189: Invalidate checkout Redis cache on mutation
Fixed in commit def4567 and shipped in Vercel dep-794 (v2.8.1). Zero SENTRY-42 events since deploy.`
  },
  {
    id: 'def4567',
    source_system: 'git',
    source_type: 'commit',
    source_id: 'def4567',
    source_url: 'https://github.com/acme-payments/checkout-service/commit/def4567',
    project: 'checkout-service',
    timestamp: '2026-10-02T16:40:00Z',
    updated_at: '2026-10-02T16:40:00Z',
    author: 'Marcus Vance',
    title: 'fix(checkout): scope cache key by (user_id, cart_version_hash) and bust on PATCH /cart (PAY-189)',
    status: 'Merged',
    document_source_attr: 'commit_diff_summary',
    write_disposition: 'replace',
    cursor_field: 'committed_date',
    cursor_value: '2026-10-02T16:40:00Z',
    related_ids: ['PAY-189', 'SENTRY-42', 'dep-794', '98a1b2c'],
    document_content: `Commit def4567 by Marcus Vance (Resolves PAY-189, SENTRY-42)
Changed Redis key to "checkout:session:{user_id}:{currency}:{cart_version_hash}".
Added DEL hook on PATCH /cart.`
  },
  {
    id: 'dep-794',
    source_system: 'vercel',
    source_type: 'deployment',
    source_id: 'dep-794',
    source_url: 'https://vercel.com/acme-payments/checkout-web/dep-794',
    project: 'checkout-web',
    timestamp: '2026-10-02T16:48:00Z',
    updated_at: '2026-10-02T16:51:00Z',
    author: 'Marcus Vance',
    title: 'Deployment dep-794 (v2.8.1) — Hotfix commit def4567 [PAY-189]',
    status: 'READY',
    document_source_attr: 'deployment_summary',
    write_disposition: 'replace',
    cursor_field: 'created',
    cursor_value: '1790959680000',
    related_ids: ['def4567', 'PAY-189', 'SENTRY-42', 'checkout-cache'],
    document_content: `Vercel Deployment dep-794 (Release v2.8.1)
Shipped hotfix commit def4567. SENTRY-42 resolved.`
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
  },
  {
    id: '98a1b2c',
    source_system: 'git',
    source_type: 'commit',
    source_id: '98a1b2c',
    source_url: 'https://github.com/acme-payments/checkout-service/commit/98a1b2c',
    project: 'checkout-service',
    timestamp: '2026-03-14T10:55:00Z',
    updated_at: '2026-03-14T10:55:00Z',
    author: 'Elena Rostova',
    title: '[Historical] fix(tax-cache): include currency + line_item_digest in cache key (PAY-109, INC-42)',
    status: 'Merged',
    document_source_attr: 'commit_diff_summary',
    write_disposition: 'replace',
    cursor_field: 'committed_date',
    cursor_value: '2026-03-14T10:55:00Z',
    related_ids: ['PAY-109', 'INC-42', 'def4567'],
    is_historical: true,
    document_content: `Commit 98a1b2c (March 2026):
Scoped cache by {user_id}:{currency}:{line_item_digest}.`
  },
  {
    id: 'PAY-195',
    source_system: 'jira',
    source_type: 'issue',
    source_id: 'PAY-195',
    source_url: 'https://acme-payments.atlassian.net/browse/PAY-195',
    project: 'PAY',
    timestamp: '2026-10-03T08:00:00Z',
    updated_at: '2026-10-03T08:30:00Z',
    author: 'Devon Brooks',
    title: 'Draft: Experimental GraphQL checkout Edge cache spike (Superseded)',
    status: 'Draft',
    document_source_attr: 'rendered_document',
    write_disposition: 'replace',
    cursor_field: 'fields.updated',
    cursor_value: '2026-10-03T08:30:00Z',
    related_ids: ['PAY-184'],
    can_simulate_upstream_delete: true,
    security_audit_note: 'Used for Section 10 Deletion test.',
    document_content: `Temporary draft spike used to verify upstream deletion & orphan cleanup semantics.`
  }
];

export const KNOWLEDGE_GRAPH_NODES: GraphNode[] = [
  { id: 'PAY-184', label: 'PAY-184', sublabel: 'Jira · Checkout Caching', system: 'jira', recordId: 'PAY-184', x: 110, y: 110 },
  { id: 'abc1234', label: 'commit abc1234', sublabel: 'Git · Redis user_id Cache', system: 'git', recordId: 'abc1234', x: 320, y: 110 },
  { id: 'dep-789', label: 'dep-789 (v2.8.0)', sublabel: 'Vercel · Prod Release', system: 'vercel', recordId: 'dep-789', x: 540, y: 110 },
  { id: 'checkout-cache', label: 'checkout-cache', sublabel: 'PostHog · Latency/Conversion', system: 'posthog', recordId: 'checkout-cache', x: 540, y: 270 },
  { id: 'SENTRY-42', label: 'SENTRY-42', sublabel: 'Sentry · CurrencyMismatch', system: 'sentry', recordId: 'SENTRY-42', x: 770, y: 110 },
  { id: 'PAY-189', label: 'PAY-189', sublabel: 'Jira · Cache Busting Fix', system: 'jira', recordId: 'PAY-189', x: 770, y: 270 },
  { id: 'def4567', label: 'commit def4567', sublabel: 'Git · Version Hash Key', system: 'git', recordId: 'def4567', x: 980, y: 270 },
  { id: 'dep-794', label: 'dep-794 (v2.8.1)', sublabel: 'Vercel · Hotfix Release', system: 'vercel', recordId: 'dep-794', x: 980, y: 110 },
  // Historical precedent cluster (March 2026)
  { id: 'INC-42', label: 'INC-42 (Mar 2026)', sublabel: 'Sentry · Stale Tax Cache', system: 'sentry', recordId: 'INC-42', x: 320, y: 410, isHistorical: true },
  { id: 'PAY-109', label: 'PAY-109 (Mar 2026)', sublabel: 'Jira · Composite Key Rule', system: 'jira', recordId: 'PAY-109', x: 540, y: 410, isHistorical: true },
  { id: '98a1b2c', label: 'commit 98a1b2c', sublabel: 'Git · Digest Invalidation', system: 'git', recordId: '98a1b2c', x: 770, y: 410, isHistorical: true }
];

export const KNOWLEDGE_GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'PAY-184', target: 'abc1234', relation: 'implemented_by' },
  { id: 'e2', source: 'abc1234', target: 'dep-789', relation: 'deployed_as' },
  { id: 'e3', source: 'dep-789', target: 'SENTRY-42', relation: 'triggered_incident' },
  { id: 'e4', source: 'dep-789', target: 'checkout-cache', relation: 'measured_by' },
  { id: 'e5', source: 'SENTRY-42', target: 'PAY-189', relation: 'tracked_in' },
  { id: 'e6', source: 'PAY-189', target: 'def4567', relation: 'resolved_by' },
  { id: 'e7', source: 'def4567', target: 'dep-794', relation: 'deployed_as' },
  { id: 'e8', source: 'dep-794', target: 'checkout-cache', relation: 'restored_conversion' },
  // Historical memory bridges
  { id: 'e9', source: 'SENTRY-42', target: 'INC-42', relation: 'cognee_memory: same_failure_pattern', isMemoryBridge: true },
  { id: 'e10', source: 'INC-42', target: 'PAY-109', relation: 'investigated_in' },
  { id: 'e11', source: 'PAY-109', target: '98a1b2c', relation: 'resolved_by' },
  { id: 'e12', source: '98a1b2c', target: 'def4567', relation: 'cognee_memory: reused_mitigation', isMemoryBridge: true }
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
    highlightedNodeIds: ['PAY-184', 'abc1234', 'dep-789', 'checkout-cache'],
    highlightedEdgeIds: ['e1', 'e2', 'e4'],
    cogneePythonSnippet: `results = await cognee.search("What changed in the latest checkout release?")`,
    searchLatencyMs: 142
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
    highlightedNodeIds: ['dep-789', 'SENTRY-42', 'checkout-cache'],
    highlightedEdgeIds: ['e3', 'e4'],
    cogneePythonSnippet: `results = await cognee.search("Did that release cause a production issue?")`,
    searchLatencyMs: 158
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
      { step: 3, system: 'vercel', recordId: 'dep-789', summary: 'Vercel release shipped the code.' },
      { step: 4, system: 'sentry', recordId: 'SENTRY-42', summary: 'Sentry trace confirmed stale cached amount (19900) vs live intent amount (14900).' }
    ],
    highlightedNodeIds: ['PAY-184', 'abc1234', 'dep-789', 'SENTRY-42'],
    highlightedEdgeIds: ['e1', 'e2', 'e3'],
    cogneePythonSnippet: `results = await cognee.search("What caused the checkout failure after release v2.8.0?")`,
    searchLatencyMs: 164
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
    highlightedNodeIds: ['SENTRY-42', 'INC-42', 'PAY-109'],
    highlightedEdgeIds: ['e9', 'e10'],
    cogneePythonSnippet: `results = await cognee.search("Have we experienced a similar stale cache incident before?")`,
    searchLatencyMs: 171
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
    highlightedNodeIds: ['INC-42', 'PAY-109', '98a1b2c', 'PAY-189', 'def4567', 'dep-794'],
    highlightedEdgeIds: ['e10', 'e11', 'e12', 'e6', 'e7'],
    cogneePythonSnippet: `results = await cognee.search("How did we fix the stale cache bug last time?")`,
    searchLatencyMs: 165
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
    preventiveChecklist: [
      'Include immutable state digest (currency + cart_version_hash) in every Redis cache key.',
      'Wire synchronous cache eviction (DEL) into CartController.update_items().',
      'Gate behind a PostHog feature flag and evaluate checkout completion conversion alongside p95 latency.'
    ],
    highlightedNodeIds: ['PAY-184', 'abc1234', 'dep-789', 'SENTRY-42', 'checkout-cache', 'PAY-189', 'def4567', 'dep-794', 'INC-42', 'PAY-109', '98a1b2c'],
    highlightedEdgeIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11', 'e12'],
    cogneePythonSnippet: `results = await cognee.search("What should an engineer know before modifying checkout caching?")`,
    searchLatencyMs: 184
  }
];

export const CONNECTOR_SPECS: ConnectorPackageSpec[] = [
  {
    id: 'jira',
    packageName: 'cognee-community-connector-jira',
    directoryPath: 'packages/connector/jira/',
    lifecycleRole: 'Engineering Intent & Requirements',
    coreQuestion: 'Why did we build this?',
    dltStrategy: 'Verified DLT Source',
    sourceFactoryName: 'jira_source(...)',
    documentSourceAttr: 'DOCUMENT_SOURCE_ATTR = "rendered_document"',
    writeDisposition: 'replace',
    writeDispositionRationale: 'Uses full project snapshot (`replace`) by default so orphan cleanup purges deleted issues.',
    cursorMechanism: 'JQL incremental filter `updated >= "YYYY-MM-DD HH:mm"`.',
    deletionSemantics: 'Deleted upstream issues are evicted from Cognee graph on next replace sync.',
    securityInvariant: 'API token passed exclusively to HttpBasicAuth header; never serialized into document text.',
    files: [
      {
        filename: 'cognee_community_connector_jira/jira.py',
        language: 'python',
        content: `# Cognee Jira DLT Source\nDOCUMENT_SOURCE_ATTR = "rendered_document"\n...`
      }
    ],
    unitTests: [
      { name: 'test_jira_auth', category: 'auth', assertionSummary: 'BasicAuth isolates secret.', durationMs: 18 },
      { name: 'test_jira_cursor', category: 'incremental', assertionSummary: 'JQL updated >= cursor advances.', durationMs: 34 }
    ]
  },
  {
    id: 'vercel',
    packageName: 'cognee-community-connector-vercel',
    directoryPath: 'packages/connector/vercel/',
    lifecycleRole: 'Deployments & Commit SHAs',
    coreQuestion: 'What did we deploy?',
    dltStrategy: 'Declarative DLT RESTAPIConfig',
    sourceFactoryName: 'vercel_source(...)',
    documentSourceAttr: 'DOCUMENT_SOURCE_ATTR = "deployment_summary"',
    writeDisposition: 'replace',
    writeDispositionRationale: 'Declarative RESTAPIConfig with since cursor pagination.',
    cursorMechanism: 'since query parameter in epoch ms.',
    deletionSemantics: 'Pruned deployments are removed on replace sync.',
    securityInvariant: 'scrub_vercel_deployment removes all env variable values.',
    files: [
      {
        filename: 'cognee_community_connector_vercel/vercel.py',
        language: 'python',
        content: `# Cognee Vercel DLT Source\nDOCUMENT_SOURCE_ATTR = "deployment_summary"\n...`
      }
    ],
    unitTests: [
      { name: 'test_vercel_scrub', category: 'security', assertionSummary: 'Env secret values scrubbed.', durationMs: 14 }
    ]
  },
  {
    id: 'sentry',
    packageName: 'cognee-community-connector-sentry',
    directoryPath: 'packages/connector/sentry/',
    lifecycleRole: 'Production Exceptions & Culprits',
    coreQuestion: 'What broke in production?',
    dltStrategy: 'Declarative DLT RESTAPIConfig',
    sourceFactoryName: 'sentry_source(...)',
    documentSourceAttr: 'DOCUMENT_SOURCE_ATTR = "issue_narrative"',
    writeDisposition: 'replace',
    writeDispositionRationale: 'Captures issue-level intelligence with bounded event samples.',
    cursorMechanism: 'lastSeen ISO cursor.',
    deletionSemantics: 'Merged/deleted issues evicted on sync.',
    securityInvariant: 'Bounded to 3 event samples per issue (MAX_BOUNDED_EVENTS_PER_ISSUE = 3).',
    files: [
      {
        filename: 'cognee_community_connector_sentry/sentry.py',
        language: 'python',
        content: `# Cognee Sentry DLT Source\nDOCUMENT_SOURCE_ATTR = "issue_narrative"\n...`
      }
    ],
    unitTests: [
      { name: 'test_sentry_bound', category: 'security', assertionSummary: 'Event count capped to 3 samples.', durationMs: 16 }
    ]
  },
  {
    id: 'posthog',
    packageName: 'cognee-community-connector-posthog',
    directoryPath: 'packages/connector/posthog/',
    lifecycleRole: 'Feature Flags & Conversion Telemetry',
    coreQuestion: 'What happened to user behavior?',
    dltStrategy: 'Declarative DLT RESTAPIConfig',
    sourceFactoryName: 'posthog_source(...)',
    documentSourceAttr: 'DOCUMENT_SOURCE_ATTR = "insight_summary"',
    writeDisposition: 'replace',
    writeDispositionRationale: 'Tracks feature flag rollouts and conversion delta.',
    cursorMechanism: 'updated_at cursor.',
    deletionSemantics: 'Archived flags removed on sync.',
    securityInvariant: 'Personal API key kept in DLT bearer client only.',
    files: [
      {
        filename: 'cognee_community_connector_posthog/posthog.py',
        language: 'python',
        content: `# Cognee PostHog DLT Source\nDOCUMENT_SOURCE_ATTR = "insight_summary"\n...`
      }
    ],
    unitTests: [
      { name: 'test_posthog_auth', category: 'auth', assertionSummary: 'Bearer token isolation verified.', durationMs: 12 }
    ]
  }
];

export const PR_QUALITY_GATES = [
  { id: 'g1', label: 'Follows cognee-community connector layout', status: 'verified', detail: 'packages/connector/<name>/ structure with pyproject.toml and tests/.' },
  { id: 'g2', label: 'Uses DLT verified source / declarative RESTAPIConfig', status: 'verified', detail: 'Zero manual while page: requests.get() loops.' },
  { id: 'g3', label: 'Explicit DOCUMENT_SOURCE_ATTR defined', status: 'verified', detail: 'rendered_document, deployment_summary, issue_narrative, insight_summary.' },
  { id: 'g4', label: 'Incremental cursor synchronization tested', status: 'verified', detail: 'JQL updated >=, since, lastSeen, updated_at.' },
  { id: 'g5', label: 'Upstream deletion & orphan cleanup tested', status: 'verified', detail: '6-step lifecycle test: delete upstream -> sync -> confirm evicted.' },
  { id: 'g6', label: 'Secret exclusion & bounded volume enforced', status: 'verified', detail: 'Vercel secrets scrubbed; Sentry capped at 3 sample events.' }
];

export const VIDEO_SCRIPT_SCENES = [
  {
    scene: 'Scene 0 — Cold Open',
    timeRange: '0:00–0:20',
    visualCue: 'Show Jira, Vercel, Sentry, and PostHog badges.',
    voiceover: 'Every engineering team has the same problem: information is scattered across multiple systems. Who remembers the whole story?',
    targetQuestionCode: 'Q1' as const
  },
  {
    scene: 'Scene 1 — The Incident Question',
    timeRange: '0:20–0:45',
    visualCue: 'Ask: Why did checkout fail after the latest release?',
    voiceover: 'Instead of grepping across four tabs, we ask Cognee directly.',
    targetQuestionCode: 'Q3' as const
  },
  {
    scene: 'Scene 2 — The Historical Memory Test',
    timeRange: '2:00–2:45',
    visualCue: 'Ask: Have we experienced something similar before?',
    voiceover: 'Cognee connects today’s failure to an incident from seven months earlier in March 2026.',
    targetQuestionCode: 'Q4' as const
  }
];

export const MERGETOBER_BLOG_MARKDOWN = `# I Gave an AI Engineer a Memory of How Our Software Was Built

Submitted for the WeMakeDevs Mergetober Hackathon — Cognee Best Use Case.

Your codebase remembers. Your AI should too.
`;
