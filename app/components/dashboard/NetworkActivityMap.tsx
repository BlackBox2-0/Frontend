"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import { blockchainNodes } from "../blockchain/blockchainData";
import { getAuditLog, getIncidentSummary, type AuditLogEntry, type IncidentSummary } from "../../lib/backend";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const linePairs = [
  [0, 2],
  [1, 3],
  [2, 4],
  [4, 5],
  [6, 0],
  [7, 4],
  [8, 0],
  [9, 3],
];

type ActiveLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  color: string;
};

export default function NetworkActivityMap() {
  const [activeLines, setActiveLines] = useState<ActiveLine[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, summaryResult] = await Promise.allSettled([getAuditLog(), getIncidentSummary()]);
      if (cancelled) return;
      if (auditResult.status === "fulfilled") setAuditEntries(auditResult.value);
      if (summaryResult.status === "fulfilled") setIncidentSummary(summaryResult.value);
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      const [fromIndex, toIndex] = linePairs[index % linePairs.length];
      const from = blockchainNodes[fromIndex];
      const to = blockchainNodes[toIndex];
      const line = {
        id: `${Date.now()}-${index}`,
        from: from.coords,
        to: to.coords,
        color: to.type === "threat" ? "#EF4444" : to.color,
      };

      setActiveLines((lines) => [...lines, line].slice(-4));
      window.setTimeout(() => {
        setActiveLines((lines) => lines.filter((item) => item.id !== line.id));
      }, 3000);
      index += 1;
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const blocked = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "BLOCK").length;
    const escalated = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "ESCALATE").length;
    const threatOrigins = Math.max(1, Math.min(6, blocked + escalated));
    const openRoutes = incidentSummary?.active ?? activeLines.length;

    return [
      { label: `${blockchainNodes.length} Monitored Regions`, color: "var(--glow-cyan)" },
      { label: `${threatOrigins} Threat Origins`, color: "var(--alert-red)" },
      { label: `${openRoutes} Suspicious Routes`, color: "var(--glow-purple)" },
    ];
  }, [activeLines.length, auditEntries, incidentSummary]);

  const mapNodes = useMemo(
    () =>
      blockchainNodes.map((node) => ({
        ...node,
        label: labelForSecurityNode(node.id, node.type),
      })),
    [],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.12 }}
      className="bb-card mt-5 overflow-hidden p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-body text-sm font-semibold text-[var(--text-primary)]">Threat Route Map</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Global access paths, threat origins, and monitored enterprise systems
          </p>
        </div>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">
          <span className="text-[var(--glow-cyan)]">SYNCED</span>
          <span className="px-2 text-[var(--text-dim)]">·</span>
          <span className="text-[var(--alert-red)]">LIVE RISK ROUTES</span>
        </p>
      </div>

      <div className="relative mt-4 h-[260px] overflow-hidden rounded-md border border-[rgba(123,47,255,0.12)] bg-[rgba(2,1,8,0.45)] md:h-[320px]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,47,255,0.12),transparent_58%)]" />
        <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(123,47,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(123,47,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 135, center: [20, 18] }}
          className="relative z-[1] h-full w-full drop-shadow-[0_0_18px_rgba(123,47,255,0.16)]"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(123,47,255,0.05)"
                  stroke="rgba(123,47,255,0.35)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(123,47,255,0.25)", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {activeLines.map((line) => (
            <Line
              key={line.id}
              from={line.from}
              to={line.to}
              stroke={line.color}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray="6 7"
              className="bb-map-route"
              style={{ filter: `drop-shadow(0 0 5px ${line.color})` }}
            />
          ))}

          {mapNodes.map((node) => (
            <Marker key={node.id} coordinates={node.coords}>
              {[12, 8].map((r, index) => (
                <circle
                  key={r}
                  r={r}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={0.8}
                  strokeOpacity={0.28 - index * 0.08}
                  className="bb-node-pulse"
                  style={{ animationDuration: `${1.5 + index * 0.5}s`, transformOrigin: "center" }}
                />
              ))}
              <circle r={3.5} fill={node.color} style={{ filter: `drop-shadow(0 0 6px ${node.color})` }} />
              <text
                y={-10}
                textAnchor="middle"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "7px",
                  fill: node.color,
                  fillOpacity: 0.9,
                }}
              >
                {node.label.split(" · ")[0]}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {stats.map((stat) => (
          <span
            key={stat.label}
            className="rounded border border-[var(--bb-divider)] px-2.5 py-1 font-mono text-[10px]"
            style={{
              background: `color-mix(in srgb, ${stat.color} 9%, transparent)`,
              color: stat.color,
            }}
          >
            {stat.label}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function labelForSecurityNode(id: number, type: string) {
  switch (id) {
    case 1:
      return "SOC-HQ · Lima";
    case 2:
      return "AUTH-EDGE · Miami";
    case 3:
      return "IDENTITY-GW · London";
    case 4:
      return "FINANCE-DB · Frankfurt";
    case 5:
      return "AUDIT-STORE · Singapore";
    case 6:
      return "ARCHIVE-VAULT · Tokyo";
    case 7:
      return "THREAT-ORIGIN · Moscow";
    case 8:
      return "THREAT-ORIGIN · Beijing";
    case 9:
      return "HR-OPS · São Paulo";
    case 10:
      return "MONITOR-NODE · Lagos";
    default:
      return type === "threat" ? "THREAT-ORIGIN" : "ENTERPRISE-NODE";
  }
}
