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
import { useEffect, useMemo, useState } from "react";
import { getAuditLog, type AuditLogEntry } from "../../lib/backend";

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

export default function ActivityFeed() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAuditLog() {
      try {
        const data = await getAuditLog();
        if (!cancelled) {
          setAuditEntries(data);
        }
      } catch {
        if (!cancelled) {
          setAuditEntries([]);
        }
      }
    }

    loadAuditLog();
    const intervalId = window.setInterval(loadAuditLog, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const items = useMemo(() => {
    if (!auditEntries.length) return [];
    return auditEntries.slice(0, 8).map(mapAuditEntryToFeedItem);
  }, [auditEntries]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.08 }}
      className="bb-card min-h-80 min-w-0 overflow-hidden p-6"
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
        {items.length ? items.map((item) => (
          <FeedRow key={`${item.severity}-${item.time}`} item={item} />
        )) : (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-8 text-center">
            <p className="font-body text-sm text-white">No events yet.</p>
            <p className="mt-2 font-mono text-[11px] text-[var(--text-muted)]">Run a simulation or test an agent to populate the feed.</p>
          </div>
        )}
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

function mapAuditEntryToFeedItem(entry: AuditLogEntry): FeedItem {
  const decision = String(entry.decision).toUpperCase();
  const risk = Number(entry.risk_score || 0);
  let severity = "INFO";
  let color = "var(--glow-blue)";
  let icon: ComponentType<SVGProps<SVGSVGElement>> = UserCheck;

  if (decision === "BLOCK") {
    severity = "CRITICAL";
    color = "var(--alert-red)";
    icon = ShieldX;
  } else if (decision === "ESCALATE") {
    severity = "HIGH";
    color = "var(--alert-orange)";
    icon = AlertCircle;
  } else if (risk >= 0.35) {
    severity = "MEDIUM";
    color = "var(--alert-yellow)";
    icon = Eye;
  } else if (risk > 0) {
    severity = "LOW";
    color = "var(--glow-purple)";
    icon = Activity;
  } else {
    severity = "INFO";
    color = "var(--glow-blue)";
    icon = CheckCircle;
  }

  return {
    severity,
    title: entry.reasoning,
    meta: `User: ${entry.user} · Resource: ${entry.resource}`,
    time: formatTime(entry.timestamp),
    color,
    icon,
    pulse: severity === "CRITICAL",
  };
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? timestamp
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      className="flex min-w-0 items-start gap-3 rounded-lg border-b border-[color-mix(in_srgb,var(--text-primary)_4%,transparent)] px-3 py-2.5 transition hover:bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]"
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
        <p
          className="overflow-hidden font-body text-[13px] leading-5 text-[var(--text-primary)]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {item.title}
        </p>
        <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{item.meta}</p>
      </div>
      <time className="shrink-0 pt-0.5 font-mono text-[11px] text-[var(--text-muted)]">{item.time}</time>
      <span
        className="mt-0.5 shrink-0 rounded px-2 py-0.5 font-mono text-[9px] font-bold"
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
