"use client";

import { FileKey2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getStats, type BackendStats } from "../../lib/backend";
import { SectionLabel } from "./LiveTransactionFeed";

type Contract = {
  name: string;
  agent: string;
  status: "ACTIVE" | "PAUSED";
  getCount: (s: BackendStats) => number;
};

const contracts: Contract[] = [
  {
    name: "Incident Auto-Seal",
    agent: "Enforcer",
    status: "ACTIVE",
    getCount: (s) => s.blocked,
  },
  {
    name: "Threat Evidence Lock",
    agent: "Investigator",
    status: "ACTIVE",
    getCount: (s) => s.escalated,
  },
  {
    name: "Compliance Audit Log",
    agent: "Watchdog",
    status: "ACTIVE",
    getCount: (s) => s.total,
  },
  {
    name: "Identity Verification",
    agent: "Detector",
    status: "ACTIVE",
    getCount: (s) => s.allowed,
  },
];

export default function SmartContracts() {
  const [stats, setStats] = useState<BackendStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setStats(await getStats());
      } catch {}
    }
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mt-5">
      <SectionLabel>◈ SMART CONTRACTS</SectionLabel>
      <div className="mt-3 space-y-1.5">
        {contracts.map((c) => {
          const count = stats ? c.getCount(stats) : null;
          return (
            <div key={c.name} className="flex items-center gap-2 rounded-md bg-[rgba(13,11,26,0.4)] px-2.5 py-2">
              <FileKey2 aria-hidden className="size-3.5 shrink-0 text-[#06B6D4]" />
              <span className="min-w-0 flex-1 truncate font-body text-[11px] text-[#CBD5E1]">{c.name}</span>
              <span
                className="shrink-0 font-mono text-[8px] font-bold"
                style={{ color: c.status === "ACTIVE" ? "#22C55E" : "#F59E0B" }}
              >
                {c.status}
              </span>
              <span className="shrink-0 font-mono text-[9px] text-[#94A3B8]">
                {count !== null ? `${count} exec` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
