import React, { useState } from 'react';
import { SourceRecord } from '../data/devMemoryData';
import { Play, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

interface SyncLifecycleLabProps {
  records: SourceRecord[];
  isDraftRecordDeletedUpstream: boolean;
  syncGeneration: number;
  onRunInitialSync: () => void;
  onRunIncrementalSync: () => void;
  onDeleteDraftRecordAndSync: () => void;
  onResetDemoState: () => void;
}

export const SyncLifecycleLab: React.FC<SyncLifecycleLabProps> = ({
  records,
  isDraftRecordDeletedUpstream,
  syncGeneration,
  onRunInitialSync,
  onRunIncrementalSync,
  onDeleteDraftRecordAndSync,
  onResetDemoState
}) => {
  const [deletionTestStep, setDeletionTestStep] = useState<number>(isDraftRecordDeletedUpstream ? 6 : 3);
  const [searchProbeQuery, setSearchProbeQuery] = useState<string>('PAY-195 GraphQL checkout Edge cache spike');

  const draftMatches = records.filter(
    (r) =>
      r.id.toLowerCase().includes('pay-195') ||
      r.document_content.toLowerCase().includes(searchProbeQuery.toLowerCase())
  );

  const handleExecuteDeletionProtocol = () => {
    setDeletionTestStep(4);
    setTimeout(() => {
      setDeletionTestStep(5);
      onDeleteDraftRecordAndSync();
      setTimeout(() => {
        setDeletionTestStep(6);
      }, 150);
    }, 150);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-amber-400">
            Cognee Runtime · add() → cognify() → search()
          </p>
          <h2 className="text-2xl font-semibold text-slate-100 mt-1">
            DLT Incremental Synchronization &amp; Deletion Semantics Lab
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Verifies cursor state persistence, zero duplicate records on re-sync, and upstream deletion propagation via Cognee orphan cleanup.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunInitialSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            1st Sync (Snapshot)
          </button>
          <button
            onClick={onRunIncrementalSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-amber-500 text-slate-950 hover:bg-amber-400 rounded transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            2nd Sync (Incremental)
          </button>
          <button
            onClick={onResetDemoState}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-700 text-slate-300 hover:text-white rounded transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Upstream Deletion Test */}
      <div className="border border-slate-800 bg-[#0F1522] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Upstream Deletion &amp; Orphan Cleanup Verification (Sec. 10)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proves upstream deletion does not leave stale knowledge in Cognee. Target: PAY-195.
            </p>
          </div>

          {!isDraftRecordDeletedUpstream ? (
            <button
              onClick={handleExecuteDeletionProtocol}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 rounded transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete PAY-195 Upstream &amp; Re-Sync
            </button>
          ) : (
            <button
              onClick={onResetDemoState}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore PAY-195
            </button>
          )}
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="text-amber-400">
            Probe Status: {draftMatches.length > 0 ? 'PAY-195 is present in Cognee graph' : 'PAY-195 has been purged by orphan cleanup (0 hits)'}
          </div>
        </div>
      </div>
    </div>
  );
};
