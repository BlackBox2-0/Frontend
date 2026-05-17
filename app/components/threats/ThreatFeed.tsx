"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  approveIncident,
  type AuditLogEntry,
  type IncidentActionResult,
  type IncidentActionInput,
  escalateIncident,
  getAuditLog,
  getIncidentActions,
  investigateIncident,
  rejectIncident,
} from "../../lib/backend";
import ThreatFeedItem, { type ThreatFeedItemData } from "./ThreatFeedItem";

const criticalBg = "rgba(239,68,68,0.15)";
const highBg = "rgba(249,115,22,0.15)";
const mediumBg = "rgba(245,158,11,0.15)";
const lowBg = "rgba(123,47,255,0.15)";
const infoBg = "rgba(148,163,184,0.15)";
const resolvedBg = "rgba(34,197,94,0.15)";

const selects = ["All Severity", "All Types", "Last 24h"];

export default function ThreatFeed() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentActions, setIncidentActions] = useState<IncidentActionResult[]>([]);
  const [actionResults, setActionResults] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, actionsResult] = await Promise.allSettled([getAuditLog(), getIncidentActions()]);
      if (cancelled) return;

      if (auditResult.status === "fulfilled") {
        setAuditEntries(auditResult.value);
      }

      if (actionsResult.status === "fulfilled") {
        setIncidentActions(actionsResult.value);
      }
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const backendThreats = useMemo(() => auditEntries.slice(0, 12).map(mapAuditEntryToThreatFeedItem), [auditEntries]);
  const resolvedKeys = useMemo(() => {
    return new Set(
      incidentActions
        .filter((action) => action.status === "APPROVED" || action.status === "BLOCKED")
        .map((action) => incidentKey(action.incident_title, action.affected_user)),
    );
  }, [incidentActions]);
  const threats = backendThreats
    .map((item, index) => ({
      ...item,
      id: item.id ?? `${item.type}-${index}`,
      actionResult: actionResults[item.id ?? `${item.type}-${index}`],
    }))
    .filter((item) => item.title.trim().length > 0)
    .filter((item) => !resolvedKeys.has(incidentKey(item.title, item.affectedUser)));

  async function handleThreatAction(item: ThreatFeedItemData, action: string) {
    if (!item.affectedUser || !item.department || !item.resource) {
      return;
    }

    const payload: IncidentActionInput = {
      incident_title: item.title,
      incident_type: item.type,
      affected_user: item.affectedUser,
      department: item.department,
      resource: item.resource,
      severity: item.severity,
      requested_by: "Alejandro Reyes",
    };
    const existingCase = incidentActions.find(
      (entry) =>
        entry.status !== "APPROVED" &&
        entry.status !== "BLOCKED" &&
        incidentKey(entry.incident_title, entry.affected_user) === incidentKey(item.title, item.affectedUser),
    );

    if (action.toUpperCase().includes("INVESTIGATE")) {
      const result = existingCase ?? (await investigateIncident(payload));
      setActionResults((current) => ({
        ...current,
        [item.id ?? item.title]: `Investigación asignada a ${result.assigned_to?.name ?? "Security"} (${result.assigned_to?.title ?? "Analyst"}).`,
      }));
      setIncidentActions((current) => [result, ...current.filter((entry) => entry.id !== result.id)]);
      return;
    }

    if (action.toUpperCase() === "ALLOW") {
      const draft = existingCase ?? (await investigateIncident(payload));
      const result = await approveIncident(draft.id, { approver_username: draft.assigned_to?.username });
      setActionResults((current) => ({
        ...current,
        [item.id ?? item.title]: `Aceptado por ${result.resolved_by?.name ?? result.assigned_to?.name ?? "Security"}.`,
      }));
      setIncidentActions((current) => [result, ...current.filter((entry) => entry.id !== result.id)]);
      return;
    }

    if (action.toUpperCase().includes("ESCALATE")) {
      const result = existingCase ?? (await escalateIncident(payload));
      setActionResults((current) => ({
        ...current,
        [item.id ?? item.title]: `Escalado a ${result.escalation_chain.map((user) => user.name).join(" -> ")}.`,
      }));
      setIncidentActions((current) => [result, ...current.filter((entry) => entry.id !== result.id)]);
      return;
    }

    if (action.toUpperCase().includes("BLOCK")) {
      const draft = existingCase ?? (await escalateIncident(payload));
      const result = await rejectIncident(draft.id, { approver_username: draft.assigned_to?.username });
      setActionResults((current) => ({
        ...current,
        [item.id ?? item.title]: `Bloqueado por ${result.resolved_by?.name ?? draft.assigned_to?.name ?? "Security"}.`,
      }));
      setIncidentActions((current) => [result, ...current.filter((entry) => entry.id !== result.id)]);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="bb-card p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-body text-base font-semibold text-white">Live Threat Feed</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 font-mono text-[11px] text-[var(--alert-red)]">
            <span className="size-2 rounded-full bg-[var(--alert-red)] animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" />
            LIVE
          </span>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
            {threats.length} events
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <label className="flex h-9 w-full max-w-[240px] items-center gap-2 rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.04] px-3 transition focus-within:border-[var(--glow-purple)] focus-within:shadow-[0_0_14px_rgba(123,47,255,0.24)]">
          <Search aria-hidden className="size-4 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search threats, IPs, users..."
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>
        {selects.map((select) => (
          <select
            key={select}
            aria-label={select}
            defaultValue={select}
            className="h-9 rounded-lg border border-[rgba(123,47,255,0.2)] bg-[var(--bg-card)] px-3 font-mono text-xs text-[var(--text-secondary)] outline-none transition hover:border-[rgba(123,47,255,0.35)] focus:border-[var(--glow-purple)] focus:shadow-[0_0_14px_rgba(123,47,255,0.24)]"
          >
            <option>{select}</option>
          </select>
        ))}
        <button
          type="button"
          className="h-9 rounded-lg border border-[var(--glow-purple)] px-4 font-body text-xs font-semibold text-[var(--glow-violet)] transition hover:bg-[rgba(123,47,255,0.1)] hover:shadow-[0_0_14px_rgba(123,47,255,0.24)]"
        >
          Filter
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.045 } } }}
        className="bb-scrollbar mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1"
      >
        {threats.map((item) => (
          <ThreatFeedItem key={item.id} item={item} onAction={handleThreatAction} />
        ))}
      </motion.div>
    </motion.article>
  );
}

function mapAuditEntryToThreatFeedItem(entry: AuditLogEntry): ThreatFeedItemData {
  const decision = String(entry.decision).toUpperCase();
  const aiRecommendation = String(entry.model_recommendation ?? entry.analyst_decision ?? decision).toUpperCase();
  const severity = severityFromDecisionAndRisk(decision, entry.risk_score);
  const palette = paletteBySeverity(severity);
  const type = String(entry.action).replaceAll("_", " ");

  return {
    id: entry.id,
    severity,
    severityColor: palette.severityColor,
    badgeBg: palette.badgeBg,
    type,
    typeColor: "var(--glow-violet)",
    time: formatTimeAgo(entry.timestamp),
    title: entry.reasoning,
    meta: [
      `User: ${entry.user}`,
      `Role: ${entry.role}`,
      `Resource: ${entry.resource}`,
      `Risk: ${Math.round(entry.risk_score * 100)}%`,
    ],
    confidence: Math.max(20, Math.min(100, Math.round(entry.risk_score * 100))),
    actions: decision === "BLOCK" ? ["Investigate", "Block"] : ["Investigate", decision],
    affectedUser: entry.user,
    department: entry.department,
    resource: entry.resource,
    aiRecommendation,
    finalDecision: decision,
    decisionSource: entry.final_decision_source,
    policyRuleMatched: entry.final_decision_source === "policy" ? entry.policy_rule_matched ?? null : null,
    policyVersion: entry.policy_version ?? null,
  };
}

function severityFromDecisionAndRisk(decision: string, riskScore: number) {
  if (decision === "BLOCK" || riskScore >= 0.8) return "CRITICAL";
  if (decision === "ESCALATE" || riskScore >= 0.6) return "HIGH";
  if (riskScore >= 0.35) return "MEDIUM";
  if (riskScore > 0) return "LOW";
  return "INFO";
}

function paletteBySeverity(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return { severityColor: "var(--alert-red)", badgeBg: criticalBg };
    case "HIGH":
      return { severityColor: "var(--alert-orange)", badgeBg: highBg };
    case "MEDIUM":
      return { severityColor: "var(--alert-yellow)", badgeBg: mediumBg };
    case "LOW":
      return { severityColor: "var(--glow-blue)", badgeBg: lowBg };
    case "RESOLVED":
      return { severityColor: "var(--ok-green)", badgeBg: resolvedBg };
    default:
      return { severityColor: "var(--text-muted)", badgeBg: infoBg };
  }
}

function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function incidentKey(title?: string, affectedUser?: string) {
  return [title ?? "", affectedUser ?? ""].join("::").toLowerCase();
}
