import React, { useState } from 'react';
import { CONNECTOR_SPECS, ConnectorPackageSpec, PR_QUALITY_GATES } from '../data/devMemoryData';
import { Check, Copy, Play, ShieldCheck } from 'lucide-react';

export const ConnectorExplorer: React.FC = () => {
  const [selectedConnectorId, setSelectedConnectorId] = useState<'jira' | 'vercel' | 'sentry' | 'posthog'>('jira');
  const [testRunState, setTestRunState] = useState<'idle' | 'running' | 'passed'>('passed');

  const activeSpec: ConnectorPackageSpec =
    CONNECTOR_SPECS.find((c) => c.id === selectedConnectorId) || CONNECTOR_SPECS[0];

  const handleRunTests = () => {
    setTestRunState('running');
    setTimeout(() => {
      setTestRunState('passed');
    }, 350);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-amber-400">
            cognee-community / packages / connector / *
          </p>
          <h2 className="text-2xl font-semibold text-slate-100 mt-1">
            DLT Data-Source Connector Packages
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Implemented strictly in the packages/connector/&lt;name&gt;/ layout using DLT verified sources and declarative RESTAPIConfig.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded">
          {CONNECTOR_SPECS.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedConnectorId(spec.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedConnectorId === spec.id
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {spec.id.toUpperCase()} Connector
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-800 bg-[#0F1522] p-5 space-y-4">
        <div className="border-b border-slate-800/80 pb-3">
          <div className="text-xs font-mono text-slate-400">
            <span>{activeSpec.packageName}</span>
            <span className="mx-1.5">·</span>
            <span className="text-amber-400">{activeSpec.dltStrategy}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mt-1">
            {activeSpec.lifecycleRole}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Core Question: &ldquo;{activeSpec.coreQuestion}&rdquo;
          </p>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="text-slate-400 font-medium">Source Factory</dt>
            <dd className="font-mono text-slate-200 mt-1 bg-slate-950 p-2 border border-slate-800">
              {activeSpec.sourceFactoryName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Document Source Attribute</dt>
            <dd className="font-mono text-emerald-300 mt-1 bg-slate-950 p-2 border border-slate-800">
              {activeSpec.documentSourceAttr}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Write Disposition</dt>
            <dd className="text-slate-300 mt-1">
              <span className="font-mono text-amber-300">{activeSpec.writeDisposition}</span> — {activeSpec.writeDispositionRationale}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Incremental Synchronization</dt>
            <dd className="text-slate-300 mt-1">{activeSpec.cursorMechanism}</dd>
          </div>
        </dl>
      </div>

      {/* Pytest Suite */}
      <div className="border border-slate-800 bg-[#0F1522] p-5">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Connector Pytest Suite ({activeSpec.directoryPath}tests/)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tests authentication, pagination, incremental cursor, upstream deletion, and secret exclusion.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 rounded transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            {testRunState === 'running' ? 'Running pytest...' : 'Run pytest'}
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activeSpec.unitTests.map((t) => (
            <div key={t.name} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-100">
                  <span>{t.name}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-emerald-400">
                    {testRunState === 'running' ? 'RUNNING' : 'PASSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.assertionSummary}</p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                {t.durationMs}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
