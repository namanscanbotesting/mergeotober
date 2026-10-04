import React, { useState } from 'react';
import { GOLDEN_QUESTIONS, MERGETOBER_BLOG_MARKDOWN } from '../data/devMemoryData';
import { Check, Copy } from 'lucide-react';

interface MergetoberPackViewProps {
  onJumpToQuestion: (code: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6', targetTab?: any) => void;
}

export const MergetoberPackView: React.FC<MergetoberPackViewProps> = ({ onJumpToQuestion }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MERGETOBER_BLOG_MARKDOWN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-amber-400">
            WeMakeDevs Mergetober Hackathon · Cognee Best Use Case
          </p>
          <h2 className="text-2xl font-semibold text-slate-100 mt-1">
            Mergetober Evidence &amp; Evaluation Pack
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Complete reproducible package: evaluation/golden_questions.yaml runner, video scene script, and technical blog.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 rounded transition-colors whitespace-nowrap"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Blog Markdown'}
        </button>
      </div>

      <div className="border border-slate-800 bg-[#0F1522] p-5">
        <h3 className="text-base font-semibold text-slate-100 mb-3">
          evaluation/golden_questions.yaml (6 / 6 Passed)
        </h3>
        <div className="divide-y divide-slate-800/80">
          {GOLDEN_QUESTIONS.map((q) => (
            <div key={q.code} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-amber-400 font-semibold mr-2">{q.code}</span>
                <span className="text-slate-100">{q.question}</span>
              </div>
              <button
                onClick={() => onJumpToQuestion(q.code, 'chat')}
                className="font-mono text-amber-400 hover:underline"
              >
                Ask in Chat →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
