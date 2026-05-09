"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "↓ 1.25 GB Inbound", color: "var(--glow-cyan)" },
  { label: "↑ 980 MB Outbound", color: "var(--alert-red)" },
  { label: "12 Active Connections", color: "var(--glow-purple)" },
];

export default function NetworkActivityMap() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.12 }}
      className="bb-card mt-5 h-[180px] overflow-hidden p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-body text-sm font-semibold text-[var(--text-primary)]">Network Activity Map</h2>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">
          <span className="text-[var(--glow-cyan)]">1.25 GB IN</span>
          <span className="px-2 text-[var(--text-dim)]">·</span>
          <span className="text-[var(--alert-red)]">980 MB OUT</span>
        </p>
      </div>

      <div className="relative mt-2 h-[100px] overflow-hidden">
        <svg aria-hidden="true" viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="networkMapGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#networkMapGlow)" />

          <g fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.25)" strokeWidth="1">
            <path d="M 120 80 L 180 70 L 220 90 L 240 130 L 260 160 L 240 200 L 200 220 L 160 210 L 130 180 L 110 140 Z" />
            <path d="M 190 240 L 230 230 L 260 250 L 270 300 L 250 360 L 220 380 L 190 350 L 175 300 Z" />
            <path d="M 430 80 L 480 70 L 510 90 L 500 120 L 460 130 L 430 120 Z" />
            <path d="M 440 150 L 500 140 L 530 170 L 520 260 L 490 300 L 450 290 L 430 250 L 435 190 Z" />
            <path d="M 510 60 L 700 50 L 760 80 L 740 130 L 680 150 L 600 140 L 530 120 L 500 90 Z" />
            <path d="M 700 150 L 760 140 L 790 170 L 770 200 L 720 200 L 695 175 Z" />
            <path d="M 720 300 L 800 290 L 830 330 L 810 370 L 750 375 L 715 345 Z" />
          </g>

          <line x1="205" y1="290" x2="540" y2="95" stroke="#EF4444" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
          </line>

          <line x1="205" y1="290" x2="695" y2="148" stroke="#EF4444" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
          </line>

          <circle cx="205" cy="290" r="5" fill="#8B5CF6" style={{ filter: "drop-shadow(0 0 6px #8B5CF6)" }} />
          <circle cx="205" cy="290" r="10" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4">
            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          <circle cx="210" cy="148" r="4" fill="#3B82F6" style={{ filter: "drop-shadow(0 0 5px #3B82F6)" }} />
          <circle cx="210" cy="148" r="8" fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3">
            <animate attributeName="r" values="6;12;6" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>

          <circle cx="455" cy="98" r="4" fill="#3B82F6" style={{ filter: "drop-shadow(0 0 5px #3B82F6)" }} />
          <circle cx="455" cy="98" r="8" fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3">
            <animate attributeName="r" values="6;12;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>

          <circle cx="540" cy="95" r="5" fill="#EF4444" style={{ filter: "drop-shadow(0 0 8px #EF4444)" }} />
          <circle cx="540" cy="95" r="10" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeOpacity="0.5">
            <animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>

          <circle cx="695" cy="148" r="5" fill="#EF4444" style={{ filter: "drop-shadow(0 0 8px #EF4444)" }} />
          <circle cx="695" cy="148" r="10" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeOpacity="0.5">
            <animate attributeName="r" values="8;16;8" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>

          <circle cx="228" cy="328" r="4" fill="#06B6D4" style={{ filter: "drop-shadow(0 0 5px #06B6D4)" }} />
          <circle cx="468" cy="235" r="4" fill="#F97316" style={{ filter: "drop-shadow(0 0 5px #F97316)" }} />
          <circle cx="725" cy="258" r="4" fill="#06B6D4" style={{ filter: "drop-shadow(0 0 5px #06B6D4)" }} />
        </svg>
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
