import SimulationPanel from "../components/dashboard/SimulationPanel";

export default function Page() {
  return (
    <div className="text-[var(--text-primary)]">
      <div className="mb-6">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-violet)]">
          BlackBooks AI Core
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Simulation Panel
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Run threat scenarios through the full AI pipeline and review decisions in real time
        </p>
      </div>
      <SimulationPanel />
    </div>
  );
}
