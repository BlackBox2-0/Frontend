"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentTestInput, BackendAgent } from "../../../app/lib/backend";

const actionOptions = [
  "DATA_EXPORT",
  "PERMISSION_CHANGE",
  "CONFIG_CHANGE",
  "ACCESS_AFTER_HOURS",
  "MASS_DELETE",
  "PRIVILEGE_ESCALATION",
  "UNUSUAL_API_CALL",
];

const initialForm: AgentTestInput = {
  source: "dashboard",
  user: "",
  role: "",
  department: "",
  action: "DATA_EXPORT",
  resource: "",
  context: "",
};

const flowSteps = [
  { id: "Agent-01", label: "Collector", detail: "Normaliza el evento entrante" },
  { id: "Agent-02", label: "Activity", detail: "Registra actividad y sistema" },
  { id: "Agent-05", label: "Productivity", detail: "Evalua señal de trabajo" },
  { id: "Agent-03", label: "Risk", detail: "Calcula score y decisión" },
  { id: "Agent-04", label: "Enforcer", detail: "Convierte a BLOCK o ESCALATE" },
  { id: "Agent-07", label: "Audit", detail: "Persiste trazabilidad y evidencia" },
];

export default function AgentTestForm({
  agents,
  runningAgentId,
  error,
  lastMessage,
  onSubmit,
}: {
  agents: BackendAgent[];
  runningAgentId: string | null;
  error: string | null;
  lastMessage?: { role: string; message: string } | null;
  onSubmit: (agentId: string, payload: AgentTestInput) => void;
}) {
  const [form, setForm] = useState<AgentTestInput>(initialForm);
  const [selectedAgent, setSelectedAgent] = useState<string | null>("CORE");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function updateField<K extends keyof AgentTestInput>(key: K, value: AgentTestInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function currentForm(): AgentTestInput {
    const element = formRef.current;
    if (!element) {
      return form;
    }

    const formData = new FormData(element);
    return {
      source: "dashboard",
      user: String(formData.get("user") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim(),
      department: String(formData.get("department") ?? "").trim(),
      action: String(formData.get("action") ?? "").trim(),
      resource: String(formData.get("resource") ?? "").trim(),
      context: String(formData.get("context") ?? "").trim(),
    };
  }

  function handleRun(agentId: string) {
    const payload = currentForm();

    if (!payload.user?.trim()) {
      setValidationError("Ingresa el usuario antes de ejecutar un agente.");
      return;
    }
    if (!payload.action?.trim()) {
      setValidationError("Selecciona una acción del usuario.");
      return;
    }
    if (!payload.resource?.trim()) {
      setValidationError("Ingresa el recurso o sistema afectado.");
      return;
    }

    setSelectedAgent(agentId);
    setValidationError(null);
    animateFlow(agentId);
    setForm(payload);
    onSubmit(agentId, payload);
  }

  function animateFlow(agentId: string) {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    const flow = flowForAgent(agentId);
    if (flow.length === 0) {
      setActiveStep(null);
      setCompletedSteps([]);
      return;
    }

    setCompletedSteps([]);
    setActiveStep(flow[0]);

    flow.forEach((stepId, index) => {
      const timer = window.setTimeout(() => {
        setCompletedSteps(flow.slice(0, index));
        setActiveStep(stepId);
      }, index * 350);
      timersRef.current.push(timer);
    });

    const finalizeTimer = window.setTimeout(() => {
      setCompletedSteps(flow);
      setActiveStep(flow[flow.length - 1] ?? null);
    }, flow.length * 350);
    timersRef.current.push(finalizeTimer);
  }

  return (
    <div className="w-full rounded-2xl border border-[rgba(123,47,255,0.18)] bg-[rgba(15,11,31,0.7)] p-4">
      <form ref={formRef} className="grid gap-5">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-body text-sm font-semibold text-white">Execution Flow</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                Selecciona un agente, revisa el tramo que ejecuta y luego dispara la prueba con el botón principal.
              </p>
            </div>
            <span className="rounded-full border border-[rgba(123,47,255,0.24)] bg-[rgba(123,47,255,0.08)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {selectedAgent === "CORE" || selectedAgent === "Agent-06" ? "Full Pipeline" : "Single Agent"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-6">
            {flowSteps.map((step) => {
              const isSelectedPath = isStepInPath(selectedAgent, step.id);
              const isActive = activeStep === step.id;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={[
                    "rounded-xl border px-3 py-3 transition",
                    isActive
                      ? "border-[rgba(56,189,248,0.45)] bg-[rgba(56,189,248,0.12)] shadow-[0_0_18px_rgba(56,189,248,0.14)]"
                      : isCompleted
                        ? "border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.12)]"
                        : isSelectedPath
                          ? "border-[rgba(123,47,255,0.38)] bg-[rgba(123,47,255,0.12)]"
                          : "border-white/[0.06] bg-white/[0.02]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body text-[13px] font-semibold text-white">{step.label}</p>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      {step.id}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] leading-4 text-[var(--text-muted)]">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-body text-sm font-semibold text-white">Backend Agent Test Console</p>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
            Primero define la acción del usuario y luego ejecuta el agente que quieras probar.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">User</span>
              <input
                name="user"
                value={form.user ?? ""}
                onChange={(event) => updateField("user", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
                placeholder="u-100"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Role</span>
              <input
                name="role"
                value={form.role ?? ""}
                onChange={(event) => updateField("role", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
                placeholder="Analyst"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Department</span>
              <input
                name="department"
                value={form.department ?? ""}
                onChange={(event) => updateField("department", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
                placeholder="Finance"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Action</span>
              <select
                name="action"
                value={form.action ?? ""}
                onChange={(event) => updateField("action", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-[var(--bg-card)] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
              >
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Resource</span>
              <input
                name="resource"
                value={form.resource ?? ""}
                onChange={(event) => updateField("resource", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
                placeholder="finance/report.csv"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Context</span>
              <textarea
                name="context"
                value={form.context ?? ""}
                onChange={(event) => updateField("context", event.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 py-2 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
                placeholder="Describe la acción, hora, motivo o comportamiento observado"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Target Agent</span>
            <select
              value={selectedAgent ?? ""}
              onChange={(event) => setSelectedAgent(event.target.value || null)}
              className="mt-1 h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-[var(--bg-card)] px-3 font-mono text-xs text-white outline-none focus:border-[var(--glow-purple)]"
            >
              <option value="">Selecciona un agente</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.id} · {agent.role}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.id)}
                disabled={runningAgentId !== null}
                className={[
                  "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60",
                  selectedAgent === agent.id
                    ? "border-[var(--glow-purple)] bg-[rgba(123,47,255,0.16)] text-white"
                    : "border-[rgba(123,47,255,0.3)] text-[var(--text-secondary)] hover:border-[var(--glow-purple)] hover:text-white",
                ].join(" ")}
              >
                {agent.id}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!selectedAgent) {
                  setValidationError("Selecciona el agente que quieres ejecutar.");
                  return;
                }
                handleRun(selectedAgent);
              }}
              disabled={!selectedAgent || runningAgentId !== null}
              className="rounded-md border border-[var(--glow-purple)] bg-[rgba(123,47,255,0.12)] px-4 py-2 font-body text-xs font-semibold text-[var(--glow-violet-light)] transition hover:bg-[rgba(123,47,255,0.18)] disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:text-[var(--text-muted)]"
            >
              {runningAgentId ? "Ejecutando..." : "Ejecutar agente seleccionado"}
            </button>
          </div>

          {selectedAgent ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Selected agent: {selectedAgent}
            </p>
          ) : null}

          {lastMessage ? (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
              <p className="font-body text-sm font-semibold text-white">{lastMessage.role}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">{lastMessage.message}</p>
            </div>
          ) : null}

          {validationError ? (
            <div className="mt-3 rounded-xl border border-[var(--alert-orange)]/30 bg-[rgba(249,115,22,0.08)] px-3 py-2 font-mono text-[11px] text-[var(--alert-orange)]">
              {validationError}
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-xl border border-[var(--alert-red)]/30 bg-[rgba(239,68,68,0.08)] px-3 py-2 font-mono text-[11px] text-[var(--alert-red)]">
              {error}
            </div>
          ) : null}
        </div>
        </div>
      </form>
    </div>
  );
}

function flowForAgent(selectedAgent: string | null) {
  if (!selectedAgent) return [];
  if (selectedAgent === "CORE" || selectedAgent === "Agent-06") {
    return flowSteps.map((step) => step.id);
  }
  return [selectedAgent];
}

function isStepInPath(selectedAgent: string | null, stepId: string) {
  return flowForAgent(selectedAgent).includes(stepId);
}
