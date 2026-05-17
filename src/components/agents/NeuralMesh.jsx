"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const REPULSION = 4000;
const IDEAL_LENGTH = 150;
const SPRING_K = 0.004;
const DAMPING = 0.88;
const GRAVITY = 0.001;
const DRIFT_AMP = 0.06;
const MAX_SPEED = 2;
const CANVAS_HEIGHT = 480;
const BOUNDS_PADDING = 100;

const fallbackAgents = [
  { id: "Agent-01", role: "Threat Hunter", status: "investigating", mass: 2.5 },
  { id: "Agent-02", role: "Network Watcher", status: "monitoring", mass: 1.8 },
  { id: "Agent-03", role: "Behavioral Analyst", status: "scanning", mass: 2.0 },
  { id: "Agent-04", role: "Data Guardian", status: "monitoring", mass: 1.6 },
  { id: "Agent-05", role: "Log Analyzer", status: "idle", mass: 1.2 },
  { id: "Agent-06", role: "Fraud Detector", status: "investigating", mass: 2.2 },
  { id: "Agent-07", role: "Insider Threat", status: "scanning", mass: 1.9 },
  { id: "CORE", role: "BlackBooks AI Core", status: "core", mass: 5.0, fixed: true },
];

const edges = [
  { from: "CORE", to: "Agent-01" },
  { from: "CORE", to: "Agent-02" },
  { from: "CORE", to: "Agent-03" },
  { from: "CORE", to: "Agent-04" },
  { from: "CORE", to: "Agent-05" },
  { from: "CORE", to: "Agent-06" },
  { from: "CORE", to: "Agent-07" },
  { from: "Agent-01", to: "Agent-03" },
  { from: "Agent-01", to: "Agent-06" },
  { from: "Agent-02", to: "Agent-04" },
  { from: "Agent-03", to: "Agent-07" },
  { from: "Agent-04", to: "Agent-05" },
  { from: "Agent-06", to: "Agent-07" },
];

const statusColors = {
  core: "#7B2FFF",
  investigating: "#EF4444",
  monitoring: "#4F46E5",
  scanning: "#9B5CF6",
  idle: "#64748B",
};

const taskByStatus = {
  core: "Coordinating active defense mesh",
  investigating: "Case #BB-2891",
  monitoring: "Watching anomalous flows",
  scanning: "Scanning behavioral drift",
  idle: "Standby queue clean",
};

const FALLBACK_CANVAS_COLOR = "#7B2FFF";

let colorParserContext = null;

function getColorParserContext() {
  if (colorParserContext) return colorParserContext;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  colorParserContext = canvas.getContext("2d");
  return colorParserContext;
}

const fallbackAgentMetrics = {
  "Agent-01": { accuracy: "96.2%", tasks: 47, uptime: "99.8%", response: "42ms", progress: 78 },
  "Agent-02": { accuracy: "98.4%", tasks: 63, uptime: "99.9%", response: "31ms", progress: 86 },
  "Agent-03": { accuracy: "94.7%", tasks: 38, uptime: "99.2%", response: "56ms", progress: 62 },
  "Agent-04": { accuracy: "97.9%", tasks: 52, uptime: "99.6%", response: "35ms", progress: 72 },
  "Agent-05": { accuracy: "91.5%", tasks: 19, uptime: "98.7%", response: "88ms", progress: 24 },
  "Agent-06": { accuracy: "95.8%", tasks: 41, uptime: "99.4%", response: "47ms", progress: 68 },
  "Agent-07": { accuracy: "93.6%", tasks: 33, uptime: "99.1%", response: "61ms", progress: 55 },
  CORE: { accuracy: "99.1%", tasks: 293, uptime: "100%", response: "18ms", progress: 92 },
};

function getRadius(node) {
  if (node.status === "core") return 36;
  if (node.status === "investigating") return 22;
  if (node.status === "monitoring") return 17;
  if (node.status === "scanning") return 18;
  return 13;
}

function getPointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function makeBreathingMotion() {
  return {
    breatheX: Math.random() * Math.PI * 2,
    breatheY: Math.random() * Math.PI * 2,
    breatheSpeedX: 0.0002 + Math.random() * 0.0001,
    breatheSpeedY: 0.0001 + Math.random() * 0.0002,
    breatheAmp: 0.04 + Math.random() * 0.03,
  };
}

function makeNodes(width, height, agents) {
  const core = agents.find((agent) => agent.id === "CORE");
  const agentNodes = agents.filter((agent) => agent.id !== "CORE");
  const radius = Math.min(width, height) * 0.3;
  const angleStep = (Math.PI * 2) / agentNodes.length;

  const nodes = agentNodes.map((agent, index) => {
    const angle = angleStep * index;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;

    return {
      ...agent,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      ax: 0,
      ay: 0,
      color: statusColors[agent.status],
      radius: getRadius(agent),
      fixed: false,
      dragging: false,
      pulsePhase: index * 0.9,
      ...makeBreathingMotion(),
    };
  });

  if (core) {
    nodes.push({
      ...core,
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      color: statusColors[core.status],
      radius: getRadius(core),
      fixed: true,
      dragging: false,
      pulsePhase: agentNodes.length * 0.9,
      ...makeBreathingMotion(),
    });
  }

  return nodes;
}

function hydrateNodeMotion(node) {
  return {
    breatheX: node.breatheX ?? Math.random() * Math.PI * 2,
    breatheY: node.breatheY ?? Math.random() * Math.PI * 2,
    breatheSpeedX: node.breatheSpeedX ?? 0.0002 + Math.random() * 0.0001,
    breatheSpeedY: node.breatheSpeedY ?? 0.0001 + Math.random() * 0.0002,
    breatheAmp: node.breatheAmp ?? 0.04 + Math.random() * 0.03,
  };
}

function getBezierPoint(a, b, cpX, cpY, t) {
  const invT = 1 - t;

  return {
    x: invT * invT * a.x + 2 * invT * t * cpX + t * t * b.x,
    y: invT * invT * a.y + 2 * invT * t * cpY + t * t * b.y,
  };
}

function normalizeCanvasColor(input, fallback = FALLBACK_CANVAS_COLOR) {
  const candidate = typeof input === "string" ? input.trim() : "";
  const ctx = getColorParserContext();

  if (!candidate) return fallback;
  if (!ctx) return candidate.startsWith("#") ? candidate : fallback;

  const sentinel = "__codex_invalid_color__";
  ctx.fillStyle = sentinel;
  ctx.fillStyle = candidate;

  return ctx.fillStyle === sentinel ? fallback : ctx.fillStyle;
}

function colorToRgba(input, alpha, fallback = FALLBACK_CANVAS_COLOR) {
  const normalized = normalizeCanvasColor(input, fallback);
  const match = normalized.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return `rgba(123,47,255,${alpha})`;
  }

  const parts = match[1]
    .split(",")
    .map((part) => part.trim())
    .slice(0, 3)
    .map((part) => Number.parseFloat(part));

  if (!parts.every((value) => Number.isFinite(value))) {
    return `rgba(123,47,255,${alpha})`;
  }

  const [r, g, b] = parts;
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}

/**
 * @param {{ agents?: import("../../../app/lib/backend").BackendAgent[] }} props
 */
export default function NeuralMesh({ agents = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const nodeMapRef = useRef(new Map());
  const dimensionsRef = useRef({ width: 0, height: CANVAS_HEIGHT });
  const hoverRef = useRef(null);
  const dragRef = useRef({ node: null, moved: false, lastMouseX: 0, lastMouseY: 0, mouseX: 0, mouseY: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: CANVAS_HEIGHT });

  const meshAgents = useMemo(() => {
    const source = agents.length ? agents : fallbackAgents.map((agent, index) => ({
      id: agent.id,
      role: agent.role,
      status: agent.status.toUpperCase(),
      task: taskByStatus[agent.status],
      accuracy: fallbackAgentMetrics[agent.id]?.accuracy ?? "95.0%",
      accuracy_value: Number.parseFloat(fallbackAgentMetrics[agent.id]?.accuracy ?? "95"),
      module: "mesh",
      endpoint: "/agents",
      color: statusColors[agent.status],
    }));

    return source.map((agent, index) => {
      const normalizedStatus = normalizeStatus(agent.status, agent.id);
      const accuracyValue =
        typeof agent.accuracy_value === "number" && Number.isFinite(agent.accuracy_value)
          ? agent.accuracy_value
          : Number.parseFloat(String(agent.accuracy ?? "95").replace("%", ""));
      return {
        id: agent.id,
        role: agent.role,
        status: normalizedStatus,
        task: agent.task || taskByStatus[normalizedStatus],
        mass: agent.id === "CORE" ? 5 : normalizedStatus === "investigating" ? 2.2 : normalizedStatus === "monitoring" ? 1.8 : normalizedStatus === "scanning" ? 1.9 : 1.2,
        fixed: agent.id === "CORE",
        color: agent.color || statusColors[normalizedStatus],
        radius: getRadius({ status: normalizedStatus }),
        pulsePhase: index * 0.9,
        accuracy: agent.accuracy || `${accuracyValue.toFixed(1)}%`,
        tasksToday: Math.max(1, Math.round(accuracyValue / 2)),
        uptime: `${Math.max(97, Math.min(100, accuracyValue + 1)).toFixed(1)}%`,
        response: `${Math.max(18, Math.round(120 - accuracyValue))}ms`,
        progress: Math.max(20, Math.min(98, Math.round(accuracyValue))),
      };
    });
  }, [agents]);

  const agentsById = useMemo(
    () => new Map(meshAgents.map((agent) => [agent.id, agent])),
    [meshAgents],
  );

  const syncNodeMap = useCallback(() => {
    nodeMapRef.current = new Map(nodesRef.current.map((node) => [node.id, node]));
  }, []);

  const resetPositions = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    const nodes = nodesRef.current;
    if (!nodes.length || !width || !height) return;

    const core = nodes.find((node) => node.id === "CORE");
    if (core) {
      core.x = width / 2;
      core.y = height / 2;
      core.vx = 0;
      core.vy = 0;
      core.ax = 0;
      core.ay = 0;
    }

    const agentNodes = nodes.filter((node) => node.id !== "CORE");
    const radius = Math.min(width, height) * 0.28;

    agentNodes.forEach((node, index) => {
      const angle = ((Math.PI * 2) / agentNodes.length) * index;
      node.x = width / 2 + Math.cos(angle) * radius;
      node.y = height / 2 + Math.sin(angle) * radius;
      node.vx = (Math.random() - 0.5) * 0.5;
      node.vy = (Math.random() - 0.5) * 0.5;
      node.ax = 0;
      node.ay = 0;
    });

    syncNodeMap();
  }, [syncNodeMap]);

  const findNodeAt = useCallback((x, y) => {
    for (let i = nodesRef.current.length - 1; i >= 0; i -= 1) {
      const node = nodesRef.current[i];
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 10) {
        return node;
      }
    }

    return null;
  }, []);

  const connectedAgents = useCallback((nodeId) => {
    const activeIds = new Set(meshAgents.map((agent) => agent.id));
    const connected = new Set();

    edges.forEach((edge) => {
      if (edge.from === nodeId) connected.add(edge.to);
      if (edge.to === nodeId) connected.add(edge.from);
    });

    return Array.from(connected)
      .filter((id) => activeIds.has(id))
      .map((id) => agentsById.get(id))
      .filter(Boolean);
  }, [agentsById, meshAgents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const resize = () => {
      const width = Math.max(container.clientWidth, 320);
      const height = CANVAS_HEIGHT;
      const dpr = window.devicePixelRatio || 1;
      const previousNodes = nodesRef.current;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = "100%";
      canvas.style.height = `${height}px`;
      dimensionsRef.current = { width, height };
      setDimensions({ width, height });

      if (!previousNodes.length) {
        nodesRef.current = makeNodes(width, height, meshAgents);
        resetPositions();
      } else {
        nodesRef.current = previousNodes.map((node) => ({
          ...node,
          ...(agentsById.get(node.id) ?? {}),
          x: node.fixed ? width / 2 : node.x,
          y: node.fixed ? height / 2 : node.y,
          radius: getRadius(node),
          ...hydrateNodeMotion(node),
        }));
      }

      syncNodeMap();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [agentsById, meshAgents, resetPositions, syncNodeMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handlePointerMove = (event) => {
      const { x, y } = getPointerPosition(event, canvas);
      const draggingNode = dragRef.current.node;

      if (draggingNode) {
        const targetX = Math.max(BOUNDS_PADDING, Math.min(dimensionsRef.current.width - BOUNDS_PADDING, x));
        const targetY = Math.max(BOUNDS_PADDING, Math.min(dimensionsRef.current.height - BOUNDS_PADDING, y));

        dragRef.current.lastMouseX = dragRef.current.mouseX;
        dragRef.current.lastMouseY = dragRef.current.mouseY;
        dragRef.current.mouseX = targetX;
        dragRef.current.mouseY = targetY;

        draggingNode.x += (targetX - draggingNode.x) * 0.3;
        draggingNode.y += (targetY - draggingNode.y) * 0.3;
        draggingNode.vx = 0;
        draggingNode.vy = 0;
        dragRef.current.moved = true;
        setHoveredNode(draggingNode);
        hoverRef.current = draggingNode;
        return;
      }

      const nextHover = findNodeAt(x, y);
      if (nextHover?.id !== hoverRef.current?.id) {
        hoverRef.current = nextHover;
        setHoveredNode(nextHover);
      }
    };

    const handlePointerDown = (event) => {
      const { x, y } = getPointerPosition(event, canvas);
      const node = findNodeAt(x, y);
      if (!node) return;

      if (node.fixed) {
        hoverRef.current = node;
        setHoveredNode(node);
        setSelectedNode({ ...node });
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      node.dragging = true;
      node.vx = 0;
      node.vy = 0;
      dragRef.current = { node, moved: false, lastMouseX: x, lastMouseY: y, mouseX: x, mouseY: y };
      hoverRef.current = node;
      setHoveredNode(node);
    };

    const handlePointerUp = (event) => {
      const draggingNode = dragRef.current.node;
      if (!draggingNode) return;

      const { x, y } = getPointerPosition(event, canvas);
      const targetX = Math.max(BOUNDS_PADDING, Math.min(dimensionsRef.current.width - BOUNDS_PADDING, x));
      const targetY = Math.max(BOUNDS_PADDING, Math.min(dimensionsRef.current.height - BOUNDS_PADDING, y));

      draggingNode.dragging = false;
      draggingNode.vx = (targetX - dragRef.current.lastMouseX) * 0.5;
      draggingNode.vy = (targetY - dragRef.current.lastMouseY) * 0.5;

      if (!dragRef.current.moved) {
        setSelectedNode({ ...draggingNode });
      }
      dragRef.current = { node: null, moved: false, lastMouseX: 0, lastMouseY: 0, mouseX: 0, mouseY: 0 };
    };

    const handlePointerLeave = () => {
      if (!dragRef.current.node) {
        hoverRef.current = null;
        setHoveredNode(null);
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [findNodeAt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const tickPhysics = () => {
      const nodes = nodesRef.current;
      const { width, height } = dimensionsRef.current;

      nodes.forEach((node) => {
        node.ax = 0;
        node.ay = 0;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = REPULSION / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!a.fixed && !a.dragging) {
            a.ax -= fx;
            a.ay -= fy;
          }
          if (!b.fixed && !b.dragging) {
            b.ax += fx;
            b.ay += fy;
          }
        }
      }

      edges.forEach((edge) => {
        const a = nodeMapRef.current.get(edge.from);
        const b = nodeMapRef.current.get(edge.to);
        if (!a || !b) return;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const stretch = dist - IDEAL_LENGTH;
        const force = stretch * SPRING_K;
        const snapMultiplier = dist > IDEAL_LENGTH * 2 ? 1 + (dist / IDEAL_LENGTH) * 0.3 : 1;
        const ax = (dx / dist) * force * snapMultiplier;
        const ay = (dy / dist) * force * snapMultiplier;

        if (!a.fixed && !a.dragging) {
          a.ax += ax;
          a.ay += ay;
        }
        if (!b.fixed && !b.dragging) {
          b.ax -= ax;
          b.ay -= ay;
        }
      });

      nodes.forEach((node) => {
        if (node.fixed || node.dragging) return;

        const t = Date.now();

        node.ax += (width / 2 - node.x) * GRAVITY;
        node.ay += (height / 2 - node.y) * GRAVITY;
        node.ax += (Math.random() - 0.5) * DRIFT_AMP;
        node.ay += (Math.random() - 0.5) * DRIFT_AMP;
        node.ax += Math.sin(t * node.breatheSpeedX + node.breatheX) * node.breatheAmp;
        node.ay += Math.cos(t * node.breatheSpeedY + node.breatheY) * node.breatheAmp;

        node.vx += node.ax;
        node.vy += node.ay;

        const speed = Math.sqrt(node.vx ** 2 + node.vy ** 2);
        if (speed > MAX_SPEED) {
          node.vx = (node.vx / speed) * MAX_SPEED;
          node.vy = (node.vy / speed) * MAX_SPEED;
        }

        node.vx *= DAMPING;
        node.vy *= DAMPING;

        // Recover from NaN (can occur if speed was 0 during cap calculation)
        if (!isFinite(node.vx) || !isFinite(node.vy)) {
          node.vx = 0;
          node.vy = 0;
        }

        node.x += node.vx;
        node.y += node.vy;

        if (!isFinite(node.x) || !isFinite(node.y)) {
          const { width: w, height: h } = dimensionsRef.current;
          node.x = w / 2;
          node.y = h / 2;
          node.vx = 0;
          node.vy = 0;
        }

        if (node.x < BOUNDS_PADDING) {
          node.x = BOUNDS_PADDING;
          node.vx = Math.abs(node.vx) * 0.4;
        }
        if (node.x > width - BOUNDS_PADDING) {
          node.x = width - BOUNDS_PADDING;
          node.vx = -Math.abs(node.vx) * 0.4;
        }
        if (node.y < BOUNDS_PADDING) {
          node.y = BOUNDS_PADDING;
          node.vy = Math.abs(node.vy) * 0.4;
        }
        if (node.y > height - BOUNDS_PADDING) {
          node.y = height - BOUNDS_PADDING;
          node.vy = -Math.abs(node.vy) * 0.4;
        }

        node.ax = 0;
        node.ay = 0;
      });
    };

    const drawBackground = (width, height) => {
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.6);
      bgGrad.addColorStop(0, "rgba(123,47,255,0.08)");
      bgGrad.addColorStop(0.5, "rgba(155,92,246,0.03)");
      bgGrad.addColorStop(1, "rgba(5,3,15,0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(123,47,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawEdge = (edge, edgeIndex, highlighted = false) => {
      const a = nodeMapRef.current.get(edge.from);
      const b = nodeMapRef.current.get(edge.to);
      if (!a || !b) return;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const tension = dist / IDEAL_LENGTH;
      const alpha = 0.25;
      const aColor = normalizeCanvasColor(a.color);
      const bColor = normalizeCanvasColor(b.color);
      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, colorToRgba(aColor, alpha));
      gradient.addColorStop(1, colorToRgba(bColor, alpha));

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const cpX = midX + (-dy / dist) * (15 + tension * 5);
      const cpY = midY + (dx / dist) * (15 + tension * 5);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cpX, cpY, b.x, b.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (highlighted) return;

      for (let p = 0; p < 2; p += 1) {
        const t = (Date.now() * 0.0005 + p * 0.5 + edgeIndex * 0.2) % 1;
        const point = getBezierPoint(a, b, cpX, cpY, t);
        const pulseRadius = 2 + tension * 0.5;
        const pulseColor = normalizeCanvasColor(a.color);

        ctx.beginPath();
        ctx.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = pulseColor;
        ctx.shadowBlur = 8 + tension * 4;
        ctx.shadowColor = pulseColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const drawNeuronDendrites = (node, displayRadius) => {
      if (!isFinite(node.x) || !isFinite(node.y)) return;
      const numDendrites = node.id === "CORE" ? 10 : 6;
      const time = Date.now() * 0.001;
      const seed = node.pulsePhase;
      const nodeColor = normalizeCanvasColor(node.color);

      for (let i = 0; i < numDendrites; i++) {
        const baseAngle = seed + i * ((Math.PI * 2) / numDendrites);
        const sway = Math.sin(time * 0.4 + i * 1.7 + seed) * 0.06;
        const angle = baseAngle + sway;
        const lenMult = 1.5 + 0.5 * Math.sin(seed * 3 + i * 2.3);
        const dendriteLen = displayRadius * lenMult;

        const sx = node.x + Math.cos(angle) * displayRadius * 0.85;
        const sy = node.y + Math.sin(angle) * displayRadius * 0.85;
        const ex = node.x + Math.cos(angle) * (displayRadius + dendriteLen);
        const ey = node.y + Math.sin(angle) * (displayRadius + dendriteLen);

        const perpAngle = angle + Math.PI / 2;
        const curvature = dendriteLen * 0.18 * Math.sin(seed + i * 1.4);
        const cpx = (sx + ex) / 2 + Math.cos(perpAngle) * curvature;
        const cpy = (sy + ey) / 2 + Math.sin(perpAngle) * curvature;

        const dendGrad = ctx.createLinearGradient(sx, sy, ex, ey);
        dendGrad.addColorStop(0, colorToRgba(nodeColor, 0.33));
        dendGrad.addColorStop(1, colorToRgba(nodeColor, 0.03));

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        ctx.strokeStyle = dendGrad;
        ctx.lineWidth = node.id === "CORE" ? 1.5 : 1;
        ctx.stroke();

        // Branch point at ~65% along the quadratic
        const t = 0.65;
        const bx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cpx + t * t * ex;
        const by = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cpy + t * t * ey;
        const dtx = 2 * (1 - t) * (cpx - sx) + 2 * t * (ex - cpx);
        const dty = 2 * (1 - t) * (cpy - sy) + 2 * t * (ey - cpy);
        const tangentAngle = Math.atan2(dty, dtx);
        const branchLen = dendriteLen * 0.38;

        [-0.5, 0.5].forEach((branchOff) => {
          const bAngle = tangentAngle + branchOff;
          const bbx = bx + Math.cos(bAngle) * branchLen;
          const bby = by + Math.sin(bAngle) * branchLen;

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bbx, bby);
          ctx.strokeStyle = colorToRgba(nodeColor, 0.16);
          ctx.lineWidth = 0.7;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(bbx, bby, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = colorToRgba(nodeColor, 0.33);
          ctx.fill();
        });

        // Pulsing terminal bouton at dendrite tip
        const boutonR = 2.2 + Math.sin(time * 2.5 + i * 1.1 + seed) * 0.9;
        const boutonGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, boutonR * 2.5);
        boutonGrad.addColorStop(0, colorToRgba(nodeColor, 0.8));
        boutonGrad.addColorStop(0.5, colorToRgba(nodeColor, 0.33));
        boutonGrad.addColorStop(1, colorToRgba(nodeColor, 0));
        ctx.beginPath();
        ctx.arc(ex, ey, boutonR, 0, Math.PI * 2);
        ctx.fillStyle = boutonGrad;
        ctx.fill();
      }
    };

    const drawNode = (node) => {
      if (!isFinite(node.x) || !isFinite(node.y)) return;

      const hovered = node.id === hoverRef.current?.id;
      const pulse = Math.sin(Date.now() * 0.002 + (node.pulsePhase || 0));
      const vx = isFinite(node.vx) ? node.vx : 0;
      const vy = isFinite(node.vy) ? node.vy : 0;
      const speed = Math.sqrt(vx ** 2 + vy ** 2);
      const energyPulse = Math.min(speed * 0.3, 4);
      const displayRadius = (node.radius || 14) + energyPulse;
      const auraRadius = displayRadius + 8 + pulse * 4;
      const nodeColor = normalizeCanvasColor(node.color);

      // Dendrites are decorative — render failure must not affect the node body
      try { drawNeuronDendrites(node, displayRadius); } catch {}

      [0.04, 0.08, 0.12].forEach((opacity, i) => {
        const r = auraRadius - i * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = colorToRgba(nodeColor, opacity);
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const gradient = ctx.createRadialGradient(
        node.x - displayRadius * 0.3,
        node.y - displayRadius * 0.3,
        0,
        node.x,
        node.y,
        displayRadius,
      );
      gradient.addColorStop(0, colorToRgba(nodeColor, 1));
      gradient.addColorStop(0.6, colorToRgba(nodeColor, 0.8));
      gradient.addColorStop(1, colorToRgba(nodeColor, 0.53));

      ctx.beginPath();
      ctx.arc(node.x, node.y, displayRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowBlur = (node.id === "CORE" ? 60 : hovered ? 40 : 20) + energyPulse * 3;
      ctx.shadowColor = node.id === "CORE" ? "rgba(123,47,255,0.6)" : nodeColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(node.x - displayRadius * 0.25, node.y - displayRadius * 0.25, displayRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();

      if (node.id === "CORE") {
        const coreRing = 45 + Math.sin(Date.now() * 0.002) * 8;

        ctx.beginPath();
        ctx.arc(node.x, node.y, coreRing, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(123,47,255,0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(Date.now() * 0.0005);
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = "#7B2FFF66";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(-Date.now() * 0.0003);
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 2);
        ctx.setLineDash([2, 12]);
        ctx.strokeStyle = "#9B5CF640";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(node.id, node.x, node.y + displayRadius + 16);

      ctx.fillStyle = nodeColor;
      ctx.font = "10px 'Syne'";
      ctx.fillText(node.role, node.x, node.y + displayRadius + 28);

      const badgeText = node.status.toUpperCase();
      const badgeW = ctx.measureText(badgeText).width + 12;
      ctx.fillStyle = colorToRgba(nodeColor, 0.15);
      ctx.beginPath();
      drawRoundRect(ctx, node.x - badgeW / 2, node.y + displayRadius + 32, badgeW, 14, 4);
      ctx.fill();
      ctx.fillStyle = nodeColor;
      ctx.font = "8px 'JetBrains Mono'";
      ctx.fillText(badgeText, node.x, node.y + displayRadius + 42);
    };

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const { width, height } = dimensionsRef.current;
      if (!width || !height) return;

      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawBackground(width, height);

      tickPhysics();

      edges.forEach((edge, index) => drawEdge(edge, index));

      if (hoverRef.current) {
        edges.forEach((edge, index) => {
          if (edge.from === hoverRef.current.id || edge.to === hoverRef.current.id) {
            drawEdge(edge, index, true);
          }
        });
      }

      nodesRef.current.forEach(drawNode);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [agentsById, meshAgents]);

  const selectedLiveNode = selectedNode;
  const selectedMetrics = selectedLiveNode
    ? {
        accuracy: selectedLiveNode.accuracy,
        tasks: selectedLiveNode.tasksToday,
        uptime: selectedLiveNode.uptime,
        response: selectedLiveNode.response,
        progress: selectedLiveNode.progress,
      }
    : null;
  const tooltipMetrics = hoveredNode
    ? {
        accuracy: hoveredNode.accuracy,
        tasks: hoveredNode.tasksToday,
      }
    : null;
  const selectedConnections = selectedLiveNode ? connectedAgents(selectedLiveNode.id) : [];

  return (
    <div className="flex w-full items-start gap-4">
      <div
        ref={containerRef}
        className="relative h-[480px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-[rgba(123,47,255,0.2)] bg-[var(--bg-base)]"
      >
        <canvas
          ref={canvasRef}
          aria-label="BlackBooks AI agents force-directed neural mesh"
          className="absolute inset-0 z-[1] h-[480px] w-full cursor-grab bg-transparent active:cursor-grabbing"
          style={{ pointerEvents: "all" }}
        />

        <AnimatePresence>
          {hoveredNode && tooltipMetrics ? (
            <motion.div
              key={hoveredNode.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.14 }}
              className="pointer-events-none absolute z-20 min-w-[218px] rounded-[10px] border px-4 py-3 font-mono text-[11px] text-slate-200 shadow-2xl"
              style={{
                left: Math.min(hoveredNode.x + 20, Math.max(dimensions.width - 238, 12)),
                top: Math.max(12, hoveredNode.y - 20),
                background: "rgba(5,3,15,0.95)",
                borderColor: colorToRgba(hoveredNode.color, 0.25),
                boxShadow: `0 0 20px ${colorToRgba(hoveredNode.color, 0.12)}`,
              }}
            >
              <div className="font-bold text-white">{hoveredNode.id}</div>
              <div style={{ color: normalizeCanvasColor(hoveredNode.color) }}>{hoveredNode.role}</div>
              <div className="my-2 h-px bg-slate-700/70" />
              <div>Status: {hoveredNode.status.toUpperCase()}</div>
              <div>Task: {hoveredNode.task}</div>
              <div>Accuracy: {tooltipMetrics.accuracy}</div>
              <div>Tasks today: {tooltipMetrics.tasks}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedLiveNode && selectedMetrics ? (
          <motion.aside
            key={selectedLiveNode.id}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex h-[480px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[rgba(123,47,255,0.2)] bg-[rgba(13,11,26,0.97)] shadow-[-18px_0_32px_rgba(2,1,8,0.22)] backdrop-blur-md"
          >
            {/* Scrollable content area */}
            <div className="relative min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <button
                type="button"
                aria-label="Close agent details"
                onClick={() => setSelectedNode(null)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-md border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white"
              >
                X
              </button>

              <header className="pr-8">
                <div className="flex items-center gap-3">
                  <span
                    className="size-4 rounded-full shadow-[0_0_16px_currentColor]"
                    style={{ background: selectedLiveNode.color, color: selectedLiveNode.color }}
                  />
                  <h2 className="font-heading text-[20px] font-bold text-white">{selectedLiveNode.id}</h2>
                </div>
                <p className="mt-1 font-body text-[13px]" style={{ color: selectedLiveNode.color }}>
                  {selectedLiveNode.role}
                </p>
                <motion.span
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="mt-3 inline-flex rounded border px-2 py-1 font-mono text-[9px] font-bold"
                  style={{ borderColor: `${selectedLiveNode.color}40`, color: selectedLiveNode.color }}
                >
                  {selectedLiveNode.status.toUpperCase()}
                </motion.span>
              </header>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Tasks Today", selectedMetrics.tasks],
                  ["Accuracy", selectedMetrics.accuracy],
                  ["Uptime", selectedMetrics.uptime],
                  ["Response Time", selectedMetrics.response],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="font-heading text-[22px] font-bold text-white">{value}</div>
                    <div className="font-body text-[9px] uppercase text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <section className="mt-6">
                <div className="font-body text-[9px] uppercase text-slate-500">Current Task</div>
                <p className="mt-2 font-mono text-[12px] leading-5 text-slate-300">{selectedLiveNode.task}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedMetrics.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: selectedLiveNode.color, boxShadow: `0 0 14px ${selectedLiveNode.color}` }}
                  />
                </div>
              </section>

              <section className="mt-6">
                <div className="font-body text-[9px] uppercase text-slate-500">Connected To</div>
                <div className="mt-3 flex flex-col gap-2">
                  {selectedConnections.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                      <span className="size-2 rounded-full" style={{ background: agent.color }} />
                      {agent.id}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Buttons always pinned at bottom, never overlapping */}
            <div className="shrink-0 border-t border-white/[0.06] p-4 flex flex-col gap-2">
              {["View Full Logs", "Assign New Task", "Pause Agent"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-md border border-white/10 px-3 py-2 text-left font-body text-[12px] text-slate-300 transition hover:bg-white/[0.04]"
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = `${selectedLiveNode.color}70`;
                    event.currentTarget.style.color = selectedLiveNode.color;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    event.currentTarget.style.color = "#CBD5E1";
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function normalizeStatus(status, id) {
  if (id === "CORE") return "core";
  const value = String(status || "").toUpperCase();
  if (value === "INVESTIGATING" || value === "ANALYZING" || value === "ENFORCING") return "investigating";
  if (value === "MONITORING" || value === "WATCHING") return "monitoring";
  if (value === "SCANNING") return "scanning";
  if (value === "CORE") return "core";
  return "idle";
}
