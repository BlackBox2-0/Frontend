import AgentGrid from "../../src/components/agents/AgentGrid";
import AgentStatsRow from "../../src/components/agents/AgentStatsRow";
import NeuralMesh from "../../src/components/agents/NeuralMesh";

export default function AIAgentsPage() {
  return (
    <div className="text-[var(--text-primary)]">
      <AIAgentsHeader />
      <AgentStatsRow />
      <section
        className="mt-6 w-full"
        aria-label="AI agents neural force graph"
      >
        <NeuralMesh />
      </section>
      <AgentGrid />
    </div>
  );
}

function AIAgentsHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--glow-purple)]">AI Agents</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-white">Autonomous Defense Network</h1>
        <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[var(--text-muted)]">
          Live coordination layer for BlackBooks threat detection, behavioral analysis, and incident response agents.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 font-mono text-[11px] text-emerald-300">
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        MESH ONLINE
      </div>
    </header>
  );
}
