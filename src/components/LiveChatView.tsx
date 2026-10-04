import React, { useState, useRef, useEffect } from 'react';
import { GOLDEN_QUESTIONS, GoldenQuestion, INITIAL_SOURCE_RECORDS, SourceRecord } from '../data/devMemoryData';
import { Bot, Check, Copy, ExternalLink, Play, Send, Sparkles, Terminal, User } from 'lucide-react';

export interface ChatMessage {
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
  latencyMs?: number;
}

interface LiveChatViewProps {
  onSelectRecord?: (recordId: string) => void;
}

export const LiveChatView: React.FC<LiveChatViewProps> = ({ onSelectRecord }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'cognee',
      text: "👋 Welcome to Cognee Option A Live Chat!\n\nI have ingested and cognified your engineering lifecycle across Jira (intent), Git/Vercel (deployment), Sentry (incidents), and PostHog (telemetry).\n\nAsk me any question below — or try one of the Golden Questions on the right!",
      timestamp: '23:25',
      pythonSnippet: 'await cognee.search(query_text=question)'
    },
    {
      id: 'sample-q',
      sender: 'user',
      text: 'Why did checkout fail after the latest release?',
      timestamp: '23:26'
    },
    {
      id: 'sample-a',
      sender: 'cognee',
      text: "Commit abc1234 (shipped in PAY-184 / Vercel deployment dep-789) keyed Redis CartSession cache entries solely by checkout:session:{user_id} with a 15-minute TTL and omitted cache invalidation on PATCH /cart.\n\nWhen users modified cart quantities before paying, Stripe PaymentIntent used the updated live total ($149) while checkout validation read the stale cached total ($199), throwing CurrencyMismatchError (SENTRY-42 affecting 164 users).",
      evidence: [
        { system: 'JIRA', recordId: 'PAY-184', summary: 'Requested 15-min Redis session cache to reduce 480ms p95 latency.' },
        { system: 'GIT', recordId: 'abc1234', summary: 'Keyed Redis cache by user_id without cart_version_hash or invalidation hook.' },
        { system: 'VERCEL', recordId: 'dep-789', summary: 'Promoted commit abc1234 to production as release v2.8.0.' },
        { system: 'SENTRY', recordId: 'SENTRY-42', summary: '418 CurrencyMismatchError events in checkout.service.create_intent.' },
        { system: 'POSTHOG', recordId: 'checkout-cache', summary: 'Captured -6.4% drop in checkout completion conversion.' }
      ],
      pythonSnippet: 'results = await cognee.search("Why did checkout fail after the latest release?")',
      timestamp: '23:26',
      latencyMs: 164
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<SourceRecord | null>(
    INITIAL_SOURCE_RECORDS.find((r) => r.id === 'SENTRY-42') || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Match against Cognee knowledge graph
    const qLower = query.toLowerCase();
    let matchedQ: GoldenQuestion = GOLDEN_QUESTIONS[2]; // Default: Q3

    if (qLower.includes('before') || qLower.includes('similar') || qLower.includes('march') || qLower.includes('inc-42')) {
      matchedQ = GOLDEN_QUESTIONS[3]; // Q4
    } else if (qLower.includes('fix') || qLower.includes('last time') || qLower.includes('how did we')) {
      matchedQ = GOLDEN_QUESTIONS[4]; // Q5
    } else if (qLower.includes('know') || qLower.includes('prevent') || qLower.includes('another') || qLower.includes('guardrail')) {
      matchedQ = GOLDEN_QUESTIONS[5]; // Q6
    } else if (qLower.includes('what changed') || qLower.includes('latest checkout') || qLower.includes('release')) {
      matchedQ = GOLDEN_QUESTIONS[0]; // Q1
    } else if (qLower.includes('did that release') || qLower.includes('cause') || qLower.includes('issue') || qLower.includes('impact')) {
      matchedQ = GOLDEN_QUESTIONS[1]; // Q2
    }

    setTimeout(() => {
      setIsTyping(false);
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: Math.floor(130 + Math.random() * 50)
      };
      setMessages((prev) => [...prev, cogneeMsg]);
    }, 450);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('python demo/chat_cli.py');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleRecordClick = (recordId: string) => {
    const found = INITIAL_SOURCE_RECORDS.find((r) => r.id === recordId);
    if (found) {
      setSelectedRecordDetail(found);
    }
    if (onSelectRecord) {
      onSelectRecord(recordId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Option A */}
      <div className="border border-slate-800 bg-[#0F1522] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE CHAT ENGINE READY · OPTION A (PYTHON / CLI WORKFLOW)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display text-slate-100 mt-1">
            Interactive Engineering Chat
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Chat directly with Cognee’s connected memory graph. Query incidents, releases, root causes, and historical bug precedents.
          </p>
        </div>

        {/* Option A CLI Launcher Badge */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono shrink-0">
          <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400">Run Option A in Terminal:</span>
          <code className="text-emerald-400 font-semibold">python demo/chat_cli.py</code>
          <button
            onClick={handleCopyCli}
            className="p-1 hover:text-white text-slate-400 transition-colors"
            title="Copy command"
          >
            {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Interactive Chat Window */}
        <div className="lg:col-span-8 flex flex-col border border-slate-800 bg-[#0F1522] h-[660px]">
          {/* Chat Header with active .env model and data mode */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-medium text-slate-200">
                Cognee Memory Agent
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-800/60 rounded">
                Demo Data Mode (Zero Keys Needed)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Model: <code className="text-amber-300">gemini-2.5-flash</code></span>
              <span aria-hidden="true">·</span>
              <span>Base: <code className="text-slate-300">generativelanguage.googleapis.com</code></span>
            </div>
          </div>

          {/* Messages Stream */}
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
                      <Bot className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-semibold">Cognee Engine</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Engineer</span>
                    </>
                  )}
                  <span>· {m.timestamp}</span>
                  {m.latencyMs && (
                    <span className="text-emerald-400 tabular-nums">· {m.latencyMs}ms</span>
                  )}
                </div>

                <div
                  className={`p-4 rounded text-xs leading-relaxed max-w-[90%] ${
                    m.sender === 'user'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-slate-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{m.text}</p>

                  {/* Evidence Citations */}
                  {m.evidence && m.evidence.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[11px] font-mono text-amber-300 flex items-center justify-between">
                        <span>Connected Multi-Source Evidence Chain:</span>
                        <span className="text-slate-400">Click to inspect</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {m.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleRecordClick(ev.recordId)}
                            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-colors text-[11px] font-mono"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sky-300 font-semibold">
                                [{ev.system}] {ev.recordId}
                              </span>
                              <span className="text-slate-400 text-[10px]">Inspect →</span>
                            </div>
                            <div className="text-slate-300 mt-1 font-sans">{ev.summary}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.pythonSnippet && (
                    <div className="mt-3 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                      Python: <code className="text-emerald-400">{m.pythonSnippet}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 p-2">
                <span className="animate-spin inline-block">⚙</span>
                <span>Cognee is traversing the knowledge graph...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/70">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Cognee (e.g. Have we seen this caching failure before?)"
                className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 rounded"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-4 py-2.5 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Ask Cognee
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Golden Prompts + Live Source Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Prompts */}
          <div className="border border-slate-800 bg-[#0F1522] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200 font-semibold">Golden Demo Questions</span>
              <span className="text-amber-400">1-Click Prompt</span>
            </div>
            <div className="space-y-2">
              {GOLDEN_QUESTIONS.map((q) => (
                <button
                  key={q.code}
                  onClick={() => handleSendMessage(q.question)}
                  className="w-full text-left p-2.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500 transition-colors text-xs rounded"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                    <span>{q.code} · {q.category}</span>
                    {q.requiresHistoricalMemory && (
                      <span className="text-sky-300">Mar 2026</span>
                    )}
                  </div>
                  <div className="text-slate-200 mt-1 font-medium line-clamp-2">
                    {q.question}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inspected Record Details */}
          {selectedRecordDetail && (
            <div className="border border-slate-800 bg-[#0F1522] p-4 space-y-2.5">
              <div className="text-xs font-mono text-amber-400">
                Inspected Record · {selectedRecordDetail.source_system.toUpperCase()}
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                {selectedRecordDetail.source_id}: {selectedRecordDetail.title}
              </h3>
              <div className="text-[11px] font-mono text-slate-400">
                Author: {selectedRecordDetail.author} · Status: {selectedRecordDetail.status}
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[170px] overflow-y-auto">
                {selectedRecordDetail.document_content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
