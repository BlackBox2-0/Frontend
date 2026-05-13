"use client";

import { FileKey2 } from "lucide-react";
import { SectionLabel } from "./LiveTransactionFeed";

const contracts = [
  ["Incident Auto-Seal", "ACTIVE", "2,341 exec"],
  ["Threat Evidence Lock", "ACTIVE", "1,847 exec"],
  ["Compliance Audit Log", "ACTIVE", "4,291 exec"],
  ["Identity Verification", "PAUSED", "892 exec"],
];

export default function SmartContracts() {
  return (
    <section className="mt-5">
      <SectionLabel>◈ SMART CONTRACTS</SectionLabel>
      <div className="mt-3 space-y-1.5">
        {contracts.map(([name, status, executions]) => (
          <div key={name} className="flex items-center gap-2 rounded-md bg-[rgba(13,11,26,0.4)] px-2.5 py-2">
            <FileKey2 aria-hidden className="size-3.5 text-[#06B6D4]" />
            <span className="min-w-0 flex-1 truncate font-body text-[11px] text-[#CBD5E1]">{name}</span>
            <span className="font-mono text-[8px] font-bold" style={{ color: status === "ACTIVE" ? "#22C55E" : "#F59E0B" }}>
              {status}
            </span>
            <span className="font-mono text-[9px] text-[#94A3B8]">{executions}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
