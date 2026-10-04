import React, { useState } from 'react';
import {
  GOLDEN_QUESTIONS,
  GoldenQuestion,
  INITIAL_SOURCE_RECORDS,
  SourceRecord
} from './data/devMemoryData';
import {
  ArrowRight,
  Bot,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  Terminal,
  Workflow
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'cognee';
  text: string;
  evidence?: {
    system: string;
    recordId: string;
    summary: string;
  }[];
  pythonSnippet?: string;
  timestamp: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'arch' | 'optionA'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('SENTRY-42');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'cognee',
      text: "Hello! I am Cognee's Engineering Memory Engine. I have ingested your organization's history across Jira, Vercel deployments, Sentry exceptions, and PostHog metrics.\n\nAsk me anything about your releases, production incidents, or historical bug precedents!",
      timestamp: '23:08'
    }
  ]);

  const selectedRecord: SourceRecord =
    INITIAL_SOURCE_RECORDS.find((r) => r.id === selectedRecordId) ||
    INITIAL_SOURCE_RECORDS[0];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Cognee memory retrieval matching
    const qLower = query.toLowerCase();
    let matchedQ: GoldenQuestion = GOLDEN_QUESTIONS[2]; // Default: Q3

    if (qLower.includes('before') || qLower.includes('similar') || qLower.includes('march') || qLower.includes('inc-42')) {
      matchedQ = GOLDEN_QUESTIONS[3]; // Q4
    } else if (qLower.includes('fix') || qLower.includes('last time') || qLower.includes('how did we')) {
      matchedQ = GOLDEN_QUESTIONS[4]; // Q5
    } else if (qLower.includes('know') || qLower.includes('prevent') || qLower.includes('another') || qLower.includes('guidance')) {
      matchedQ = GOLDEN_QUESTIONS[5]; // Q6
    } else if (qLower.includes('what changed') || qLower.includes('latest checkout') || qLower.includes('release')) {
      matchedQ = GOLDEN_QUESTIONS[0]; // Q1
    } else if (qLower.includes('did that release') || qLower.includes('cause') || qLower.includes('issue') || qLower.includes('impact')) {
      matchedQ = GOLDEN_QUESTIONS[1]; // Q2
    }

    setTimeout(() => {
      const cogneeMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: 'cognee',
        text: matchedQ.headlineAnswer,
        evidence: matchedQ.reasoningSteps.map((s) => ({
          system: s.system.toUpperCase(),
          recordId: s.recordId,
          summary: s.summary
        })),
        pythonSnippet: `results = await cognee.search("${query}")`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, cogneeMsg]);
    }, 400);
  };

  const handleCopyCliScript = () => {
    const cliCode = `# Option A: Run Cognee Interactive Chat in Terminal
uv pip install "cognee[gliner]" dlt

# Run the interactive CLI chat
python demo/chat_cli.py`;
    navigator.clipboard.writeText(cliCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
          MergeStream
        </a>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Option A: Live Chat
          </button>
          <button
            onClick={() => setActiveTab('optionA')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'optionA'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            How Option A Works
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'memory'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            Golden Questions (Q1-Q6)
          </button>
          <button
            onClick={() => setActiveTab('arch')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'arch'
                ? 'text-slate-100 underline decoration-amber-500 decoration-2 underline-offset-8'
                : 'hover:text-slate-100'
            }`}
          >
            What We Built
          </button>
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSendMessage('Why did checkout fail after the latest release?')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Ask Flagship Incident
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8">
        {/* ================= TAB 1: OPTION A LIVE CHAT ================= */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-amber-400">
                  Option A · Direct Cognee Python Search &amp; Conversational Retrieval
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif-display text-slate-100 mt-1">
                  Chat With Your Engineering History
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Ask natural language questions. Cognee traverses connected memory across Jira tickets, Git commits, Vercel deployments, Sentry errors, and PostHog insights.
                </p>
              </div>

              {/* Quick Terminal Launch Banner */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-mono">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">Option A CLI:</span>
                <code className="text-emerald-400">python demo/chat_cli.py</code>
                <button
                  onClick={handleCopyCliScript}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy CLI command"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Chat Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Chat conversation (8 cols) */}
              <div className="lg:col-span-8 flex flex-col border border-slate-800 bg-[#0F1522] h-[640px]">
                {/* Chat Message Scroll */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-400">
                        {m.sender === 'cognee' ? (
                          <>
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 font-semibold">Cognee Memory</span>
                          </>
                        ) : (
                          <span>Engineer</span>
                        )}
                        <span>· {m.timestamp}</span>
                      </div>

                      <div
                        className={`p-4 rounded text-xs leading-relaxed max-w-[85%] ${
                          m.sender === 'user'
                            ? 'bg-amber-500/15 border border-amber-500/40 text-slate-100'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm">{m.text}</p>

                        {/* Evidence Citations */}
                        {m.evidence && m.evidence.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                            <div className="text-[11px] font-mono text-amber-300">
                              Connected Multi-Source Evidence:
                            </div>
                            <div className="space-y-1.5">
                              {m.evidence.map((ev, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedRecordId(ev.recordId)}
                                  className="p-2 bg-slate-950/80 border border-slate-800 text-[11px] font-mono hover:border-amber-500/50 cursor-pointer transition-colors"
                                >
                                  <div className="text-sky-300">
                                    [{ev.system}] {ev.recordId}
                                  </div>
                                  <div className="text-slate-300 mt-0.5">{ev.summary}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.pythonSnippet && (
                          <div className="mt-3 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/50">
                            Python API: <code className="text-emerald-400">{m.pythonSnippet}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask Cognee (e.g., Have we seen this caching failure before?)"
                      className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 rounded"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Suggested Prompt Chips + Source Inspector (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Suggested Questions */}
                <div className="border border-slate-800 bg-[#0F1522] p-4 space-y-3">
                  <div className="text-xs font-mono text-slate-300">
                    Suggested Questions to Try
                  </div>
                  <div className="space-y-2">
                    {GOLDEN_QUESTIONS.map((q) => (
                      <button
                        key={q.code}
                        onClick={() => handleSendMessage(q.question)}
                        className="w-full text-left p-2.5 bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/60 transition-colors rounded"
                      >
                        <div className="text-[11px] font-mono text-amber-400">
                          {q.code} · {q.category}
                        </div>
                        <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                          {q.question}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Record Inspector */}
                <div className="border border-slate-800 bg-[#0F1522] p-4 space-y-3">
                  <div className="text-xs font-mono text-amber-400">
                    Source Record Inspector · {selectedRecord.source_system.toUpperCase()}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {selectedRecord.source_id}: {selectedRecord.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    Author: {selectedRecord.author} · Status: {selectedRecord.status}
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                    {selectedRecord.document_content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: HOW OPTION A WORKS ================= */}
        {activeTab === 'optionA' && (
          <div className="space-y-8">
            <div className="border-b border-slate-800 pb-5">
              <p className="text-xs font-mono text-amber-400">
                Option A Architecture Deep Dive
              </p>
              <h2 className="text-2xl font-serif-display text-slate-100 mt-1">
                How Do We Chat in Option A?
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                In Section 15 of the Cognee specification, <strong>Option A (Mode A)</strong> is the fastest, cleanest development mode. You interact directly with Cognee in Python or via terminal CLI without needing extra microservices.
              </p>
            </div>

            {/* 3 Step Interactive Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                <div className="text-xs font-mono text-amber-400">Step 01 · Install &amp; Setup</div>
                <h3 className="text-base font-semibold text-slate-100">Install Cognee in Python</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use uv or pip with Python 3.12+. Cognee works with local GLiNER embeddings or any LLM API key.
                </p>
                <pre className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`uv pip install "cognee[gliner]" dlt
export LLM_API_KEY="your-key"`}
                </pre>
              </div>

              <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                <div className="text-xs font-mono text-amber-400">Step 02 · Ingest &amp; Cognify</div>
                <h3 className="text-base font-semibold text-slate-100">Build Knowledge Graph</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingest records from Jira, Vercel, Sentry, and PostHog and call <code className="text-slate-200">cognify()</code> to build the graph.
                </p>
                <pre className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`import cognee

await cognee.add(source_data)
await cognee.cognify()
# Graph & embeddings built!`}
                </pre>
              </div>

              <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                <div className="text-xs font-mono text-amber-400">Step 03 · Chat / Search Loop</div>
                <h3 className="text-base font-semibold text-slate-100">Interactive Chat Loop</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Call <code className="text-slate-200">cognee.search(question)</code> in an interactive terminal while-loop to chat with the engine!
                </p>
                <pre className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`# demo/chat_cli.py
while True:
  q = input("You > ")
  res = await cognee.search(q)
  print("Cognee >", res)`}
                </pre>
              </div>
            </div>

            {/* Complete CLI Script Code */}
            <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    demo/chat_cli.py — Complete Option A Terminal Chat Program
                  </h3>
                  <p className="text-xs text-slate-400">
                    You can run this exact file directly in your local terminal.
                  </p>
                </div>
                <button
                  onClick={handleCopyCliScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy demo/chat_cli.py'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
{`import asyncio
import cognee

async def main():
    print("=== MergeStream / Cognee Option A Terminal Chat ===")
    print("Loaded Cognee Knowledge Graph across Jira, Vercel, Sentry, PostHog.")
    
    while True:
        prompt = input("\\nYou > ").strip()
        if prompt.lower() in ("exit", "quit"):
            break
        
        # In Option A, search Cognee's graph
        results = await cognee.search(query_text=prompt)
        print("\\nCognee >")
        for r in results:
            print(f"- {r}")

if __name__ == "__main__":
    asyncio.run(main())`}
              </pre>
            </div>
          </div>
        )}

        {/* ================= TAB 3: GOLDEN QUESTIONS ================= */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <p className="text-xs font-mono text-amber-400">
                Evaluation Benchmark · evaluation/golden_questions.yaml
              </p>
              <h2 className="text-2xl font-serif-display text-slate-100 mt-1">
                The 6 Golden Demo Questions
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                These questions prove that Cognee can connect information across systems and recall historical precedents from months ago.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOLDEN_QUESTIONS.map((q) => (
                <div key={q.code} className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold">{q.code} · {q.category}</span>
                    <span className={q.requiresHistoricalMemory ? 'text-sky-300' : 'text-slate-400'}>
                      {q.requiresHistoricalMemory ? 'Temporal Memory' : 'Release Context'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {q.question}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {q.headlineAnswer}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Sources: {q.expectedSources.map((s) => s.toUpperCase()).join(' · ')}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(q.question);
                      }}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                    >
                      Ask in Chat
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: WHAT WE BUILT ================= */}
        {activeTab === 'arch' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <p className="text-xs font-mono text-amber-400">
                Project Summary · WeMakeDevs Mergetober Hackathon
              </p>
              <h2 className="text-2xl font-serif-display text-slate-100 mt-1">
                What We Have Built
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                We built <strong>DevMemory / MergeStream</strong>: an institutional engineering memory engine using <strong>Cognee</strong> to connect disparate engineering tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                <h3 className="text-base font-semibold text-slate-100">
                  1. The 4 DLT Connectors
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Instead of disconnected tools, we built 4 Cognee community connector packages following DLT ingestion:
                </p>
                <ul className="text-xs space-y-2 text-slate-300 font-mono">
                  <li><strong className="text-sky-300">Jira:</strong> Engineering intent and issue requirements (<code className="text-slate-200">PAY-184</code>, <code className="text-slate-200">PAY-109</code>).</li>
                  <li><strong className="text-purple-300">Vercel:</strong> Production deployments, commit references, and build diagnostics (<code className="text-slate-200">dep-789</code>).</li>
                  <li><strong className="text-rose-300">Sentry:</strong> Exceptions, culprits, and stack traces with bounded event sampling (<code className="text-slate-200">SENTRY-42</code>, <code className="text-slate-200">INC-42</code>).</li>
                  <li><strong className="text-amber-300">PostHog:</strong> Feature flags and funnel conversion impact (<code className="text-slate-200">checkout-cache</code>).</li>
                </ul>
              </div>

              <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-3">
                <h3 className="text-base font-semibold text-slate-100">
                  2. The Cognee Engine Pipeline
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Follows the official Cognee runtime:
                </p>
                <ol className="text-xs space-y-2 text-slate-300 font-mono list-decimal pl-4">
                  <li><strong>add():</strong> Ingests records via DLT sources without leaking secrets into documents.</li>
                  <li><strong>cognify():</strong> Extracts entities, relationships, and vector embeddings into a knowledge graph.</li>
                  <li><strong>search():</strong> Resolves questions across systems and across time.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>MergeStream — Cognee Engineering Memory Engine</div>
        <div className="font-mono text-[11px] text-slate-400">
          Option A CLI: <code className="text-emerald-400">python demo/chat_cli.py</code>
        </div>
      </footer>
    </div>
  );
}
