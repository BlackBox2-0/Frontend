"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  ShieldX,
  UserCheck,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type FeedItem = {
  severity: string;
  title: string;
  meta: string;
  time: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  pulse?: boolean;
};

const filters = ["All", "Threats", "Access", "Anomalies"];

const items: FeedItem[] = [
  {
    severity: "CRITICAL",
    title: "Unauthorized API access detected",
    meta: "User: j.martinez · System: CORE-DB-01",
    time: "00:32",
    color: "var(--alert-red)",
    icon: ShieldX,
    pulse: true,
  },
  {
    severity: "HIGH",
    title: "Login attempt from unknown IP",
    meta: "IP: 185.220.101.47 · Attempts: 7",
    time: "01:15",
    color: "var(--alert-orange)",
    icon: AlertCircle,
  },
  {
    severity: "MEDIUM",
    title: "Sensitive file accessed off-hours",
    meta: "File: /finance/Q1-report.xlsx · User: k.santos",
    time: "02:41",
    color: "var(--alert-yellow)",
    icon: Eye,
  },
  {
    severity: "INFO",
    title: "New admin session started",
    meta: "User: a.reyes · Location: Lima, PE",
    time: "03:07",
    color: "var(--glow-blue)",
    icon: UserCheck,
  },
  {
    severity: "LOW",
    title: "Behavioral anomaly scored above baseline",
    meta: "Agent-04 flagged · Score delta: +18pts",
    time: "04:22",
    color: "var(--glow-purple)",
    icon: Activity,
  },
  {
    severity: "RESOLVED",
    title: "Threat investigation closed",
    meta: "Case #BB-2847 · Duration: 22min",
    time: "05:10",
    color: "var(--ok-green)",
    icon: CheckCircle,
  },
];

export default function ActivityFeed() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.08 }}
      className="bb-card min-h-80 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-body text-base font-semibold text-[var(--text-primary)]">Live Activity Feed</h2>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ok-green)]">
          <span className="size-2 rounded-full bg-[var(--ok-green)] animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" />
          LIVE
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={[
              "rounded-full border px-3 py-1 font-body text-[11px] transition",
              index === 0
                ? "border-[var(--glow-purple)] bg-[rgba(123,47,255,0.15)] text-[var(--glow-violet-light)]"
                : "border-[color-mix(in_srgb,var(--text-primary)_6%,transparent)] text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="bb-scrollbar mt-4 max-h-[280px] space-y-1 overflow-y-auto pr-1"
      >
        {items.map((item) => (
          <FeedRow key={`${item.severity}-${item.time}`} item={item} />
        ))}
      </motion.div>

      <a
        href="#"
        className="mt-4 inline-flex font-body text-xs text-[var(--glow-violet)] transition hover:underline"
      >
        View all events →
      </a>
    </motion.article>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-lg border-b border-[color-mix(in_srgb,var(--text-primary)_4%,transparent)] px-3 py-2.5 transition hover:bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]"
    >
      <span
        className={[
          "size-2 shrink-0 rounded-full",
          item.pulse ? "animate-[bb-live-pulse_1.2s_ease-in-out_infinite]" : "",
        ].join(" ")}
        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
      />
      <Icon aria-hidden className="size-4 shrink-0" style={{ color: item.color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[13px] text-[var(--text-primary)]">{item.title}</p>
        <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{item.meta}</p>
      </div>
      <time className="shrink-0 font-mono text-[11px] text-[var(--text-muted)]">{item.time}</time>
      <span
        className="shrink-0 rounded px-2 py-0.5 font-mono text-[9px] font-bold"
        style={{
          background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
          color: item.color,
          border: `1px solid color-mix(in srgb, ${item.color} 30%, transparent)`,
        }}
      >
        {item.severity}
      </span>
    </motion.div>
  );
}
