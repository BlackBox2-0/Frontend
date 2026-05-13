"use client";

export default function RadarBackground() {
  return (
    <svg
      aria-hidden="true"
      width="600"
      height="600"
      className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 opacity-15"
    >
      <defs>
        <radialGradient id="radarGrad" cx="0%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#9B5CF6" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      {[80, 160, 240, 320, 400].map((r) => (
        <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="#7B2FFF" strokeWidth="0.5" />
      ))}
      <line x1="300" y1="0" x2="300" y2="600" stroke="#7B2FFF" strokeWidth="0.5" />
      <line x1="0" y1="300" x2="600" y2="300" stroke="#7B2FFF" strokeWidth="0.5" />
      <g className="bb-radar-sweep">
        <path d="M 300 300 L 300 20 A 280 280 0 0 1 580 300 Z" fill="url(#radarGrad)" opacity="0.3" />
      </g>
    </svg>
  );
}
