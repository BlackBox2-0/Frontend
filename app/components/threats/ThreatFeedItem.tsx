"use client";

import { motion } from "framer-motion";
import { Bot, Shield, UserCheck } from "lucide-react";

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
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, x: -18 }, visible: { opacity: 1, x: 0 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-[10px] border-l-[3px] bg-white/[0.02] px-4 py-3.5 transition hover:bg-white/[0.04]"
      style={{ borderLeftColor: item.severityColor }}
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
        {item.actions ? (
          <div className="ml-auto flex gap-2">
            {item.actions.map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={() => onAction?.(item, action)}
                className={[
                  "rounded border px-2.5 py-1 font-body text-[11px] font-semibold transition",
                  index === 0
                    ? "border-[var(--glow-blue)] text-[var(--glow-blue-light)] hover:bg-[color-mix(in_srgb,var(--glow-blue)_12%,transparent)] hover:shadow-[0_0_14px_color-mix(in_srgb,var(--glow-blue)_25%,transparent)]"
                    : "border-[var(--alert-red)] text-[var(--alert-red)] hover:bg-[color-mix(in_srgb,var(--alert-red)_12%,transparent)] hover:shadow-[0_0_14px_rgba(239,68,68,0.25)]",
                ].join(" ")}
              >
                {action}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <h3 className="mt-2 font-body text-[13px] font-semibold text-white">{item.title}</h3>
      {(item.aiRecommendation || item.finalDecision || item.decisionSource) ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.aiRecommendation ? (
            <DecisionBadge label="AI Rec." value={item.aiRecommendation} />
          ) : null}
          {item.finalDecision ? (
            <DecisionBadge label="Final" value={item.finalDecision} />
          ) : null}
          {item.decisionSource ? (
            <SourceBadge source={item.decisionSource} />
          ) : null}
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
      {item.actionResult ? (
        <div className="mt-3 rounded border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-[10px] text-[var(--text-secondary)]">
          {item.actionResult}
        </div>
      ) : null}
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
