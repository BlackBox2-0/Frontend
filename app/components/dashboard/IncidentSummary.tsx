"use client";

import { motion } from "framer-motion";

const incidents = [
  {
    label: "CRITICAL",
    count: "3",
    subtext: "Require immediate action",
    color: "var(--alert-red)",
  },
  {
    label: "HIGH",
    count: "7",
    subtext: "Under investigation",
    color: "var(--alert-orange)",
  },
  {
    label: "MEDIUM",
    count: "12",
    subtext: "Monitoring active",
    color: "var(--alert-yellow)",
  },
  {
    label: "RESOLVED TODAY",
    count: "9",
    subtext: "Closed successfully",
    color: "var(--ok-green)",
  },
];

export default function IncidentSummary() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="bb-card mt-5 grid min-h-[72px] grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {incidents.map((incident, index) => (
        <div
          key={incident.label}
          className={[
            "flex items-center justify-between gap-4",
            index > 0 ? "xl:border-l xl:border-[var(--bb-divider)] xl:pl-6" : "",
          ].join(" ")}
        >
          <div className="min-w-0">
            <p
              className="font-body text-[9px] uppercase tracking-[0.15em]"
              style={{ color: incident.color }}
            >
              {incident.label}
            </p>
            <p className="mt-1 truncate font-body text-[10px] text-[var(--text-muted)]">
              {incident.subtext}
            </p>
          </div>
          <span className="font-heading text-2xl font-extrabold leading-none" style={{ color: incident.color }}>
            {incident.count}
          </span>
        </div>
      ))}
    </motion.section>
  );
}
