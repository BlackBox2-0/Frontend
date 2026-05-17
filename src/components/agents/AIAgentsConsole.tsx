"use client";

import { Bot, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import AgentTestForm from "./AgentTestForm";
import AgentGrid from "./AgentGrid";
import AgentStatsRow from "./AgentStatsRow";
import NeuralMesh from "./NeuralMesh";
import {
  type AgentTestInput,
  type PolicyDecision,
  type AgentTestResponse,
  type AgentsDashboardResponse,
  getAgentsDashboard,
  runAgentTest,
} from "../../../app/lib/backend";

export default function AIAgentsConsole() {
  const [dashboard, setDashboard] = useState<AgentsDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<AgentTestResponse | null>(null);
  const lastPolicyDecision = extractPolicyDecision(lastTest?.result);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await getAgentsDashboard();
        if (!cancelled) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load backend agents.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleTest(agentId: string, payload: AgentTestInput) {
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
      <AIAgentsHeader summary={dashboard?.summary} />
      <AgentStatsRow summary={dashboard?.summary} loading={loading} />
      {error ? (
        <div className="mt-4 rounded-xl border border-[var(--alert-red)]/30 bg-[rgba(239,68,68,0.08)] px-4 py-3 font-mono text-xs text-[var(--alert-red)]">
          {error}
        </div>
      ) : null}
      <section className="mt-4 grid gap-3 xl:grid-cols-3">
        <LayerCard
          icon={<Bot className="size-4" />}
          label="Gemini Risk Analyst"
          title="Model Recommendation"
          detail={
            lastPolicyDecision
              ? `Suggested ${lastPolicyDecision.model_recommendation} for the latest event.`
              : "Produces a probabilistic recommendation from the incoming event."
          }
          badge={lastPolicyDecision?.model_recommendation ?? "MODEL"}
        />
        <LayerCard
          icon={<Shield className="size-4" />}
          label={`Policy Engine ${lastPolicyDecision?.policy_version ?? "v1.0"}`}
          title="Deterministic Rules"
          detail={
            lastPolicyDecision?.final_decision_source === "policy"
              ? `Override applied via ${lastPolicyDecision.policy_rule_matched ?? "active rule set"}.`
              : "Applies explicit corporate rules before the decision is enforced."
          }
          badge={lastPolicyDecision?.final_decision_source === "policy" ? "OVERRIDE" : "NO OVERRIDE"}
          accent={lastPolicyDecision?.final_decision_source === "policy" ? "orange" : "violet"}
        />
        <LayerCard
          icon={<ShieldCheck className="size-4" />}
          label="Enforcer"
          title="Final Decision"
          detail={
            lastPolicyDecision
              ? `Executes ${lastPolicyDecision.final_decision} from ${lastPolicyDecision.final_decision_source}.`
              : "Executes the final decision after model + policy evaluation."
          }
          badge={lastPolicyDecision?.final_decision ?? "FINAL"}
        />
      </section>
      <div className="mt-4">
        <AgentTestForm
          agents={dashboard?.agents ?? []}
          runningAgentId={runningAgentId}
          error={error}
          lastMessage={lastTest ? { role: lastTest.agent_role, message: lastTest.message } : null}
          onSubmit={handleTest}
        />
      </div>
      <section className="mt-6 w-full" aria-label="AI agents neural force graph">
        <NeuralMesh agents={dashboard?.agents ?? []} />
      </section>
      <AgentGrid
        agents={dashboard?.agents ?? []}
        loading={loading}
        runningAgentId={runningAgentId}
        onTest={handleTest}
      />
    </div>
  );
}

function AIAgentsHeader({
  summary,
}: {
  summary?: AgentsDashboardResponse["summary"];
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--glow-purple)]">AI Agents</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-white">Autonomous Defense Network</h1>
        <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[var(--text-muted)]">
          Live coordination layer connected to the backend agents already exposed by Collector, Activity Monitor,
          Risk Analyst, Enforcer, Productivity Detector, Orchestrator, Audit, and Core.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 font-mono text-[11px] text-emerald-300">
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        {summary ? `${summary.active_agents}/${summary.total_agents} AGENTS LIVE` : "MESH ONLINE"}
      </div>
    </header>
  );
}

function LayerCard({
  icon,
  label,
  title,
  detail,
  badge,
  accent = "cyan",
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  detail: string;
  badge: string;
  accent?: "cyan" | "orange" | "violet";
}) {
  const accentClass =
    accent === "orange"
      ? "text-[var(--alert-orange)] border-[rgba(249,115,22,0.24)] bg-[rgba(249,115,22,0.08)]"
      : accent === "violet"
        ? "text-[var(--glow-violet-light)] border-[rgba(123,47,255,0.24)] bg-[rgba(123,47,255,0.08)]"
        : "text-[var(--glow-cyan)] border-[rgba(56,189,248,0.24)] bg-[rgba(56,189,248,0.08)]";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className={["inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]", accentClass].join(" ")}>
          {icon}
          {label}
        </span>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
          {badge}
        </span>
      </div>
      <p className="mt-3 font-body text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 font-mono text-[11px] leading-5 text-[var(--text-muted)]">{detail}</p>
    </div>
  );
}

function extractPolicyDecision(result: unknown): PolicyDecision | null {
  if (!result || typeof result !== "object") return null;

  const candidate = result as {
    policy_decision?: PolicyDecision | null;
    enforcement?: { policy_decision?: PolicyDecision | null };
    risk_assessment?: { policy_decision?: PolicyDecision | null };
  };

  return (
    candidate.policy_decision ??
    candidate.enforcement?.policy_decision ??
    candidate.risk_assessment?.policy_decision ??
    null
  );
}
