import React from 'react';
import {
  GraphEdge,
  GraphNode,
  SourceRecord,
  SourceSystem
} from '../data/devMemoryData';

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  selectedRecordId: string;
  onSelectRecord: (recordId: string) => void;
  activeRecords: SourceRecord[];
}

const SYSTEM_ACCENT: Record<SourceSystem, { stroke: string; text: string; label: string }> = {
  jira: { stroke: '#38BDF8', text: '#7DD3FC', label: 'Jira' },
  git: { stroke: '#A78BFA', text: '#C4B5FD', label: 'Git' },
  vercel: { stroke: '#F8FAFC', text: '#E2E8F0', label: 'Vercel' },
  sentry: { stroke: '#F87171', text: '#FCA5A5', label: 'Sentry' },
  posthog: { stroke: '#FBBF24', text: '#FDE68A', label: 'PostHog' }
};

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({
  nodes,
  edges,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  selectedRecordId,
  onSelectRecord,
  activeRecords
}) => {
  const activeIdSet = new Set(activeRecords.map((r) => r.id));
  const visibleNodes = nodes.filter((n) => activeIdSet.has(n.recordId));
  const nodeMap = new Map<string, GraphNode>(visibleNodes.map((n) => [n.id, n]));

  return (
    <div className="border border-slate-800 bg-[#0F1522] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Cognee Cross-System &amp; Temporal Knowledge Graph
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click any graph entity to inspect its normalized DLT record, provenance URL, and DOCUMENT_SOURCE_ATTR payload.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <span>Jira (Intent)</span>
          <span aria-hidden="true">·</span>
          <span>Git (Code)</span>
          <span aria-hidden="true">·</span>
          <span>Vercel (Release)</span>
          <span aria-hidden="true">·</span>
          <span>Sentry (Incident)</span>
          <span aria-hidden="true">·</span>
          <span>PostHog (Impact)</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1120 490"
          className="w-full min-w-[780px] h-auto select-none"
          role="img"
          aria-label="Cognee Engineering Memory Knowledge Graph"
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
            </marker>
            <marker
              id="arrow-memory"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
            </marker>
          </defs>

          {/* Temporal Layer Bands */}
          <rect
            x="20"
            y="30"
            width="1080"
            height="300"
            rx="4"
            fill="#0B0F17"
            stroke="#1E293B"
            strokeWidth="1"
          />
          <text x="36" y="54" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono, monospace">
            CURRENT LIFECYCLE LAYER · OCTOBER 2026 (Release v2.8.0 Incident → Hotfix v2.8.1)
          </text>

          <rect
            x="20"
            y="348"
            width="1080"
            height="122"
            rx="4"
            fill="#0B0F17"
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x="36" y="372" fill="#7DD3FC" fontSize="11" fontFamily="JetBrains Mono, monospace">
            INSTITUTIONAL MEMORY LAYER · MARCH 2026 PRECEDENT (Retrieved via Cognee Semantic Graph Bridge)
          </text>

          {/* Edges */}
          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = highlightedEdgeIds.includes(edge.id);
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            const strokeColor = isHighlighted
              ? edge.isMemoryBridge
                ? '#38BDF8'
                : '#F59E0B'
              : edge.isMemoryBridge
              ? '#0284C7'
              : '#334155';

            const markerId = isHighlighted
              ? edge.isMemoryBridge
                ? 'url(#arrow-memory)'
                : 'url(#arrow-active)'
              : 'url(#arrow-default)';

            return (
              <g key={edge.id}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2.25 : 1.25}
                  strokeDasharray={edge.isMemoryBridge ? '5 4' : undefined}
                  markerEnd={markerId}
                  opacity={isHighlighted ? 1 : 0.55}
                />
                <text
                  x={midX}
                  y={midY - 7}
                  textAnchor="middle"
                  fill={isHighlighted ? '#F8FAFC' : '#64748B'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.relation}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const isHighlighted = highlightedNodeIds.includes(node.id);
            const isSelected = selectedRecordId === node.recordId;
            const sysStyle = SYSTEM_ACCENT[node.system] || SYSTEM_ACCENT.jira;
            const boxWidth = 172;
            const boxHeight = 58;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - boxWidth / 2}, ${node.y - boxHeight / 2})`}
                onClick={() => onSelectRecord(node.recordId)}
                className="cursor-pointer"
              >
                <rect
                  width={boxWidth}
                  height={boxHeight}
                  rx="4"
                  fill={isSelected ? '#1E293B' : '#111827'}
                  stroke={
                    isSelected
                      ? '#F59E0B'
                      : isHighlighted
                      ? sysStyle.stroke
                      : '#334155'
                  }
                  strokeWidth={isSelected ? 2 : isHighlighted ? 1.75 : 1}
                />
                <text
                  x="12"
                  y="22"
                  fill={isHighlighted || isSelected ? '#F8FAFC' : '#CBD5E1'}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.label}
                </text>
                <text
                  x="12"
                  y="41"
                  fill={isHighlighted ? sysStyle.text : '#94A3B8'}
                  fontSize="11"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
