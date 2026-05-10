"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ThreatFeedItem, { type ThreatFeedItemData } from "./ThreatFeedItem";

const criticalBg = "rgba(239,68,68,0.15)";
const highBg = "rgba(249,115,22,0.15)";
const mediumBg = "rgba(245,158,11,0.15)";
const lowBg = "rgba(59,130,246,0.15)";
const infoBg = "rgba(148,163,184,0.15)";
const resolvedBg = "rgba(34,197,94,0.15)";

const threats: ThreatFeedItemData[] = [
  {
    severity: "CRITICAL",
    severityColor: "var(--alert-red)",
    badgeBg: criticalBg,
    type: "SQL Injection",
    typeColor: "var(--glow-violet)",
    time: "2 min ago",
    title: "SQL injection attempt on authentication endpoint",
    meta: ["IP: 185.220.101.47", "User: anonymous", "System: AUTH-API-01", "Country: RU"],
    confidence: 96,
    actions: ["Investigate", "Block"],
  },
  {
    severity: "CRITICAL",
    severityColor: "var(--alert-red)",
    badgeBg: criticalBg,
    type: "Brute Force",
    typeColor: "var(--glow-violet)",
    time: "5 min ago",
    title: "Repeated failed login attempts - account lockout triggered",
    meta: ["IP: 203.0.113.42", "User: admin", "Attempts: 847", "Country: CN"],
    confidence: 99,
    actions: ["Investigate", "Block IP"],
  },
  {
    severity: "HIGH",
    severityColor: "var(--alert-orange)",
    badgeBg: highBg,
    type: "Data Exfiltration",
    typeColor: "var(--glow-violet)",
    time: "12 min ago",
    title: "Unusual large file transfer to external endpoint",
    meta: ["User: k.santos", "Size: 2.3GB", "Dest: 104.21.45.67", "Dept: Finance"],
    confidence: 87,
  },
  {
    severity: "HIGH",
    severityColor: "var(--alert-orange)",
    badgeBg: highBg,
    type: "Privilege Escalation",
    typeColor: "var(--glow-violet)",
    time: "18 min ago",
    title: "User attempted to access restricted admin panel",
    meta: ["User: r.vega", "System: ADMIN-PANEL", "Role: IT Admin", "IP: 10.0.1.45"],
    confidence: 82,
  },
  {
    severity: "HIGH",
    severityColor: "var(--alert-orange)",
    badgeBg: highBg,
    type: "Anomalous Access",
    typeColor: "var(--glow-violet)",
    time: "31 min ago",
    title: "Resource access outside business hours detected",
    meta: ["User: m.torres", "Time: 02:47 AM", "System: CORE-DB-01", "Day: Sunday"],
    confidence: 78,
  },
  {
    severity: "MEDIUM",
    severityColor: "var(--alert-yellow)",
    badgeBg: mediumBg,
    type: "Policy Violation",
    typeColor: "var(--glow-violet)",
    time: "45 min ago",
    title: "Sensitive document shared via unauthorized channel",
    meta: ["User: j.martinez", "File: Q1-report.xlsx", "Channel: Personal email"],
    confidence: 71,
  },
  {
    severity: "MEDIUM",
    severityColor: "var(--alert-yellow)",
    badgeBg: mediumBg,
    type: "Reconnaissance",
    typeColor: "var(--glow-violet)",
    time: "1h ago",
    title: "Port scanning activity detected from internal host",
    meta: ["IP: 10.0.2.88", "Ports: 1-65535", "Protocol: TCP", "Duration: 23min"],
    confidence: 65,
  },
  {
    severity: "MEDIUM",
    severityColor: "var(--alert-yellow)",
    badgeBg: mediumBg,
    type: "Credential Stuffing",
    typeColor: "var(--glow-violet)",
    time: "1h 20min ago",
    title: "Multiple accounts targeted with leaked credentials",
    meta: ["Accounts: 34", "Success: 2", "Source: TOR exit node", "Country: XX"],
    confidence: 74,
  },
  {
    severity: "LOW",
    severityColor: "var(--glow-blue)",
    badgeBg: lowBg,
    type: "Config Change",
    typeColor: "var(--glow-violet)",
    time: "2h ago",
    title: "Firewall rule modified without change ticket",
    meta: ["User: a.reyes", "System: FW-CORE-01", "Rule: #4471", "Change: Allow"],
    confidence: 55,
  },
  {
    severity: "LOW",
    severityColor: "var(--glow-blue)",
    badgeBg: lowBg,
    type: "Behavioral",
    typeColor: "var(--glow-violet)",
    time: "2h 30min ago",
    title: "Employee productivity pattern deviation detected",
    meta: ["User: p.garcia", "Score delta: +22pts", "Agent: Agent-03", "Dept: HR"],
    confidence: 48,
  },
  {
    severity: "INFO",
    severityColor: "var(--text-muted)",
    badgeBg: infoBg,
    type: "System Event",
    typeColor: "var(--glow-violet)",
    time: "3h ago",
    title: "New device registered on corporate network",
    meta: ["Device: MacBook Pro", "MAC: 3C:22:FB:XX:XX", "User: new.hire", "VLAN: 10"],
    confidence: 30,
  },
  {
    severity: "RESOLVED",
    severityColor: "var(--ok-green)",
    badgeBg: resolvedBg,
    type: "Malware",
    typeColor: "var(--glow-violet)",
    time: "4h ago",
    title: "Malicious script quarantined and removed successfully",
    meta: ["File: invoice.exe", "Hash: a3f2...", "System: WS-023", "Action: Quarantine"],
    confidence: 100,
  },
];

const selects = ["All Severity", "All Types", "Last 24h"];

export default function ThreatFeed() {
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
            847 events
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <label className="flex h-9 w-full max-w-[240px] items-center gap-2 rounded-lg border border-[rgba(59,130,246,0.2)] bg-white/[0.04] px-3 transition focus-within:border-[var(--glow-blue)] focus-within:shadow-[0_0_14px_color-mix(in_srgb,var(--glow-blue)_24%,transparent)]">
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
            className="h-9 rounded-lg border border-[rgba(59,130,246,0.2)] bg-[var(--bg-card)] px-3 font-mono text-xs text-[var(--text-secondary)] outline-none transition hover:border-[rgba(59,130,246,0.35)] focus:border-[var(--glow-blue)] focus:shadow-[0_0_14px_color-mix(in_srgb,var(--glow-blue)_24%,transparent)]"
          >
            <option>{select}</option>
          </select>
        ))}
        <button
          type="button"
          className="h-9 rounded-lg border border-[var(--glow-blue)] px-4 font-body text-xs font-semibold text-[var(--glow-blue-light)] transition hover:bg-[color-mix(in_srgb,var(--glow-blue)_10%,transparent)] hover:shadow-[0_0_14px_color-mix(in_srgb,var(--glow-blue)_24%,transparent)]"
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
          <ThreatFeedItem key={`${item.time}-${item.title}`} item={item} />
        ))}
      </motion.div>
    </motion.article>
  );
}
