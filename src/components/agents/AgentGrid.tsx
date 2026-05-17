"use client";

import type { AgentTestInput, BackendAgent } from "../../../app/lib/backend";

export default function AgentGrid({
  agents,
  loading = false,
  runningAgentId,
  onTest,
}: {
  agents: BackendAgent[];
  loading?: boolean;
  runningAgentId?: string | null;
  onTest: (agentId: string, payload: AgentTestInput) => void;
}) {
  const placeholderAgents = Array.from({ length: 8 }, (_, index) => ({
    id: `placeholder-${index + 1}`,
    role: "Loading backend agent",
    module: "backend",
    endpoint: "/agents",
    status: "SYNCING",
    task: "Loading agent state from backend",
    color: "var(--bb-idle)",
    accuracy: "--",
    accuracy_value: 0,
    test_label: "Loading",
  }));

  const items = agents.length > 0 ? agents : placeholderAgents;

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {items.map((agent) => (
        <article key={agent.id} className="bb-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold text-white">{agent.id}</h3>
              <p className="mt-1 truncate font-body text-sm text-[var(--text-muted)]">{agent.role}</p>
            </div>
            <span className="size-3 rounded-full shadow-[0_0_12px_currentColor]" style={{ background: agent.color, color: agent.color }} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span
              className="rounded px-2 py-1 font-mono text-[9px] font-bold"
              style={{
                color: agent.color,
                background: `color-mix(in srgb, ${agent.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${agent.color} 24%, transparent)`,
              }}
            >
              {agent.status}
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">{agent.accuracy}</span>
          </div>
          <p className="mt-4 min-h-10 font-mono text-[12px] leading-5 text-[var(--text-secondary)]">{agent.task}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {agent.module}
              </p>
              <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{agent.endpoint}</p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-[var(--glow-purple)] px-3 py-1.5 font-body text-[11px] font-semibold text-[var(--glow-violet)] transition hover:bg-[rgba(123,47,255,0.1)] hover:shadow-[0_0_14px_rgba(123,47,255,0.24)] disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:text-[var(--text-muted)] disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              Usa el formulario
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
