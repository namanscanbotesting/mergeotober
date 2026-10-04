import React, { useMemo, useState, useEffect } from 'react';
import {
  GOLDEN_QUESTIONS,
  GoldenQuestion,
  INITIAL_SOURCE_RECORDS,
  KNOWLEDGE_GRAPH_EDGES,
  KNOWLEDGE_GRAPH_NODES,
  SourceRecord,
  SourceSystem
} from './data/devMemoryData';
import { LiveChatView } from './components/LiveChatView';
import { KnowledgeGraphCanvas } from './components/KnowledgeGraphCanvas';
import { ConnectorExplorer } from './components/ConnectorExplorer';
import { SyncLifecycleLab } from './components/SyncLifecycleLab';
import { MergetoberPackView } from './components/MergetoberPackView';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Info,
  MessageSquare,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

type ActiveTab = 'chat' | 'query' | 'graph' | 'connectors' | 'sync' | 'mergetober';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [selectedQuestionCode, setSelectedQuestionCode] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6'>('Q3');
  const [customQueryInput, setCustomQueryInput] = useState<string>('');
  const [activeCustomQuery, setActiveCustomQuery] = useState<string | null>(null);
  const [systemFilter, setSystemFilter] = useState<'all' | SourceSystem>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('SENTRY-42');
  const [isDraftRecordDeletedUpstream, setIsDraftRecordDeletedUpstream] = useState<boolean>(false);
  const [syncGeneration, setSyncGeneration] = useState<number>(1);
  const [pipelineStatusMessage, setPipelineStatusMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showAddCustomRecordModal, setShowAddCustomRecordModal] = useState<boolean>(false);

  // Dynamic custom user-injected records
  const [customRecords, setCustomRecords] = useState<SourceRecord[]>([]);
  const [newRecordSystem, setNewRecordSystem] = useState<SourceSystem>('jira');
  const [newRecordId, setNewRecordId] = useState<string>('');
  const [newRecordTitle, setNewRecordTitle] = useState<string>('');
  const [newRecordContent, setNewRecordContent] = useState<string>('');

  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);

  // Base list of records
  const activeRecords: SourceRecord[] = useMemo(() => {
    let list = isDraftRecordDeletedUpstream
      ? INITIAL_SOURCE_RECORDS.filter((r) => r.id !== 'PAY-195')
      : INITIAL_SOURCE_RECORDS;
    return [...list, ...customRecords];
  }, [isDraftRecordDeletedUpstream, customRecords]);

  const filteredTimelineRecords = useMemo(() => {
    if (systemFilter === 'all') return activeRecords;
    return activeRecords.filter((r) => r.source_system === systemFilter);
  }, [activeRecords, systemFilter]);

  const activeGoldenQuestion: GoldenQuestion = useMemo(() => {
    return (
      GOLDEN_QUESTIONS.find((q) => q.code === selectedQuestionCode) ||
      GOLDEN_QUESTIONS[2]
    );
  }, [selectedQuestionCode]);

  const selectedRecord: SourceRecord = useMemo(() => {
    return (
      activeRecords.find((r) => r.id === selectedRecordId) ||
      activeRecords[0]
    );
  }, [activeRecords, selectedRecordId]);

  const customQueryEvaluation = useMemo(() => {
    if (!activeCustomQuery) return null;
    const qLower = activeCustomQuery.toLowerCase();
    if (qLower.includes('before') || qLower.includes('similar') || qLower.includes('march') || qLower.includes('inc-42')) {
      return GOLDEN_QUESTIONS.find((q) => q.code === 'Q4') || null;
    }
    if (qLower.includes('fix') || qLower.includes('last time') || qLower.includes('resolve')) {
      return GOLDEN_QUESTIONS.find((q) => q.code === 'Q5') || null;
    }
    if (qLower.includes('know') || qLower.includes('prevent') || qLower.includes('another')) {
      return GOLDEN_QUESTIONS.find((q) => q.code === 'Q6') || null;
    }
    if (qLower.includes('what changed') || qLower.includes('latest')) {
      return GOLDEN_QUESTIONS.find((q) => q.code === 'Q1') || null;
    }
    if (qLower.includes('did that release') || qLower.includes('impact') || qLower.includes('conversion')) {
      return GOLDEN_QUESTIONS.find((q) => q.code === 'Q2') || null;
    }
    return GOLDEN_QUESTIONS.find((q) => q.code === 'Q3') || null;
  }, [activeCustomQuery]);

  const displayedQuestion = customQueryEvaluation || activeGoldenQuestion;

  const handleSelectGoldenQuestion = (code: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6') => {
    setActiveCustomQuery(null);
    setSelectedQuestionCode(code);
    const targetQ = GOLDEN_QUESTIONS.find((q) => q.code === code);
    if (targetQ && targetQ.reasoningSteps.length > 0) {
      setSelectedRecordId(targetQ.reasoningSteps[0].recordId);
    }
  };

  const handleCustomQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQueryInput.trim()) return;
    setActiveCustomQuery(customQueryInput.trim());
  };

  const handleRunCogneePipeline = () => {
    setSyncGeneration((prev) => prev + 1);
    setPipelineStatusMessage(
      'Executed cognee.add(dlt_sources) → cognee.cognify() across Jira, Vercel, Sentry, PostHog.'
    );
    setTimeout(() => {
      setPipelineStatusMessage(null);
    }, 4500);
  };

  const handleAddCustomRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordId.trim() || !newRecordTitle.trim()) return;

    const customRec: SourceRecord = {
      id: newRecordId.trim(),
      source_system: newRecordSystem,
      source_type: newRecordSystem === 'jira' ? 'issue' : newRecordSystem === 'vercel' ? 'deployment' : 'error',
      source_id: newRecordId.trim(),
      source_url: `https://app.${newRecordSystem}.com/${newRecordId.trim()}`,
      project: 'checkout-custom',
      timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'You',
      title: newRecordTitle.trim(),
      status: 'Active',
      document_source_attr: 'rendered_document',
      document_content: newRecordContent.trim() || `${newRecordId}: ${newRecordTitle}`,
      write_disposition: 'replace',
      cursor_field: 'updated_at',
      cursor_value: new Date().toISOString(),
      related_ids: []
    };

    setCustomRecords((prev) => [...prev, customRec]);
    setSelectedRecordId(customRec.id);
    setShowAddCustomRecordModal(false);
    setNewRecordId('');
    setNewRecordTitle('');
    setNewRecordContent('');
  };

  const handleCopyEnvExample = () => {
    const envText = `# Cognee Cloud / Dedicated Tenant API Connection
COGNEE_API_BASE_URL="https://tenant-615ef6f1-7b2d-4bbc-9135-d5ad2168f920.aws.cognee.ai"
COGNEE_TENANT_ID="615ef6f1-7b2d-4bbc-9135-d5ad2168f920"
COGNEE_API_KEY="namandemo"

# LLM & Inference Engine
LLM_API_KEY="namandemo"
LLM_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
LLM_MODEL="gemini-2.5-flash"
EMBEDDING_PROVIDER="gliner"
DEMO_MODE="true"

# PostHog Integration Details
POSTHOG_PROJECT_TOKEN="phc_qqfsGHhnaman"
POSTHOG_PROJECT_ID="644866"
POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_REGION="US Cloud"
POSTHOG_PERSONAL_API_KEY=""

# Sentry Integration Details
SENTRY_AUTH_TOKEN="sntryu_6e0ea94a617ebebfe7c38bfa4naman"
SENTRY_ORG_SLUG="naman-52"

# Jira & Vercel Connectors
JIRA_SUBDOMAIN="acme-payments"
JIRA_EMAIL="eng@acme.dev"
JIRA_API_TOKEN=""
VERCEL_API_TOKEN=""
VERCEL_TEAM_ID="team_checkout_core"`;

    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* 3-Zone Header Contract */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17] sticky top-0 z-30">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('chat');
          }}
          className="text-2xl font-serif-display tracking-tight text-slate-100 whitespace-nowrap"
        >
          DevMemory
        </a>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1 inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'text-amber-400 font-semibold underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Live Chat (Option A)
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'query'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Memory Query
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'graph'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'connectors'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            DLT Connectors
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'sync'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Sync &amp; Lifecycle
          </button>
          <button
            onClick={() => setActiveTab('mergetober')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'mergetober'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Mergetober Pack
          </button>
        </nav>

        {/* Primary Actions: Settings & Pipeline */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded transition-colors whitespace-nowrap"
            title="Configure Base URL, Model Name, and inspect Demo Data requirements"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>.env &amp; Data Mode</span>
          </button>
          <button
            onClick={handleRunCogneePipeline}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Pipeline
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-slate-800 bg-[#0F1522]">
        {(
          [
            ['chat', 'Live Chat'],
            ['query', 'Memory Query'],
            ['graph', 'Knowledge Graph'],
            ['connectors', 'DLT Connectors'],
            ['sync', 'Sync & Lifecycle'],
            ['mergetober', 'Mergetober Pack']
          ] as const
        ).map(([tabKey, label]) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === tabKey
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pipelineStatusMessage && (
        <div className="bg-emerald-950/60 border-b border-emerald-800/70 px-6 py-2.5 text-xs font-mono text-emerald-300 flex items-center justify-between">
          <span>{pipelineStatusMessage}</span>
          <span className="tabular-nums">Sync Gen #{syncGeneration}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8">
        {/* ================= TAB: LIVE CHAT ================= */}
        {activeTab === 'chat' && (
          <LiveChatView onSelectRecord={(id) => setSelectedRecordId(id)} />
        )}

        {/* ================= TAB: MEMORY QUERY (WORKBENCH) ================= */}
        {activeTab === 'query' && (
          <div className="space-y-8">
            <div className="border-b border-slate-800 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <p className="text-xs font-mono text-amber-400">
                  Institutional Engineering Memory on Cognee · DLT Multi-Source Ingestion
                </p>
                <h1 className="text-3xl sm:text-4xl font-serif-display text-slate-100 mt-1 tracking-tight">
                  Your codebase remembers. Your AI should too.
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Jira knows what we intended to build. Vercel knows what we shipped. Sentry knows what broke. PostHog knows what users experienced. DevMemory connects them through Cognee so engineering teams can trace root causes and recall historical precedents across time.
                </p>
              </div>

              {/* Data Mode & Environment Quick Bar */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded text-xs font-mono space-y-1.5 shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Data Mode:</span>
                  <span className="text-emerald-400 font-semibold">Demo Data (Zero Keys Needed)</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">LLM Model:</span>
                  <span className="text-amber-300">gemini-2.5-flash</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Base URL:</span>
                  <span className="text-slate-300">Google AI / Generative Language</span>
                </div>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="w-full mt-1 pt-1.5 border-t border-slate-800 text-[11px] text-amber-400 hover:text-amber-300 text-center"
                >
                  Configure Base URL &amp; View Requirements →
                </button>
              </div>
            </div>

            {/* Quick Live Chat Mode Banner */}
            <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-mono text-amber-300 font-semibold uppercase">Option A Live Conversational Chat:</span>
                  <p className="text-xs text-slate-200 mt-0.5">Chat in real time with conversational memory across all 12 source records.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Open Live Chat Tab →
              </button>
            </div>

            {/* Golden Questions Selector Bar (Q1 - Q6) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  01. Select a Golden Demo Question (or search / chat below)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Q4, Q5, Q6 test cross-time historical memory
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {GOLDEN_QUESTIONS.map((q) => {
                  const isSelected = !activeCustomQuery && selectedQuestionCode === q.code;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectGoldenQuestion(q.code)}
                      className={`text-left p-3.5 border transition-colors ${
                        isSelected
                          ? 'border-amber-500 bg-[#131C2E]'
                          : 'border-slate-800 bg-[#0F1522] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className={isSelected ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                          {q.code} · {q.category}
                        </span>
                        <span>
                          {q.expectedSources.length} sources
                          {q.requiresHistoricalMemory ? ' · History' : ''}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-100 mt-1.5 line-clamp-1">
                        {q.question}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3-Column Engineering Memory Investigation Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (3 cols): Source Timeline */}
              <div className="lg:col-span-3 border border-slate-800 bg-[#0F1522] p-4 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      Ingested Source Timeline
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeRecords.length} records in memory
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddCustomRecordModal(true)}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500 text-amber-400 rounded transition-colors"
                    title="Add custom engineering record to graph"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border border-slate-800 rounded">
                  {(['all', 'jira', 'vercel', 'sentry', 'posthog', 'git'] as const).map((sys) => (
                    <button
                      key={sys}
                      onClick={() => setSystemFilter(sys)}
                      className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap ${
                        systemFilter === sys
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sys.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-slate-800/80 max-h-[560px] overflow-y-auto pr-1">
                  {filteredTimelineRecords.map((rec) => {
                    const isSelected = selectedRecord.id === rec.id;
                    return (
                      <button
                        key={rec.id}
                        onClick={() => setSelectedRecordId(rec.id)}
                        className={`w-full text-left py-3 px-2.5 transition-colors ${
                          isSelected
                            ? 'bg-slate-800/90'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-slate-300">
                            {rec.source_system.toUpperCase()} · {rec.source_id}
                          </span>
                          <span className="tabular-nums">{rec.timestamp.slice(0, 10)}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-100 mt-1 line-clamp-2">
                          {rec.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Column (5 cols): Active Question & Answer */}
              <div className="lg:col-span-5 border border-slate-800 bg-[#0F1522] p-5 space-y-5">
                <form onSubmit={handleCustomQuerySubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customQueryInput}
                      onChange={(e) => setCustomQueryInput(e.target.value)}
                      placeholder="Ask Cognee engineering memory..."
                      className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
                  >
                    Search
                  </button>
                </form>

                <div className="border-b border-slate-800 pb-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-amber-400 font-semibold">{displayedQuestion.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{displayedQuestion.category}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-100 mt-1.5">
                    {activeCustomQuery ? activeCustomQuery : displayedQuestion.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-emerald-400">
                    Connected Engineering Answer
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    {displayedQuestion.headlineAnswer}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500 pl-3 py-1">
                    {displayedQuestion.rootCauseOrSynthesis}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-mono text-slate-400">
                    Evidence Chain:
                  </div>
                  <div className="space-y-2">
                    {displayedQuestion.reasoningSteps.map((stepObj) => (
                      <button
                        key={stepObj.step}
                        onClick={() => setSelectedRecordId(stepObj.recordId)}
                        className="w-full text-left p-3 border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-300">
                            [{stepObj.system.toUpperCase()}] {stepObj.recordId}
                          </span>
                          <span className="text-slate-400 inline-flex items-center gap-1">
                            Inspect →
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                          {stepObj.summary}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Record Inspector */}
              <div className="lg:col-span-4 border border-slate-800 bg-[#0F1522] p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-mono text-amber-400">
                    Source Provenance Inspector
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mt-1">
                    {selectedRecord.source_id} — {selectedRecord.title}
                  </h3>
                </div>

                <pre className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                  {selectedRecord.document_content}
                </pre>
              </div>
            </div>

            {/* Knowledge Graph below */}
            <KnowledgeGraphCanvas
              nodes={KNOWLEDGE_GRAPH_NODES}
              edges={KNOWLEDGE_GRAPH_EDGES}
              selectedRecordId={selectedRecord.id}
              onSelectRecord={(recId) => setSelectedRecordId(recId)}
              activeRecords={activeRecords}
            />
          </div>
        )}

        {/* ================= TAB: KNOWLEDGE GRAPH ================= */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <KnowledgeGraphCanvas
              nodes={KNOWLEDGE_GRAPH_NODES}
              edges={KNOWLEDGE_GRAPH_EDGES}
              selectedRecordId={selectedRecord.id}
              onSelectRecord={(recId) => setSelectedRecordId(recId)}
              activeRecords={activeRecords}
            />
          </div>
        )}

        {/* ================= TAB: DLT CONNECTORS ================= */}
        {activeTab === 'connectors' && <ConnectorExplorer />}

        {/* ================= TAB: SYNC & LIFECYCLE ================= */}
        {activeTab === 'sync' && (
          <SyncLifecycleLab
            records={activeRecords}
            isDraftRecordDeletedUpstream={isDraftRecordDeletedUpstream}
            syncGeneration={syncGeneration}
            onRunInitialSync={() => {
              setIsDraftRecordDeletedUpstream(false);
              setSyncGeneration(1);
            }}
            onRunIncrementalSync={() => {
              setSyncGeneration((prev) => prev + 1);
            }}
            onDeleteDraftRecordAndSync={() => {
              setIsDraftRecordDeletedUpstream(true);
              setSyncGeneration((prev) => prev + 1);
            }}
            onResetDemoState={() => {
              setIsDraftRecordDeletedUpstream(false);
              setSyncGeneration(1);
            }}
          />
        )}

        {/* ================= TAB: MERGETOBER PACK ================= */}
        {activeTab === 'mergetober' && (
          <MergetoberPackView
            onJumpToQuestion={(code) => {
              setSelectedQuestionCode(code);
              setActiveTab('chat');
            }}
          />
        )}
      </main>

      {/* ================= MODAL: .ENV CONFIG & DEMO DATA REQUIREMENTS ================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F1522] border border-slate-800 rounded-lg max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  .env Configuration &amp; Data Requirements
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How Base URL, Model Name, API Key, and Demo Data are handled.
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Active Configuration */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-amber-400 uppercase">
                1. Connected Cognee Tenant &amp; Integrations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Cognee Dedicated Tenant:</span>
                  <span className="text-emerald-400 mt-1 block break-all font-semibold">
                    tenant-615ef6f1-7b2d-4bbc-9135-d5ad2168f920.aws.cognee.ai
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tenant ID: 615ef6f1-7b2d-4bbc-9135-d5ad2168f920 · Key: namandemo
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">PostHog Project (US Cloud):</span>
                  <span className="text-amber-300 mt-1 block font-semibold">
                    Project ID: 644866
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Token: phc_qqfsGHhnaman · Host: us.i.posthog.com
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Sentry Production Org:</span>
                  <span className="text-rose-300 mt-1 block font-semibold">
                    Org Slug: naman-52
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Auth Token: sntryu_6e0ea...naman (Active)
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">LLM Reasoning Engine:</span>
                  <span className="text-emerald-400 mt-1 block font-semibold">
                    gemini-2.5-flash
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Base: generativelanguage.googleapis.com
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: What is Required? */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-amber-400 uppercase">
                2. What is Required? (Demo Data vs. Live Data)
              </h4>
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded">
                  <div className="text-xs font-mono text-emerald-400 font-semibold">
                    MODE A: RUNNING WITH DEMO DATA (CURRENT DEFAULT)
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    <strong>What is required?</strong> <span className="text-emerald-300 font-medium">Nothing!</span> You do not need any API keys, tokens, or Atlassian/Vercel/Sentry/PostHog accounts. The app comes pre-packaged with 12 real engineering records, 6 golden incident questions, and 7-month historical precedent.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-xs font-mono text-slate-300 font-semibold">
                    MODE B: RUNNING WITH LIVE CONNECTORS (REAL TOOLS)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    To ingest live data from your real engineering stack, configure these in <code className="text-slate-200">.env</code>:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 mt-2 font-mono list-disc pl-4">
                    <li><strong className="text-slate-200">LLM_API_KEY:</strong> For entity extraction &amp; answers.</li>
                    <li><strong className="text-sky-300">Jira:</strong> JIRA_SUBDOMAIN, JIRA_EMAIL, JIRA_API_TOKEN.</li>
                    <li><strong className="text-purple-300">Vercel:</strong> VERCEL_API_TOKEN, VERCEL_TEAM_ID.</li>
                    <li><strong className="text-rose-300">Sentry:</strong> SENTRY_AUTH_TOKEN, SENTRY_ORG_SLUG.</li>
                    <li><strong className="text-amber-300">PostHog:</strong> POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Copy full .env template */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Need the exact .env template?
              </span>
              <button
                onClick={handleCopyEnvExample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied .env' : 'Copy Full .env Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CUSTOM RECORD ================= */}
      {showAddCustomRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0F1522] border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100">
                Add Custom Engineering Record to Cognee Graph
              </h3>
              <button
                onClick={() => setShowAddCustomRecordModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Source System</label>
                <select
                  value={newRecordSystem}
                  onChange={(e) => setNewRecordSystem(e.target.value as SourceSystem)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-amber-500"
                >
                  <option value="jira">Jira Issue</option>
                  <option value="git">Git Commit</option>
                  <option value="vercel">Vercel Deployment</option>
                  <option value="sentry">Sentry Error</option>
                  <option value="posthog">PostHog Feature Flag</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Record ID (e.g. AUTH-201, dep-992)</label>
                <input
                  type="text"
                  required
                  value={newRecordId}
                  onChange={(e) => setNewRecordId(e.target.value)}
                  placeholder="e.g. AUTH-201"
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Title / Summary</label>
                <input
                  type="text"
                  required
                  value={newRecordTitle}
                  onChange={(e) => setNewRecordTitle(e.target.value)}
                  placeholder="e.g. Invalidate OAuth session on logout"
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Document Content (DOCUMENT_SOURCE_ATTR)</label>
                <textarea
                  rows={4}
                  value={newRecordContent}
                  onChange={(e) => setNewRecordContent(e.target.value)}
                  placeholder="Description, comments, or stack trace details..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomRecordModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded hover:bg-amber-400"
                >
                  Inject into Cognee Graph
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 mt-12 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>DevMemory — Cognee Engineering Memory Engine</div>
        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-3">
          <span>Model: <code className="text-amber-300">gemini-2.5-flash</code></span>
          <span aria-hidden="true">·</span>
          <span>Option A CLI: <code className="text-emerald-400">python demo/chat_cli.py</code></span>
        </div>
      </footer>
    </div>
  );
}
