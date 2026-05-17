"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ActiveAlerts from "./ActiveAlerts";
import AttackVectorChart from "./AttackVectorChart";
import ThreatFeed from "./ThreatFeed";
import ThreatStatsRow from "./ThreatStatsRow";
import ThreatTimeline from "./ThreatTimeline";
import AgentTestForm from "../../../src/components/agents/AgentTestForm";
import {
  type AgentTestInput,
  type AgentTestResponse,
  type AgentsDashboardResponse,
  getAgentsDashboard,
  runAgentTest,
} from "../../lib/backend";

export default function ThreatMonitor() {
  const [dashboard, setDashboard] = useState<AgentsDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<AgentTestResponse | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAgents() {
      try {
        const data = await getAgentsDashboard();
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load agents from backend.");
        }
      }
    }

    loadAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAgentTest(agentId: string, payload: AgentTestInput) {
    setRunningAgentId(agentId);
    setError(null);

    try {
      const response = await runAgentTest(agentId, payload);
      setLastTest(response);
      setDashboard(response.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent test failed.");
    } finally {
      setRunningAgentId(null);
    }
  }

  return (
    <div className="text-[var(--text-primary)]">
      <ThreatMonitorHeader
        agents={dashboard?.agents ?? []}
        consoleOpen={consoleOpen}
        error={error}
        lastTest={lastTest}
        runningAgentId={runningAgentId}
        onAgentTest={handleAgentTest}
        onToggleConsole={() => setConsoleOpen((value) => !value)}
      />
      <ThreatStatsRow />
      {consoleOpen ? (
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mt-5"
        >
          <AgentTestForm
            agents={dashboard?.agents ?? []}
            runningAgentId={runningAgentId}
            error={error}
            lastMessage={lastTest ? { role: lastTest.agent_role, message: lastTest.message } : null}
            onSubmit={handleAgentTest}
          />
        </motion.section>
      ) : null}
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[60fr_40fr]">
        <ThreatFeed />
        <div className="grid gap-5">
          <AttackVectorChart />
          <ActiveAlerts />
        </div>
      </section>
      <ThreatTimeline />
    </div>
  );
}

function ThreatMonitorHeader({
  agents,
  consoleOpen,
  error,
  lastTest,
  runningAgentId,
  onAgentTest,
  onToggleConsole,
}: {
  agents: AgentsDashboardResponse["agents"];
  consoleOpen: boolean;
  error: string | null;
  lastTest: AgentTestResponse | null;
  runningAgentId: string | null;
  onAgentTest: (agentId: string, payload: AgentTestInput) => void;
  onToggleConsole: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--alert-red)]">
          Threat Intelligence
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Threat Monitor
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Active surveillance · 847 events today
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--alert-red)]">
          <span className="size-2 rounded-full bg-[var(--alert-red)] shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" />
          3 Critical Alerts
        </div>
        <button
          type="button"
          className="rounded-md border border-[var(--glow-blue)] bg-transparent px-4 py-2 font-body text-xs font-semibold text-[var(--glow-blue-light)] shadow-[0_0_12px_color-mix(in_srgb,var(--glow-blue)_24%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--glow-blue)_10%,transparent)] hover:shadow-[0_0_18px_color-mix(in_srgb,var(--glow-blue)_34%,transparent)]"
        >
          Export Logs
        </button>
        <button
          type="button"
          className="rounded-md bg-[var(--alert-red)] px-4 py-2 font-body text-xs font-bold text-white shadow-[0_0_16px_rgba(239,68,68,0.18)] transition hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          New Alert Rule
        </button>
        <button
          type="button"
          onClick={onToggleConsole}
          className="rounded-md border border-[var(--glow-purple)] bg-[rgba(123,47,255,0.08)] px-4 py-2 font-body text-xs font-semibold text-[var(--glow-violet-light)] transition hover:bg-[rgba(123,47,255,0.14)] hover:shadow-[0_0_14px_rgba(123,47,255,0.22)]"
        >
          {consoleOpen ? "Hide Agent Console" : "Open Agent Console"}
        </button>
      </div>
      {(lastTest || error) && !consoleOpen ? (
        <div className="w-full rounded-2xl border border-[rgba(123,47,255,0.18)] bg-[rgba(15,11,31,0.7)] px-4 py-3">
          {lastTest ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-body text-sm font-semibold text-white">{lastTest.agent_role}</p>
                <p className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">{lastTest.message}</p>
              </div>
              <button
                type="button"
                onClick={onToggleConsole}
                className="rounded-full border border-[rgba(123,47,255,0.3)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:border-[var(--glow-purple)] hover:text-white"
              >
                Edit Input
              </button>
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-[var(--alert-red)]/30 bg-[rgba(239,68,68,0.08)] px-3 py-2 font-mono text-[11px] text-[var(--alert-red)]">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.header>
  );
}
