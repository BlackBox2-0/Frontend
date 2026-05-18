"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type AgentTestInput,
  type PolicyDecision,
  type AgentTestResponse,
  type AgentsDashboardResponse,
  getAgentsDashboard,
  runAgentTest,
} from "../../lib/backend";
import { saveSimulation } from "../../lib/simulationStore";

type Scenario = {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  user: string;
  description: string;
  payload: AgentTestInput;
};

const scenarios: Scenario[] = [
  {
    title: "Wire Transfer $50k",
    severity: "HIGH",
    user: "carlos.mendez",
    description: "Unauthorized wire transfer of $50,000 to external account",
    payload: {
      source: "simulation-panel",
      user: "carlos.mendez",
      role: "Finance Analyst",
      department: "Finance",
      action: "UNUSUAL_API_CALL",
      resource: "banking://wire-transfer/external-beneficiary",
      context: "High-value transfer initiated outside approved treasury workflow",
    },
  },
  {
    title: "Mass Data Export",
    severity: "CRITICAL",
    user: "sofia.ramirez",
    description: "Bulk export of 12,000 customer records to USB drive",
    payload: {
      source: "simulation-panel",
      user: "sofia.ramirez",
      role: "Customer Success Manager",
      department: "Operations",
      action: "DATA_EXPORT",
      resource: "customer-records/export-usb.csv",
      context: "Large customer dataset export to removable media",
    },
  },
  {
    title: "Escalate Permissions",
    severity: "HIGH",
    user: "juan.perez",
    description: "Self-granted admin access to production database",
    payload: {
      source: "simulation-panel",
      user: "juan.perez",
      role: "Support Engineer",
      department: "Infrastructure",
      action: "PRIVILEGE_ESCALATION",
      resource: "prod-db/admin-console",
      context: "Permission elevation attempted without approved ticket",
    },
  },
  {
    title: "Analyst Privilege Escalation",
    severity: "CRITICAL",
    user: "marina.ortiz",
    description: "Security analyst attempts to grant herself privileged production access",
    payload: {
      source: "simulation-panel",
      user: "marina.ortiz",
      role: "Analyst",
      department: "Security",
      action: "PRIVILEGE_ESCALATION",
      resource: "prod-admin/iam-root-access",
      context: "High-risk override demo for policy engine. Analyst requesting privileged access in production.",
    },
  },
  {
    title: "After-Hours Access",
    severity: "MEDIUM",
    user: "ana.torres",
    description: "Login to payroll system at 2:47 AM from unknown IP",
    payload: {
      source: "simulation-panel",
      user: "ana.torres",
      role: "Payroll Specialist",
      department: "Finance",
      action: "ACCESS_AFTER_HOURS",
      resource: "payroll://internal-portal",
      context: "After-hours login from an unrecognized network",
    },
  },
  {
    title: "Config Change",
    severity: "MEDIUM",
    user: "luis.garcia",
    description: "Modified firewall rules to allow external SSH access",
    payload: {
      source: "simulation-panel",
      user: "luis.garcia",
      role: "Platform Engineer",
      department: "Platform",
      action: "CONFIG_CHANGE",
      resource: "firewall/core-edge-rules",
      context: "Firewall rule change opened inbound SSH to the public internet",
    },
  },
  {
    title: "Small Transfer $8k",
    severity: "MEDIUM",
    user: "maria.lopez",
    description: "Transfer of $8,000 to vendor account",
    payload: {
      source: "simulation-panel",
      user: "maria.lopez",
      role: "Accounts Payable",
      department: "Finance",
      action: "UNUSUAL_API_CALL",
      resource: "banking://vendor-transfer/payment-008k",
      context: "Vendor payment triggered outside the normal batch schedule",
    },
  },
];

const severityStyles: Record<Scenario["severity"], string> = {
  CRITICAL: "text-[var(--alert-red)] border-[color-mix(in_srgb,var(--alert-red)_28%,transparent)]",
  HIGH: "text-[var(--alert-orange)] border-[color-mix(in_srgb,var(--alert-orange)_28%,transparent)]",
  MEDIUM: "text-[var(--alert-yellow)] border-[color-mix(in_srgb,var(--alert-yellow)_28%,transparent)]",
};

const decisionBadgeStyles: Record<"ALLOW" | "ESCALATE" | "BLOCK", string> = {
  ALLOW:
    "border-[color-mix(in_srgb,var(--ok-green)_28%,transparent)] bg-[color-mix(in_srgb,var(--ok-green)_12%,transparent)] text-[var(--ok-green)]",
  ESCALATE:
    "border-[color-mix(in_srgb,var(--alert-yellow)_28%,transparent)] bg-[color-mix(in_srgb,var(--alert-yellow)_12%,transparent)] text-[var(--alert-yellow)]",
  BLOCK:
    "border-[color-mix(in_srgb,var(--alert-red)_28%,transparent)] bg-[color-mix(in_srgb,var(--alert-red)_12%,transparent)] text-[var(--alert-red)]",
};

const pipelineSteps = [
  { id: "Agent-01", label: "Collector" },
  { id: "Agent-02", label: "Activity" },
  { id: "Agent-05", label: "Productivity" },
  { id: "Agent-03", label: "Risk" },
  { id: "Agent-04", label: "Enforcer" },
  { id: "Agent-07", label: "Audit" },
];
const pipelineDetails: Record<string, string> = {
  "Agent-01": "Normalizes the event and extracts structured security context.",
  "Agent-02": "Records activity, system, user path, and behavioral signals.",
  "Agent-05": "Measures whether the action aligns with expected work patterns.",
  "Agent-03": "Asks Gemini for a risk recommendation and security flags.",
  "Agent-04": "Applies the final decision, including policy overrides and escalation.",
  "Agent-07": "Persists the decision trail, evidence, and audit artifacts.",
};

const FLOW_STEP_DELAY_MS = 650;
const FLOW_FINAL_HOLD_MS = 400;

export default function SimulationPanel() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AgentsDashboardResponse | null>(null);
  const selectedAgentId = "CORE";
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<AgentTestResponse | null>(null);
  const [activeFlowStep, setActiveFlowStep] = useState<string | null>(null);
  const [completedFlowSteps, setCompletedFlowSteps] = useState<string[]>([]);
  const [currentScenarioLabel, setCurrentScenarioLabel] = useState<string | null>(null);
  const flowTimersRef = useRef<number[]>([]);

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
          setError(err instanceof Error ? err.message : "Could not load backend agents.");
        }
      }
    }

    loadAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAgent = useMemo(
    () => dashboard?.agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [dashboard, selectedAgentId],
  );
  const lastPolicyDecision = useMemo(() => extractPolicyDecision(lastTest?.result), [lastTest]);
  const lastExecutiveSummary = useMemo(() => extractExecutiveSummary(lastTest?.result), [lastTest]);
  const orchestrationResult = useMemo(() => extractOrchestrationResult(lastTest?.result), [lastTest]);

  useEffect(() => {
    return () => {
      clearFlowTimers();
    };
  }, []);

  function clearFlowTimers() {
    flowTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    flowTimersRef.current = [];
  }

  function startFlowAnimation(agentId: string) {
    clearFlowTimers();
    const flow = normalizeFlow(agentId);
    setCompletedFlowSteps([]);
    setActiveFlowStep(flow[0] ?? null);

    flow.forEach((stepId, index) => {
      const timer = window.setTimeout(() => {
        setActiveFlowStep(stepId);
        setCompletedFlowSteps(flow.slice(0, index));
      }, index * FLOW_STEP_DELAY_MS);
      flowTimersRef.current.push(timer);
    });

    return Math.max(1000, flow.length * FLOW_STEP_DELAY_MS + FLOW_FINAL_HOLD_MS);
  }

  function finalizeFlow(agentId: string) {
    clearFlowTimers();
    const flow = normalizeFlow(agentId);
    setCompletedFlowSteps(flow);
    setActiveFlowStep(flow.length > 0 ? flow[flow.length - 1] : null);
  }

  async function handleScenarioRun(scenario: Scenario) {
    setRunningScenario(scenario.title);
    setError(null);
    setCurrentScenarioLabel(scenario.title);
    const animationDuration = startFlowAnimation(selectedAgentId);

    try {
      const [response] = await Promise.all([
        runAgentTest(selectedAgentId, scenario.payload),
        wait(animationDuration),
      ]);
      setLastTest(response);
      setDashboard(response.dashboard);
      finalizeFlow(selectedAgentId);

      const orc = extractOrchestrationResult(response.result);
      const pd = extractPolicyDecision(response.result);
      if (orc && pd) {
        const ev = orc.collected_event.normalized_event;
        saveSimulation({
          user: ev.user,
          role: ev.role,
          department: ev.department,
          action: ev.action,
          resource: ev.resource,
          context: ev.context,
          activitySystem: orc.activity.system,
          activityAction: orc.activity.action,
          productivityDecision: orc.productivity.decision,
          productivityScore: orc.productivity.score,
          riskScore: orc.risk_assessment.risk_score,
          flags: orc.risk_assessment.flags,
          reasoning: orc.enforcement.reasoning,
          executiveSummary: extractExecutiveSummary(response.result),
          requiresHumanApproval: orc.enforcement.requires_human_approval,
          aiRecommendation: pd.model_recommendation,
          finalDecision: pd.final_decision,
          decisionSource: pd.final_decision_source,
          policyRuleMatched: pd.policy_rule_matched ?? null,
          policyVersion: pd.policy_version ?? null,
          matchKey: `${ev.user}:${ev.action}`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation run failed.");
      clearFlowTimers();
      setActiveFlowStep(null);
    } finally {
      setRunningScenario(null);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="bb-card mt-5 overflow-hidden px-0 py-0"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--bb-divider)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-body text-xl text-[var(--glow-blue)]">⚡</span>
          <h2 className="font-body text-[15px] font-semibold text-[var(--text-primary)]">Simulation Panel</h2>
          <span className="rounded-full bg-[rgba(79,70,229,0.14)] px-2 py-0.5 font-mono text-[10px] text-[var(--glow-blue-light)]">
            DEMO
          </span>
        </div>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">
          Events with risk ≥ 80 are auto-blocked · Full pipeline · Select a scenario to simulate
        </p>
      </div>

      {/* ── Agent Pipeline Flow (full width) ── */}
      <div className="border-b border-[var(--bb-divider)] px-6 py-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="font-body text-sm font-semibold text-white">Agent Pipeline Flow</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {currentScenarioLabel ?? "Awaiting simulation"}
          </span>
        </div>

        <div className="flex items-stretch gap-1">
          {pipelineSteps.map((step, index) => {
            const isActive = activeFlowStep === step.id;
            const isCompleted = completedFlowSteps.includes(step.id);
            const isInFlow = normalizeFlow(selectedAgentId).includes(step.id);
            return (
              <div key={step.id} className="flex flex-1 items-stretch min-w-0">
                <motion.div
                  initial={false}
                  animate={isActive ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="relative flex flex-1 min-w-0 flex-col overflow-hidden rounded-xl border px-3 py-3 transition"
                  style={{
                    borderColor: isActive
                      ? "var(--glow-cyan)"
                      : isCompleted
                        ? "var(--ok-green)"
                        : isInFlow
                          ? "rgba(123,47,255,0.34)"
                          : "rgba(255,255,255,0.08)",
                    background: isActive
                      ? "rgba(56,189,248,0.10)"
                      : isCompleted
                        ? "rgba(34,197,94,0.10)"
                        : isInFlow
                          ? "rgba(123,47,255,0.06)"
                          : "rgba(255,255,255,0.02)",
                    boxShadow: isActive
                      ? "0 0 20px rgba(56,189,248,0.20)"
                      : isCompleted
                        ? "0 0 16px rgba(34,197,94,0.14)"
                        : "none",
                    opacity: !isInFlow && !isActive && !isCompleted ? 0.6 : 1,
                  }}
                >
                  {/* Top progress bar */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : isActive ? "70%" : "0%",
                      opacity: isCompleted || isActive ? 1 : 0,
                    }}
                    transition={{
                      width: { duration: isCompleted ? 0.28 : FLOW_STEP_DELAY_MS / 1000, ease: "easeOut" },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute left-0 top-0 h-[3px] rounded-r-full"
                    style={{ background: isCompleted ? "var(--ok-green)" : "var(--glow-cyan)" }}
                  />

                  {isActive ? (
                    <motion.div
                      animate={{ opacity: [0.12, 0.28, 0.12] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_60%)]"
                    />
                  ) : null}

                  {/* Status chip */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                      style={{
                        background: isActive
                          ? "rgba(56,189,248,0.16)"
                          : isCompleted
                            ? "rgba(34,197,94,0.16)"
                            : "rgba(255,255,255,0.04)",
                        color: isActive
                          ? "var(--glow-cyan)"
                          : isCompleted
                            ? "var(--ok-green)"
                            : "var(--text-muted)",
                      }}
                    >
                      {isActive ? "Running" : isCompleted ? "Done" : "Queued"}
                    </span>
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">{step.id}</span>
                  </div>

                  <span className="font-body text-[13px] font-semibold text-white truncate">{step.label}</span>
                  <p className="mt-2 font-mono text-[10px] leading-[1.55] text-[var(--text-muted)]">
                    {pipelineDetails[step.id]}
                  </p>
                </motion.div>

                {index < pipelineSteps.length - 1 ? (
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive || isCompleted ? 1 : 0.25,
                      x: isActive ? [0, 5, 0] : 0,
                    }}
                    transition={{
                      opacity: { duration: 0.22 },
                      x: isActive ? { duration: 0.75, repeat: Infinity, ease: "easeInOut" } : { duration: 0.22 },
                    }}
                    className="flex w-6 shrink-0 items-center justify-center font-mono text-base"
                    style={{
                      color: isCompleted ? "var(--ok-green)" : isActive ? "var(--glow-cyan)" : "var(--text-muted)",
                    }}
                  >
                    →
                  </motion.div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2">
          {activeFlowStep ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="size-1.5 shrink-0 rounded-full bg-[var(--glow-cyan)] shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            />
          ) : (
            <span className="size-1.5 shrink-0 rounded-full bg-white/20" />
          )}
          <span className="font-mono text-[10px] text-[var(--text-secondary)]">
            {activeFlowStep
              ? `Processing: ${pipelineSteps.find((s) => s.id === activeFlowStep)?.label ?? activeFlowStep}`
              : "Awaiting the next simulation run."}
          </span>
          {lastPolicyDecision ? (
            <span
              className={[
                "ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                decisionBadgeStyles[lastPolicyDecision.final_decision],
              ].join(" ")}
            >
              {lastPolicyDecision.final_decision}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Scenario cards ── */}
      <div className="grid grid-cols-1 gap-3 px-6 py-4 xl:grid-cols-3 2xl:grid-cols-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.title}
            type="button"
            onClick={() => handleScenarioRun(scenario)}
            disabled={runningScenario !== null || !dashboard}
            className={[
              "group rounded-2xl border bg-[rgba(255,255,255,0.02)] px-5 py-4 text-left transition",
              "hover:bg-[rgba(255,255,255,0.035)] disabled:cursor-not-allowed disabled:opacity-60",
              runningScenario === scenario.title
                ? "border-[var(--glow-violet)] shadow-[0_0_18px_rgba(123,47,255,0.2)]"
                : "border-[rgba(249,115,22,0.18)] hover:border-[rgba(249,115,22,0.36)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-body text-[13px] font-semibold text-white">{scenario.title}</p>
              <span
                className={[
                  "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]",
                  severityStyles[scenario.severity],
                ].join(" ")}
              >
                {scenario.severity}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{scenario.user}</p>
            <p className="mt-2 font-body text-[12px] leading-5 text-[var(--text-muted)]">{scenario.description}</p>
            <p className="mt-4 font-mono text-[10px] text-[var(--glow-violet)] group-hover:text-white transition">
              {runningScenario === scenario.title ? "⟳ Running simulation…" : "▶ Run simulation"}
            </p>
          </button>
        ))}
      </div>

      {lastTest ? (
        <div className="border-t border-[var(--bb-divider)] px-6 py-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
          >
            <div className="flex items-center gap-3">
              {lastPolicyDecision ? (
                <span className={["rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em]", decisionBadgeStyles[lastPolicyDecision.final_decision]].join(" ")}>
                  {lastPolicyDecision.final_decision}
                </span>
              ) : null}
              <div>
                <p className="font-body text-[13px] font-semibold text-white">{lastTest.message}</p>
                <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                  {new Date(lastTest.tested_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/threat-monitor")}
              className="flex items-center gap-2 rounded-lg border border-[var(--glow-violet)] bg-[rgba(123,47,255,0.10)] px-4 py-2 font-body text-[12px] font-semibold text-[var(--glow-violet-light)] transition hover:bg-[rgba(123,47,255,0.18)] hover:shadow-[0_0_16px_rgba(123,47,255,0.28)]"
            >
              View in Threat Monitor →
            </button>
          </motion.div>
        </div>
      ) : null}

      {error ? (
        <div className="border-t border-[var(--bb-divider)] px-6 py-4">
          <div className="rounded-xl border border-[var(--alert-red)]/30 bg-[rgba(239,68,68,0.08)] px-4 py-3 font-mono text-[11px] text-[var(--alert-red)]">
            {error}
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

function flowForAgent(agentId: string) {
  if (agentId === "CORE" || agentId === "Agent-06") {
    return pipelineSteps.map((step) => step.id);
  }
  const idx = pipelineSteps.findIndex((step) => step.id === agentId);
  if (idx === -1) return [agentId];
  return pipelineSteps.slice(0, idx + 1).map((step) => step.id);
}

function isPipelineStep(agentId: string) {
  return pipelineSteps.some((step) => step.id === agentId);
}

function normalizeFlow(agentId: string) {
  if (agentId === "CORE" || agentId === "Agent-06") {
    return pipelineSteps.map((step) => step.id);
  }
  if (isPipelineStep(agentId)) {
    return flowForAgent(agentId);
  }
  return [];
}

function wait(duration: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
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

function extractExecutiveSummary(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;

  const candidate = result as {
    executive_summary?: string | null;
    enforcement?: { executive_summary?: string | null };
    risk_assessment?: { executive_summary?: string | null };
  };

  return (
    candidate.executive_summary ??
    candidate.enforcement?.executive_summary ??
    candidate.risk_assessment?.executive_summary ??
    null
  );
}

type OrchestrationResult = {
  collected_event: {
    normalized_event: {
      user: string;
      role: string;
      department: string;
      action: string;
      resource: string;
      context: string;
    };
  };
  activity: {
    action: string;
    system: string;
    resource: string;
  };
  productivity: {
    decision: string;
    score: number;
    signals: string[];
    reasoning: string;
  };
  risk_assessment: {
    risk_score: number;
    decision: string;
    reasoning: string;
    flags: string[];
    model_recommendation: string;
  };
  enforcement: {
    final_decision: string;
    analyst_decision: string;
    requires_human_approval: boolean;
    reasoning: string;
  };
};

function extractOrchestrationResult(result: unknown): OrchestrationResult | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;
  if (!r.collected_event || !r.risk_assessment || !r.enforcement || !r.activity || !r.productivity) return null;
  return r as unknown as OrchestrationResult;
}
