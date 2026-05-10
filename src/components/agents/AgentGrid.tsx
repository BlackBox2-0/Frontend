"use client";

const agents = [
  { id: "Agent-01", role: "Threat Hunter", status: "INVESTIGATING", task: "Case #BB-2891", accuracy: "96.2%", color: "var(--alert-red)" },
  { id: "Agent-02", role: "Network Watcher", status: "MONITORING", task: "Watching anomalous flows", accuracy: "98.4%", color: "var(--glow-blue)" },
  { id: "Agent-03", role: "Behavioral Analyst", status: "SCANNING", task: "Scanning behavioral drift", accuracy: "94.7%", color: "var(--glow-violet)" },
  { id: "Agent-04", role: "Data Guardian", status: "MONITORING", task: "Data access audit", accuracy: "97.9%", color: "var(--glow-cyan)" },
  { id: "Agent-05", role: "Log Analyzer", status: "IDLE", task: "Standby queue clean", accuracy: "91.5%", color: "var(--bb-idle)" },
  { id: "Agent-06", role: "Fraud Detector", status: "INVESTIGATING", task: "IP: 185.220.101.47", accuracy: "95.8%", color: "var(--alert-orange)" },
  { id: "Agent-07", role: "Insider Threat", status: "SCANNING", task: "Privilege drift sweep", accuracy: "93.6%", color: "var(--glow-purple)" },
  { id: "CORE", role: "BlackBooks AI Core", status: "CORE", task: "Coordinating active defense mesh", accuracy: "99.1%", color: "var(--glow-purple)" },
];

export default function AgentGrid() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {agents.map((agent) => (
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
        </article>
      ))}
    </section>
  );
}
