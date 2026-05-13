"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import useCountUp from "../../hooks/useCountUp";
import { blockchainNodes } from "./blockchainData";
import RadarBackground from "./RadarBackground";

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

const bottomStats = [
  { label: "BLOCKS TODAY", target: 12847, suffix: "", color: "#FFFFFF" },
  { label: "RECORDS SEALED", target: 4291, suffix: "", color: "#06B6D4" },
  { label: "THREATS LOGGED", target: 234, suffix: "", color: "#EF4444" },
  { label: "NODES ACTIVE", target: 8, suffix: " / 10", color: "#22C55E" },
  { label: "CHAIN INTEGRITY", target: 100, suffix: "%", color: "#7B2FFF" },
];

type ActiveLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  color: string;
};

export default function BlockchainMap() {
  const [activeLines, setActiveLines] = useState<ActiveLine[]>([]);

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
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      className="relative order-1 h-[70vh] overflow-hidden lg:order-none lg:h-[calc(100vh-48px)]"
    >
      <RadarBackground />
      <div className="absolute left-0 top-0 z-10 p-4">
        <h1 className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B2FFF]">◈ BLOCKCHAIN NETWORK</h1>
        <p className="mt-1 font-mono text-[10px] text-[#C4B5FD]">Global Node Distribution · Real-time</p>
      </div>

      <div className="relative z-[2] h-[calc(70vh-80px)] pt-8 lg:h-[calc(100vh-48px-80px)]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [20, 15] }}
          className="h-full w-full drop-shadow-[0_0_18px_rgba(123,47,255,0.15)]"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(123,47,255,0.05)"
                  stroke="rgba(123,47,255,0.18)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(123,47,255,0.16)", outline: "none", cursor: "pointer" },
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

          {blockchainNodes.map((node) => (
            <Marker key={node.id} coordinates={node.coords}>
              {[16, 11, 7].map((r, index) => (
                <circle
                  key={r}
                  r={r}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={0.8}
                  strokeOpacity={0.3 - index * 0.08}
                  className="bb-node-pulse"
                  style={{ animationDuration: `${1.5 + index * 0.5}s`, transformOrigin: "center" }}
                />
              ))}
              <circle r={4} fill={node.color} style={{ filter: `drop-shadow(0 0 6px ${node.color})` }} />
              <text
                y={-12}
                textAnchor="middle"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "8px",
                  fill: node.color,
                  fillOpacity: 0.9,
                }}
              >
                {node.label}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      <div className="relative z-10 grid h-20 grid-cols-5 border-t border-[rgba(123,47,255,0.15)] bg-[rgba(13,11,26,0.9)]">
        {bottomStats.map((stat, index) => (
          <BottomStat key={stat.label} {...stat} divider={index > 0} />
        ))}
      </div>
    </motion.section>
  );
}

function BottomStat({ label, target, suffix, color, divider }: { label: string; target: number; suffix: string; color: string; divider: boolean }) {
  const value = useCountUp(target);

  return (
    <div className={["flex flex-col items-center justify-center", divider ? "border-l border-white/[0.06]" : ""].join(" ")}>
      <p className="font-heading text-lg font-bold leading-none" style={{ color }}>
        {value.toLocaleString("en-US")}{suffix}
      </p>
      <p className="mt-2 font-body text-[8px] uppercase tracking-[0.1em] text-[#6B7280]">{label}</p>
    </div>
  );
}
