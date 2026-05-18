"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Bot, Shield, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import type { SimulationDetail } from "../../lib/simulationStore";

export type ThreatFeedItemData = {
  id?: string;
  severity: string;
  severityColor: string;
  badgeBg: string;
  type: string;
  typeColor: string;
  time: string;
  title: string;
  meta: string[];
  confidence: number;
  actions?: string[];
  affectedUser?: string;
  department?: string;
  resource?: string;
  actionResult?: string;
  aiRecommendation?: string;
  finalDecision?: string;
  decisionSource?: "model" | "policy" | "human";
  policyRuleMatched?: string | null;
  policyVersion?: string | null;
  simulationDetail?: SimulationDetail;
};

const decisionStyles: Record<string, string> = {
  ALLOW:
    "border-[color-mix(in_srgb,var(--ok-green)_28%,transparent)] bg-[color-mix(in_srgb,var(--ok-green)_12%,transparent)] text-[var(--ok-green)]",
  ESCALATE:
    "border-[color-mix(in_srgb,var(--alert-yellow)_28%,transparent)] bg-[color-mix(in_srgb,var(--alert-yellow)_12%,transparent)] text-[var(--alert-yellow)]",
  BLOCK:
    "border-[color-mix(in_srgb,var(--alert-red)_28%,transparent)] bg-[color-mix(in_srgb,var(--alert-red)_12%,transparent)] text-[var(--alert-red)]",
};

export default function ThreatFeedItem({
  item,
  onAction,
}: {
  item: ThreatFeedItemData;
  onAction?: (item: ThreatFeedItemData, action: string) => void;
}) {
  const [expanded, setExpanded] = useState(!!item.simulationDetail);
  const sim = item.simulationDetail;

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, x: -18 }, visible: { opacity: 1, x: 0 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-[10px] border-l-[3px] bg-white/[0.02] transition hover:bg-white/[0.04]"
      style={{ borderLeftColor: item.severityColor }}
    >
      {/* ── Clickable header row ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        className="cursor-pointer px-4 py-3.5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{ background: item.badgeBg, color: item.severityColor }}
          >
            {item.severity}
          </span>
          <span
            className="rounded px-2 py-0.5 font-mono text-[10px]"
            style={{
              background: `color-mix(in srgb, ${item.typeColor} 11%, transparent)`,
              color: item.typeColor,
            }}
          >
            {item.type}
          </span>
          <time className="font-mono text-[10px] text-[var(--text-muted)]">{item.time}</time>
          {sim ? (
            <span className="rounded border border-[rgba(123,47,255,0.3)] bg-[rgba(123,47,255,0.1)] px-2 py-0.5 font-mono text-[9px] text-[var(--glow-violet-light)]">
              SIMULATION
            </span>
          ) : null}
          {!sim && item.actions ? (
            <div className="ml-auto flex gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              {item.actions.map((action, index) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction?.(item, action)}
                  className={[
                    "rounded border px-2.5 py-1 font-body text-[11px] font-semibold transition",
                    index === 0
                      ? "border-[var(--glow-blue)] text-[var(--glow-blue-light)] hover:bg-[color-mix(in_srgb,var(--glow-blue)_12%,transparent)]"
                      : "border-[var(--alert-red)] text-[var(--alert-red)] hover:bg-[color-mix(in_srgb,var(--alert-red)_12%,transparent)]",
                  ].join(" ")}
                >
                  {action}
                </button>
              ))}
            </div>
          ) : (
            <span className="ml-auto text-[var(--text-muted)]">
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </span>
          )}
        </div>

        <h3 className="mt-2 font-body text-[13px] font-semibold text-white">{item.title}</h3>

        {(item.aiRecommendation || item.finalDecision || item.decisionSource) ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.aiRecommendation ? <DecisionBadge label="AI Rec." value={item.aiRecommendation} /> : null}
            {item.finalDecision ? <DecisionBadge label="Final" value={item.finalDecision} /> : null}
            {item.decisionSource ? <SourceBadge source={item.decisionSource} /> : null}
            {item.policyVersion ? (
              <span className="rounded border border-white/[0.05] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]">
                {item.policyVersion}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.meta.map((meta) => (
            <span
              key={meta}
              className="rounded border border-white/[0.05] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]"
            >
              {meta}
            </span>
          ))}
        </div>

        {item.policyRuleMatched ? (
          <div className="mt-2 rounded border border-[rgba(249,115,22,0.22)] bg-[rgba(249,115,22,0.08)] px-3 py-2 font-mono text-[10px] text-[var(--alert-orange)]">
            Policy Override · {item.policyRuleMatched}
          </div>
        ) : null}

        <div className="mt-3 h-[3px] overflow-hidden rounded-sm bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.confidence}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-sm"
            style={{ background: item.severityColor }}
          />
        </div>
      </div>

      {/* ── Expandable detail ── */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-4 py-4 space-y-3">
              {sim ? (
                <>
                  {/* Event */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Event Detected</p>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-body text-[14px] font-semibold text-white">{sim.user}</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{sim.role} · {sim.department}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[rgba(56,189,248,0.12)] px-2 py-0.5 font-mono text-[10px] text-[var(--glow-cyan)]">
                        {sim.action}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">{sim.resource}</span>
                    </div>
                    <p className="font-mono text-[10px] leading-relaxed text-[var(--text-muted)] italic">{sim.context}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">Activity</p>
                      <p className="font-body text-[12px] font-semibold text-white truncate">{sim.activitySystem}</p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">{sim.activityAction}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">Productivity</p>
                      <p className={[
                        "font-body text-[12px] font-bold",
                        sim.productivityDecision === "PRODUCTIVE" ? "text-[var(--ok-green)]"
                          : sim.productivityDecision === "NON_WORK_RELATED" ? "text-[var(--alert-red)]"
                          : "text-[var(--alert-yellow)]",
                      ].join(" ")}>
                        {sim.productivityDecision.replace(/_/g, " ")}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                        {(sim.productivityScore * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">Risk Score</p>
                      <p className={[
                        "font-mono text-2xl font-bold leading-none",
                        sim.riskScore >= 0.8 ? "text-[var(--alert-red)]"
                          : sim.riskScore >= 0.5 ? "text-[var(--alert-orange)]"
                          : "text-[var(--ok-green)]",
                      ].join(" ")}>
                        {(sim.riskScore * 100).toFixed(0)}
                        <span className="text-[11px] font-normal text-[var(--text-muted)]"> /100</span>
                      </p>
                      {sim.flags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {sim.flags.map((flag) => (
                            <span key={flag} className="rounded bg-[rgba(239,68,68,0.14)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--alert-red)]">
                              {flag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Decision chain */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Decision Chain</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">Gemini</span>
                      <span className={["rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]", decisionStyles[sim.aiRecommendation] ?? "border-white/10 text-white"].join(" ")}>
                        {sim.aiRecommendation}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">→ Policy Engine →</span>
                      <span className={["rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]", decisionStyles[sim.finalDecision] ?? "border-white/10 text-white"].join(" ")}>
                        {sim.finalDecision}
                      </span>
                      {sim.policyVersion ? (
                        <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{sim.policyVersion}</span>
                      ) : null}
                    </div>
                    {sim.decisionSource === "policy" && sim.policyRuleMatched ? (
                      <div className="rounded-lg border border-[rgba(249,115,22,0.28)] bg-[rgba(249,115,22,0.08)] px-3 py-2">
                        <p className="font-body text-xs font-semibold text-[var(--alert-orange)]">Policy Override</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">{sim.policyRuleMatched}</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[rgba(56,189,248,0.28)] bg-[rgba(56,189,248,0.08)] px-3 py-2">
                        <p className="font-body text-xs font-semibold text-[var(--glow-cyan)]">AI Decision</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)]">Gemini recommendation matched the active corporate policy.</p>
                      </div>
                    )}
                  </div>

                  {/* Reasoning */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1.5">Enforcement Reasoning</p>
                    <p className="font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">{sim.reasoning}</p>
                    {sim.requiresHumanApproval ? (
                      <p className="mt-2 font-mono text-[10px] text-[var(--alert-yellow)]">⚠ Requires human approval</p>
                    ) : null}
                  </div>

                  {/* Executive summary */}
                  {sim.executiveSummary && sim.finalDecision !== "ALLOW" ? (
                    <div className="rounded-lg px-4 py-3" style={{
                      borderLeft: `3px solid ${sim.finalDecision === "BLOCK" ? "#EF4444" : "#F59E0B"}`,
                      background: sim.finalDecision === "BLOCK" ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.07)",
                    }}>
                      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em]"
                        style={{ color: sim.finalDecision === "BLOCK" ? "#EF4444" : "#F59E0B" }}>
                        🛡 Security Audit Summary
                      </p>
                      <p className="font-body text-[12px] leading-relaxed text-white">{sim.executiveSummary}</p>
                    </div>
                  ) : null}

                  {/* Human confirmation */}
                  <div className="rounded-xl border border-[rgba(123,47,255,0.22)] bg-[rgba(123,47,255,0.06)] px-4 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--glow-violet-light)] mb-3">
                      Human Confirmation Required
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAction?.(item, "ALLOW"); }}
                        className="flex-1 rounded-lg border border-[var(--ok-green)] bg-[color-mix(in_srgb,var(--ok-green)_10%,transparent)] px-4 py-2.5 font-body text-[13px] font-bold text-[var(--ok-green)] transition hover:bg-[color-mix(in_srgb,var(--ok-green)_18%,transparent)]"
                      >
                        ✓ Allow
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAction?.(item, "BLOCK"); }}
                        className="flex-1 rounded-lg border border-[var(--alert-red)] bg-[color-mix(in_srgb,var(--alert-red)_10%,transparent)] px-4 py-2.5 font-body text-[13px] font-bold text-[var(--alert-red)] transition hover:bg-[color-mix(in_srgb,var(--alert-red)_18%,transparent)]"
                      >
                        ✕ Block
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {item.actionResult ? (
                <div className="rounded border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-[10px] text-[var(--text-secondary)]">
                  {item.actionResult}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function DecisionBadge({ label, value }: { label: string; value: string }) {
  const style = decisionStyles[value] ?? "border-white/[0.08] bg-white/[0.03] text-[var(--text-secondary)]";
  return (
    <span className={["rounded border px-2 py-1 font-mono text-[10px]", style].join(" ")}>
      {label}: {value}
    </span>
  );
}

function SourceBadge({ source }: { source: "model" | "policy" | "human" }) {
  const icon = source === "policy" ? Shield : source === "human" ? UserCheck : Bot;
  const label = source === "policy" ? "Policy" : source === "human" ? "Human" : "Model";
  const Icon = icon;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-white/[0.05] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
      <Icon className="size-3" />
      Source: {label}
    </span>
  );
}
