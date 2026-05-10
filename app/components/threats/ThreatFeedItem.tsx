"use client";

import { motion } from "framer-motion";

export type ThreatFeedItemData = {
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
};

export default function ThreatFeedItem({ item }: { item: ThreatFeedItemData }) {
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
      <div className="mt-3 h-[3px] overflow-hidden rounded-sm bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.confidence}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-sm"
          style={{ background: item.severityColor }}
        />
      </div>
    </motion.article>
  );
}
