"use client";

import { useMemo } from "react";
import type { BackendAgent } from "../../../app/lib/backend";

type Props = { agents: BackendAgent[] };

type NodeMeta = {
  id: string;
  name: string;
  layer: string;
  color: string;
};

type SecondaryMeta = NodeMeta & { label: string };

const MAIN_FLOW: NodeMeta[] = [
  { id: "Agent-01", name: "Collector",         layer: "INGESTION",     color: "#EF4444" },
  { id: "Agent-02", name: "Activity Monitor",  layer: "ANALYSIS",      color: "#38BDF8" },
  { id: "Agent-03", name: "Risk Analyst",      layer: "AI EVAL",       color: "#A78BFA" },
  { id: "CORE",     name: "CORE Orchestrator", layer: "ORCHESTRATION", color: "#9B5CF6" },
  { id: "Agent-04", name: "Enforcer",          layer: "ENFORCEMENT",   color: "#06B6D4" },
];

const SECONDARY_NODES: SecondaryMeta[] = [
  { id: "Agent-05", name: "Productivity Detector", layer: "SCORING", color: "#F59E0B", label: "feeds → Risk Analyst" },
  { id: "Agent-06", name: "Orchestrator",           layer: "ROUTING", color: "#F97316", label: "delegates → CORE" },
  { id: "Agent-07", name: "Audit Trail",            layer: "LOGGING", color: "#C084FC", label: "receives ← CORE" },
];

export default function AgentPipeline({ agents }: Props) {
  const agentMap = useMemo(() => {
    const map = new Map<string, BackendAgent>();
    for (const a of agents) map.set(a.id, a);
    return map;
  }, [agents]);

  const activeCount = agents.filter((a) => a.status.toLowerCase() !== "idle").length;

  return (
    <div className="bb-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--glow-purple)]">
            Architecture
          </p>
          <h2 className="mt-1 font-heading text-base font-semibold text-white">
            AI Decision Pipeline
          </h2>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-400 animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" />
          {activeCount}/{agents.length} ACTIVE
        </span>
      </div>

      {/* Main flow */}
      <div className="flex items-center overflow-x-auto pb-1">
        {MAIN_FLOW.map((node, idx) => (
          <div key={node.id} className="flex items-center shrink-0">
            <PipelineNode meta={node} agent={agentMap.get(node.id)} />
            {idx < MAIN_FLOW.length - 1 && (
              <PipelineConnector color={node.color} delay={idx * 0.32} />
            )}
          </div>
        ))}
      </div>

      {/* Secondary agents */}
      <div className="mt-5 border-t border-white/[0.05] pt-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Supporting Agents
        </p>
        <div className="flex flex-wrap gap-3">
          {SECONDARY_NODES.map((node) => (
            <SecondaryNode key={node.id} meta={node} agent={agentMap.get(node.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineNode({ meta, agent }: { meta: NodeMeta; agent?: BackendAgent }) {
  const status = agent?.status ?? "active";
  const accuracy = agent?.accuracy ?? "—";
  const isActive = status.toLowerCase() !== "idle";

  return (
    <div
      className="flex flex-col items-center rounded-xl border px-4 py-3 min-w-[118px]"
      style={{ borderColor: `${meta.color}30`, background: `${meta.color}08` }}
    >
      <span
        className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em]"
        style={{ color: meta.color }}
      >
        {meta.layer}
      </span>
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{
            background: isActive ? meta.color : "#374151",
            boxShadow: isActive ? `0 0 6px ${meta.color}` : "none",
          }}
        />
        <span className="text-center font-body text-[11px] font-semibold leading-tight text-white">
          {meta.name}
        </span>
      </div>
      <span
        className="rounded-full px-2 py-0.5 font-mono text-[9px]"
        style={{ color: meta.color, background: `${meta.color}18` }}
      >
        {accuracy}
      </span>
    </div>
  );
}

function PipelineConnector({ color, delay }: { color: string; delay: number }) {
  return (
    <div className="relative mx-1 flex h-6 w-14 shrink-0 items-center">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.07]" />
      {/* arrow tip */}
      <div
        className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-b-[4px] border-l-[6px] border-t-[4px]"
        style={{
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: `${color}55`,
        }}
      />
      {[0, 0.44, 0.88].map((offset) => (
        <div
          key={offset}
          className="absolute top-1/2 size-[5px] -translate-y-1/2 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 7px ${color}`,
            animation: `bb-pipeline-flow 1.35s linear infinite`,
            animationDelay: `${delay + offset}s`,
          }}
        />
      ))}
    </div>
  );
}

function SecondaryNode({ meta, agent }: { meta: SecondaryMeta; agent?: BackendAgent }) {
  const status = agent?.status ?? "active";
  const accuracy = agent?.accuracy ?? "—";
  const isActive = status.toLowerCase() !== "idle";

  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2"
      style={{ borderColor: `${meta.color}28`, background: `${meta.color}06` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{
          background: isActive ? meta.color : "#374151",
          boxShadow: isActive ? `0 0 5px ${meta.color}` : "none",
        }}
      />
      <div className="min-w-0">
        <p className="font-body text-[11px] font-semibold text-white">{meta.name}</p>
        <p className="font-mono text-[9px] text-[var(--text-muted)]">{meta.label}</p>
      </div>
      <span
        className="ml-3 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px]"
        style={{ color: meta.color, background: `${meta.color}18` }}
      >
        {accuracy}
      </span>
    </div>
  );
}
