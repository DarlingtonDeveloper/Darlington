import { useState, useEffect, useRef, useCallback } from "react";

// ─── Mock Data ───────────────────────────────────────────────
const STAGES = [
  "discovery",
  "goal",
  "requirements",
  "planning",
  "design",
  "implement",
  "verify",
  "validate",
  "document",
  "release",
];

const STAGE_ICONS = {
  discovery: "🔍",
  goal: "🎯",
  requirements: "📋",
  planning: "🗺️",
  design: "✏️",
  implement: "⚡",
  verify: "🧪",
  validate: "✅",
  document: "📝",
  release: "🚀",
};

const PERSONAS = [
  "developer",
  "architect",
  "researcher",
  "reviewer",
  "debugger",
  "designer",
  "qa",
  "devops",
  "docs",
];
const ZONES = ["frontend", "backend", "database", "infra", "shared"];
const STATUSES = ["pending", "in_progress", "complete", "blocked"];

const mockWorkers = [
  {
    id: "mc-a1b2c",
    persona: "developer",
    zone: "frontend",
    status: "busy",
    task: "Build auth flow components",
    uptime: 847,
    tokens: 12450,
    stdout: [
      "Creating AuthProvider context...",
      "Implementing useAuth hook...",
      "Building LoginForm component...",
    ],
  },
  {
    id: "mc-d3e4f",
    persona: "architect",
    zone: "backend",
    status: "busy",
    task: "Design API schema for gates",
    uptime: 1203,
    tokens: 8920,
    stdout: [
      "Analyzing gate criteria structure...",
      "Defining REST endpoint contracts...",
      "Writing OpenAPI spec...",
    ],
  },
  {
    id: "mc-g5h6i",
    persona: "reviewer",
    zone: "shared",
    status: "idle",
    task: "Review type definitions",
    uptime: 234,
    tokens: 3100,
    stdout: ["Types look clean.", "Suggesting refinement to Worker interface."],
  },
  {
    id: "mc-j7k8l",
    persona: "debugger",
    zone: "frontend",
    status: "busy",
    task: "Fix WebSocket reconnection",
    uptime: 512,
    tokens: 6700,
    stdout: [
      "Identified race condition in reconnect timer...",
      "Applying exponential backoff fix...",
    ],
  },
  {
    id: "mc-m9n0o",
    persona: "designer",
    zone: "frontend",
    status: "idle",
    task: null,
    uptime: 0,
    tokens: 0,
    stdout: [],
  },
];

const mockTasks = [
  {
    id: "t-001",
    title: "Build login form",
    stage: "implement",
    zone: "frontend",
    status: "in_progress",
    persona: "developer",
    worker_id: "mc-a1b2c",
    blocks: ["t-004"],
  },
  {
    id: "t-002",
    title: "Design API schema",
    stage: "implement",
    zone: "backend",
    status: "in_progress",
    persona: "architect",
    worker_id: "mc-d3e4f",
    blocks: ["t-003"],
  },
  {
    id: "t-003",
    title: "Implement REST endpoints",
    stage: "implement",
    zone: "backend",
    status: "pending",
    persona: "developer",
    worker_id: null,
    blocks: [],
  },
  {
    id: "t-004",
    title: "Auth integration tests",
    stage: "verify",
    zone: "frontend",
    status: "blocked",
    persona: "qa",
    worker_id: null,
    blocks: [],
  },
  {
    id: "t-005",
    title: "Review type definitions",
    stage: "implement",
    zone: "shared",
    status: "in_progress",
    persona: "reviewer",
    worker_id: "mc-g5h6i",
    blocks: [],
  },
  {
    id: "t-006",
    title: "WebSocket reconnection fix",
    stage: "implement",
    zone: "frontend",
    status: "in_progress",
    persona: "debugger",
    worker_id: "mc-j7k8l",
    blocks: [],
  },
  {
    id: "t-007",
    title: "Database schema migration",
    stage: "implement",
    zone: "database",
    status: "complete",
    persona: "developer",
    worker_id: null,
    blocks: [],
  },
  {
    id: "t-008",
    title: "CI/CD pipeline setup",
    stage: "planning",
    zone: "infra",
    status: "complete",
    persona: "devops",
    worker_id: null,
    blocks: [],
  },
  {
    id: "t-009",
    title: "Component design system",
    stage: "design",
    zone: "frontend",
    status: "complete",
    persona: "designer",
    worker_id: null,
    blocks: [],
  },
  {
    id: "t-010",
    title: "Security audit",
    stage: "verify",
    zone: "shared",
    status: "pending",
    persona: "reviewer",
    worker_id: null,
    blocks: ["t-001", "t-002"],
  },
];

const mockGateCriteria = [
  { id: "g-1", text: "All implement tasks complete", met: false },
  { id: "g-2", text: "Type definitions reviewed", met: true },
  { id: "g-3", text: "No critical bugs in backlog", met: true },
  { id: "g-4", text: "API contracts documented", met: false },
  { id: "g-5", text: "WebSocket protocol tested", met: false },
];

const mockAuditLog = [
  {
    id: "a-1",
    timestamp: "2026-02-08T14:32:00Z",
    category: "worker",
    actor: "kai",
    message: "Spawned developer worker mc-a1b2c in frontend zone",
    icon: "⚡",
  },
  {
    id: "a-2",
    timestamp: "2026-02-08T14:28:00Z",
    category: "stage",
    actor: "kai",
    message: "Advanced from design → implement",
    icon: "→",
  },
  {
    id: "a-3",
    timestamp: "2026-02-08T14:25:00Z",
    category: "gate",
    actor: "user",
    message: "Approved design gate",
    icon: "✓",
  },
  {
    id: "a-4",
    timestamp: "2026-02-08T14:20:00Z",
    category: "task",
    actor: "kai",
    message: "Created task: Build login form",
    icon: "+",
  },
  {
    id: "a-5",
    timestamp: "2026-02-08T14:15:00Z",
    category: "worker",
    actor: "kai",
    message: "Spawned architect worker mc-d3e4f in backend zone",
    icon: "⚡",
  },
  {
    id: "a-6",
    timestamp: "2026-02-08T13:50:00Z",
    category: "checkpoint",
    actor: "system",
    message: "Auto-checkpoint cp-20260208-135000",
    icon: "💾",
  },
  {
    id: "a-7",
    timestamp: "2026-02-08T13:45:00Z",
    category: "task",
    actor: "kai",
    message: "Completed: Database schema migration",
    icon: "✓",
  },
  {
    id: "a-8",
    timestamp: "2026-02-08T13:30:00Z",
    category: "worker",
    actor: "system",
    message: "Worker mc-p1q2r completed and exited",
    icon: "⏹",
  },
];

const mockChatHistory = [
  { role: "user", content: "What's the current status of the frontend zone?" },
  {
    role: "assistant",
    content:
      "Frontend has 2 active workers: mc-a1b2c building auth components and mc-j7k8l fixing WebSocket reconnection. The auth flow is ~60% complete — LoginForm and AuthProvider are done, signup and password reset remain. The WS fix has identified a race condition and is applying an exponential backoff strategy.",
  },
  {
    role: "user",
    content: "Should we spawn another developer for the remaining auth work?",
  },
  {
    role: "assistant",
    content:
      "I'd recommend waiting until mc-a1b2c finishes the current auth flow task. Spawning a second developer in the same zone risks merge conflicts on the auth module. Once the login form is complete, we can spawn a second worker for signup/reset. The gate requires all implement tasks complete before we can advance to verify.",
  },
];

const mockCheckpoints = [
  {
    id: "cp-001",
    timestamp: "2026-02-08T14:30:00Z",
    stage: "implement",
    tasks_complete: 3,
    tasks_total: 10,
    auto: false,
  },
  {
    id: "cp-002",
    timestamp: "2026-02-08T13:50:00Z",
    stage: "implement",
    tasks_complete: 2,
    tasks_total: 10,
    auto: true,
  },
  {
    id: "cp-003",
    timestamp: "2026-02-08T12:00:00Z",
    stage: "design",
    tasks_complete: 5,
    tasks_total: 5,
    auto: true,
  },
];

// ─── Utility Functions ───────────────────────────────────────
function formatUptime(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatTokens(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatCost(tokens) {
  return `$${(tokens * 0.000003).toFixed(4)}`;
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Status Colors ───────────────────────────────────────────
const statusColors = {
  pending: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.1)",
    text: "#6b6560",
    dot: "#6b6560",
  },
  in_progress: {
    bg: "rgba(196,181,160,0.08)",
    border: "rgba(196,181,160,0.2)",
    text: "#c4b5a0",
    dot: "#c4b5a0",
  },
  complete: {
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.15)",
    text: "#4ade80",
    dot: "#4ade80",
  },
  blocked: {
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.15)",
    text: "#f87171",
    dot: "#f87171",
  },
  busy: {
    bg: "rgba(196,181,160,0.08)",
    border: "rgba(196,181,160,0.2)",
    text: "#c4b5a0",
    dot: "#c4b5a0",
  },
  idle: {
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.15)",
    text: "#4ade80",
    dot: "#4ade80",
  },
  error: {
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.15)",
    text: "#f87171",
    dot: "#f87171",
  },
  offline: {
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.06)",
    text: "#4a4540",
    dot: "#4a4540",
  },
};

// ─── Sub-Components ──────────────────────────────────────────

function StatusDot({ status, size = 8, pulse = false }) {
  const color = statusColors[status]?.dot || "#6b6560";
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
      }}
    >
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: 0.4,
            animation: "mc-pulse 2s ease-in-out infinite",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    </span>
  );
}

function Badge({ children, variant = "default", style: extraStyle = {} }) {
  const variants = {
    default: {
      background: "rgba(255,255,255,0.06)",
      color: "#a89880",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    accent: {
      background: "rgba(196,181,160,0.12)",
      color: "#c4b5a0",
      border: "1px solid rgba(196,181,160,0.2)",
    },
    success: {
      background: "rgba(74,222,128,0.08)",
      color: "#4ade80",
      border: "1px solid rgba(74,222,128,0.15)",
    },
    danger: {
      background: "rgba(248,113,113,0.08)",
      color: "#f87171",
      border: "1px solid rgba(248,113,113,0.15)",
    },
    warning: {
      background: "rgba(251,191,36,0.08)",
      color: "#fbbf24",
      border: "1px solid rgba(251,191,36,0.15)",
    },
  };
  const v = variants[variant] || variants.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        fontFamily: "'JetBrains Mono', monospace",
        ...v,
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}

function ActionButton({
  children,
  variant = "default",
  onClick,
  disabled,
  small,
}) {
  const variants = {
    default: {
      background: "rgba(255,255,255,0.06)",
      color: "#e8e4df",
      border: "1px solid rgba(255,255,255,0.1)",
      hoverBg: "rgba(255,255,255,0.1)",
    },
    accent: {
      background: "rgba(196,181,160,0.15)",
      color: "#c4b5a0",
      border: "1px solid rgba(196,181,160,0.25)",
      hoverBg: "rgba(196,181,160,0.25)",
    },
    danger: {
      background: "rgba(248,113,113,0.1)",
      color: "#f87171",
      border: "1px solid rgba(248,113,113,0.2)",
      hoverBg: "rgba(248,113,113,0.2)",
    },
    success: {
      background: "rgba(74,222,128,0.1)",
      color: "#4ade80",
      border: "1px solid rgba(74,222,128,0.2)",
      hoverBg: "rgba(74,222,128,0.2)",
    },
  };
  const [hovered, setHovered] = useState(false);
  const v = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 8,
        fontSize: small ? 11 : 12,
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        background: hovered && !disabled ? v.hoverBg : v.background,
        color: v.color,
        border: v.border,
        transition: "all 0.15s ease",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle = {}, className }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 16,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#6b6560",
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: 12,
      }}
    >
      {children}
    </h3>
  );
}

// ─── Pipeline Bar ────────────────────────────────────────────
function PipelineBar({ currentStage }) {
  const currentIdx = STAGES.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 2, padding: "0 0 0 0" }}>
      {STAGES.map((stage, i) => {
        const isCurrent = i === currentIdx;
        const isComplete = i < currentIdx;
        const isFuture = i > currentIdx;
        return (
          <div
            key={stage}
            style={{
              flex: 1,
              position: "relative",
              height: 36,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: isCurrent
                ? "linear-gradient(135deg, rgba(196,181,160,0.2), rgba(196,181,160,0.08))"
                : isComplete
                  ? "rgba(74,222,128,0.06)"
                  : "rgba(255,255,255,0.02)",
              border: isCurrent
                ? "1px solid rgba(196,181,160,0.35)"
                : isComplete
                  ? "1px solid rgba(74,222,128,0.12)"
                  : "1px solid rgba(255,255,255,0.04)",
              cursor: "default",
              transition: "all 0.3s ease",
            }}
          >
            {isCurrent && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 6,
                  background: "rgba(196,181,160,0.05)",
                  animation: "mc-glow 3s ease-in-out infinite",
                }}
              />
            )}
            <span
              style={{
                fontSize: 10,
                fontWeight: isCurrent ? 600 : 500,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
                color: isCurrent
                  ? "#c4b5a0"
                  : isComplete
                    ? "#4ade80"
                    : "#4a4540",
                position: "relative",
                zIndex: 1,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isComplete ? "✓" : STAGE_ICONS[stage]}{" "}
              <span className="hidden-mobile">{stage.slice(0, 4)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────
function DashboardHeader({ currentStage, totalTokens, view, setView }) {
  const burnRate = 142; // tokens/min mock
  const totalCost = formatCost(totalTokens);

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "16px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, rgba(196,181,160,0.2), rgba(196,181,160,0.05))",
              border: "1px solid rgba(196,181,160,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ◈
          </div>
          <div>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e8e4df",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              MissionControl
            </h1>
            <span
              style={{
                fontSize: 10,
                color: "#6b6560",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              darlington.dev/mc
            </span>
          </div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 8,
            }}
          >
            <StatusDot status="idle" size={6} pulse />
            <span
              style={{
                fontSize: 10,
                color: "#4ade80",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              connected
            </span>
          </span>
        </div>

        {/* Task summary counts */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[
            {
              count: mockTasks.filter((t) => t.status === "in_progress").length,
              label: "active",
              color: "#c4b5a0",
            },
            {
              count: mockTasks.filter((t) => t.status === "blocked").length,
              label: "blocked",
              color: "#f87171",
            },
            {
              count: mockTasks.filter((t) => t.status === "pending").length,
              label: "pending",
              color: "#6b6560",
            },
            {
              count: mockTasks.filter((t) => t.status === "complete").length,
              label: "done",
              color: "#4ade80",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 3,
                padding: "3px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: s.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {s.count}
              </span>
              <span
                style={{
                  fontSize: 8,
                  color: "#4a4540",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Token stats */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "#6b6560",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              TOKENS
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#e8e4df",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatTokens(totalTokens)}
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 24,
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "#6b6560",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              COST
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#c4b5a0",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {totalCost}
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 24,
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "#6b6560",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              BURN
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#a89880",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {burnRate}/m
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <PipelineBar currentStage={currentStage} />

      {/* View tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          background: "rgba(255,255,255,0.02)",
          borderRadius: 8,
          padding: 2,
        }}
      >
        {[
          { key: "mission", label: "◈ Mission" },
          { key: "trace", label: "◇ Trace" },
          { key: "activity", label: "◷ Activity" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
              background:
                view === t.key ? "rgba(196,181,160,0.12)" : "transparent",
              color: view === t.key ? "#c4b5a0" : "#6b6560",
              transition: "all 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Zone Worker Group (collapsible) ─────────────────────────
function ZoneGroup({ zone, workers, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const busyCount = workers.filter((w) => w.status === "busy").length;
  const hasBusy = busyCount > 0;
  const ZONE_GLYPHS = {
    frontend: "◧",
    backend: "◨",
    database: "◩",
    infra: "◪",
    shared: "◫",
  };

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: "hidden",
        transition: "all 0.2s ease",
        border: hasBusy
          ? "1px solid rgba(196,181,160,0.12)"
          : "1px solid rgba(255,255,255,0.04)",
        background: hasBusy
          ? "rgba(196,181,160,0.02)"
          : "rgba(255,255,255,0.01)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#e8e4df",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: hasBusy ? "#c4b5a0" : "#4a4540",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            width: 18,
            textAlign: "center",
          }}
        >
          {ZONE_GLYPHS[zone] || "◻"}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: hasBusy ? "#e8e4df" : "#6b6560",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {zone}
        </span>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginLeft: "auto",
            alignItems: "center",
          }}
        >
          {hasBusy && <StatusDot status="busy" size={5} pulse />}
          <Badge variant={hasBusy ? "accent" : "default"}>
            {busyCount}/{workers.length}
          </Badge>
          <span
            style={{
              fontSize: 10,
              color: "#4a4540",
              transition: "transform 0.15s ease",
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </div>
      </button>
      {open && (
        <div
          style={{
            padding: "0 8px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {workers.map((w) => (
            <div
              key={w.id}
              style={{
                display: "flex",
                gap: 8,
                padding: "7px 8px",
                borderRadius: 6,
                background: "rgba(0,0,0,0.15)",
                border: `1px solid ${statusColors[w.status]?.border || "rgba(255,255,255,0.04)"}`,
              }}
            >
              <StatusDot
                status={w.status}
                size={7}
                pulse={w.status === "busy"}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#e8e4df",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {w.persona}
                  </span>
                  {w.status === "busy" && (
                    <ActionButton small variant="danger" onClick={() => {}}>
                      kill
                    </ActionButton>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a89880",
                    marginTop: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {w.task || "Idle — awaiting task"}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 3,
                    fontSize: 9,
                    color: "#4a4540",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span>⏱ {formatUptime(w.uptime)}</span>
                  <span>◈ {formatTokens(w.tokens)}</span>
                  <span>{w.id}</span>
                </div>
                {w.stdout.length > 0 && w.status === "busy" && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "3px 6px",
                      borderRadius: 3,
                      background: "rgba(0,0,0,0.3)",
                      fontSize: 9,
                      color: "#5a5550",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    → {w.stdout[w.stdout.length - 1]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mission View ────────────────────────────────────────────
function MissionView() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(mockChatHistory);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Acknowledged. I'll look into that and update the task board accordingly.",
        },
      ]);
    }, 800);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        height: "calc(100vh - 240px)",
        minHeight: 500,
        paddingTop: 12,
      }}
    >
      {/* Col 1: Workers by Zone */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 2px",
          }}
        >
          <SectionLabel>Workers by Zone</SectionLabel>
          <ActionButton small variant="accent" onClick={() => {}}>
            + Spawn
          </ActionButton>
        </div>
        {ZONES.map((z) => ({
          zone: z,
          workers: mockWorkers.filter(
            (w) => w.zone === z && w.status !== "offline",
          ),
        }))
          .filter((g) => g.workers.length > 0)
          .map((g) => (
            <ZoneGroup
              key={g.zone}
              zone={g.zone}
              workers={g.workers}
              defaultOpen={g.workers.some((w) => w.status === "busy")}
            />
          ))}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            padding: "4px 2px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            marginTop: 4,
            paddingTop: 8,
          }}
        >
          <Badge variant="accent">
            {mockWorkers.filter((w) => w.status === "busy").length} busy
          </Badge>
          <Badge variant="success">
            {mockWorkers.filter((w) => w.status === "idle").length} idle
          </Badge>
          <Badge>
            {mockWorkers.filter((w) => w.status !== "offline").length} total
          </Badge>
        </div>
      </div>

      {/* Col 2: Kai Chat */}
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>🤖</span>
          <SectionLabel style={{ marginBottom: 0 }}>
            <span style={{ marginBottom: 0 }}>Kai</span>
          </SectionLabel>
          <Badge variant="accent" style={{ marginLeft: "auto" }}>
            coordinator
          </Badge>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.5,
                  background:
                    msg.role === "user"
                      ? "rgba(196,181,160,0.15)"
                      : "rgba(255,255,255,0.04)",
                  color: msg.role === "user" ? "#e8e4df" : "#a89880",
                  border:
                    msg.role === "user"
                      ? "1px solid rgba(196,181,160,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message Kai..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e8e4df",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <ActionButton variant="accent" onClick={sendMessage}>
            Send
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}

// ─── Traceability View ───────────────────────────────────────
function TraceView() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = mockTasks.filter((t) => {
    if (filterStage !== "all" && t.stage !== filterStage) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  // Simple graph layout
  const nodeWidth = 160;
  const nodeHeight = 56;
  const gapX = 40;
  const gapY = 20;

  // Group by stage
  const stageGroups = {};
  STAGES.forEach((s) => {
    stageGroups[s] = [];
  });
  filtered.forEach((t) => {
    if (stageGroups[t.stage]) stageGroups[t.stage].push(t);
  });

  // Position nodes
  const nodePositions = {};
  let colIdx = 0;
  const activeStages = STAGES.filter((s) => stageGroups[s].length > 0);
  activeStages.forEach((stage) => {
    const tasks = stageGroups[stage];
    tasks.forEach((t, rowIdx) => {
      nodePositions[t.id] = {
        x: colIdx * (nodeWidth + gapX) + 20,
        y: rowIdx * (nodeHeight + gapY) + 60,
      };
    });
    colIdx++;
  });

  const svgWidth = Math.max(600, activeStages.length * (nodeWidth + gapX) + 40);
  const maxRow = Math.max(
    ...Object.values(stageGroups).map((g) => g.length),
    1,
  );
  const svgHeight = Math.max(300, maxRow * (nodeHeight + gapY) + 100);

  // Build edges
  const edges = [];
  mockTasks.forEach((t) => {
    (t.blocks || []).forEach((targetId) => {
      if (nodePositions[t.id] && nodePositions[targetId]) {
        edges.push({ source: t.id, target: targetId });
      }
    });
  });

  return (
    <div style={{ paddingTop: 16 }}>
      {/* Filters */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 11,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e8e4df",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 11,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e8e4df",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Badge variant="success">
            {
              mockTasks.filter(
                (t) =>
                  t.status !== "blocked" &&
                  t.status !== "complete" &&
                  t.status !== "in_progress",
              ).length
            }{" "}
            ready
          </Badge>
          <Badge variant="danger">
            {mockTasks.filter((t) => t.status === "blocked").length} blocked
          </Badge>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Graph */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            borderRadius: 12,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 350,
          }}
        >
          <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
            {/* Stage labels */}
            {activeStages.map((stage, i) => (
              <text
                key={stage}
                x={i * (nodeWidth + gapX) + 20 + nodeWidth / 2}
                y={25}
                textAnchor="middle"
                style={{
                  fontSize: 9,
                  fill: "#6b6560",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                {stage}
              </text>
            ))}

            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodePositions[edge.source];
              const to = nodePositions[edge.target];
              if (!from || !to) return null;
              const isBlocked =
                mockTasks.find((t) => t.id === edge.target)?.status ===
                "blocked";
              return (
                <line
                  key={i}
                  x1={from.x + nodeWidth}
                  y1={from.y + nodeHeight / 2}
                  x2={to.x}
                  y2={to.y + nodeHeight / 2}
                  stroke={
                    isBlocked
                      ? "rgba(248,113,113,0.4)"
                      : "rgba(196,181,160,0.2)"
                  }
                  strokeWidth={isBlocked ? 2 : 1}
                  strokeDasharray={isBlocked ? "4 2" : "none"}
                  markerEnd={isBlocked ? "" : ""}
                />
              );
            })}

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrow"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(196,181,160,0.3)" />
              </marker>
            </defs>

            {/* Nodes */}
            {filtered.map((t) => {
              const pos = nodePositions[t.id];
              if (!pos) return null;
              const sc = statusColors[t.status];
              const isSelected = selectedTask?.id === t.id;
              return (
                <g
                  key={t.id}
                  onClick={() => setSelectedTask(isSelected ? null : t)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={8}
                    ry={8}
                    fill={isSelected ? "rgba(196,181,160,0.12)" : sc.bg}
                    stroke={isSelected ? "#c4b5a0" : sc.border}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <circle cx={pos.x + 14} cy={pos.y + 16} r={4} fill={sc.dot} />
                  <text
                    x={pos.x + 24}
                    y={pos.y + 19}
                    style={{
                      fontSize: 10,
                      fill: "#e8e4df",
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.title.length > 18 ? t.title.slice(0, 18) + "…" : t.title}
                  </text>
                  <text
                    x={pos.x + 12}
                    y={pos.y + 36}
                    style={{
                      fontSize: 9,
                      fill: "#6b6560",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.persona} · {t.zone}
                  </text>
                  <text
                    x={pos.x + 12}
                    y={pos.y + 48}
                    style={{
                      fontSize: 8,
                      fill: "#4a4540",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedTask && (
          <Card style={{ width: 260, flexShrink: 0 }}>
            <SectionLabel>Task Detail</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#e8e4df",
                    marginBottom: 4,
                  }}
                >
                  {selectedTask.title}
                </div>
                <Badge
                  variant={
                    selectedTask.status === "blocked"
                      ? "danger"
                      : selectedTask.status === "complete"
                        ? "success"
                        : selectedTask.status === "in_progress"
                          ? "accent"
                          : "default"
                  }
                >
                  {selectedTask.status.replace("_", " ")}
                </Badge>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "4px 12px",
                  fontSize: 11,
                }}
              >
                <span style={{ color: "#6b6560" }}>Stage</span>
                <span style={{ color: "#a89880" }}>{selectedTask.stage}</span>
                <span style={{ color: "#6b6560" }}>Zone</span>
                <span style={{ color: "#a89880" }}>{selectedTask.zone}</span>
                <span style={{ color: "#6b6560" }}>Persona</span>
                <span style={{ color: "#a89880" }}>{selectedTask.persona}</span>
                <span style={{ color: "#6b6560" }}>Worker</span>
                <span
                  style={{
                    color: "#a89880",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}
                >
                  {selectedTask.worker_id || "unassigned"}
                </span>
                <span style={{ color: "#6b6560" }}>Blocks</span>
                <span
                  style={{
                    color: "#a89880",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}
                >
                  {selectedTask.blocks?.length
                    ? selectedTask.blocks.join(", ")
                    : "none"}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Activity View ───────────────────────────────────────────
function ActivityView() {
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredLogs =
    filterCategory === "all"
      ? mockAuditLog
      : mockAuditLog.filter((l) => l.category === filterCategory);

  // Token chart mock data
  const chartData = [
    { time: "13:00", tokens: 2100, cost: 0.006 },
    { time: "13:15", tokens: 4300, cost: 0.013 },
    { time: "13:30", tokens: 8700, cost: 0.026 },
    { time: "13:45", tokens: 12000, cost: 0.036 },
    { time: "14:00", tokens: 18500, cost: 0.056 },
    { time: "14:15", tokens: 24100, cost: 0.072 },
    { time: "14:30", tokens: 31170, cost: 0.094 },
  ];

  const maxTokens = Math.max(...chartData.map((d) => d.tokens));
  const chartW = 520;
  const chartH = 140;
  const chartPadL = 50;
  const chartPadR = 10;
  const chartPadT = 10;
  const chartPadB = 25;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;

  const points = chartData.map((d, i) => ({
    x: chartPadL + (i / (chartData.length - 1)) * plotW,
    y: chartPadT + plotH - (d.tokens / maxTokens) * plotH,
  }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartPadT + plotH} L ${points[0].x} ${chartPadT + plotH} Z`;

  // Persona breakdown mock
  const personaBreakdown = [
    { persona: "developer", tokens: 12450, pct: 40 },
    { persona: "architect", tokens: 8920, pct: 29 },
    { persona: "debugger", tokens: 6700, pct: 21 },
    { persona: "reviewer", tokens: 3100, pct: 10 },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        paddingTop: 16,
      }}
    >
      {/* Left: Gate + Audit */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Gate Status */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SectionLabel>Gate — implement</SectionLabel>
            <Badge variant="warning">
              {mockGateCriteria.filter((c) => c.met).length}/
              {mockGateCriteria.length} met
            </Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mockGateCriteria.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: c.met
                    ? "rgba(74,222,128,0.04)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: c.met
                      ? "1.5px solid #4ade80"
                      : "1.5px solid rgba(255,255,255,0.15)",
                    background: c.met ? "rgba(74,222,128,0.15)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#4ade80",
                  }}
                >
                  {c.met ? "✓" : ""}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: c.met ? "#a89880" : "#6b6560",
                    textDecoration: c.met ? "line-through" : "none",
                    opacity: c.met ? 0.7 : 1,
                  }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <ActionButton variant="success" disabled>
              Approve Gate
            </ActionButton>
            <ActionButton variant="danger">Reject</ActionButton>
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SectionLabel>Audit Trail</SectionLabel>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "3px 6px",
                borderRadius: 6,
                fontSize: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e8e4df",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <option value="all">All</option>
              <option value="worker">Workers</option>
              <option value="stage">Stages</option>
              <option value="gate">Gates</option>
              <option value="task">Tasks</option>
              <option value="checkpoint">Checkpoints</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 6px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {log.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 11, color: "#a89880", lineHeight: 1.4 }}
                  >
                    {log.message}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 2,
                      fontSize: 9,
                      color: "#4a4540",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <span>{timeAgo(log.timestamp)}</span>
                    <span>·</span>
                    <span>{log.actor}</span>
                    <span>·</span>
                    <Badge>{log.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right: Stats + Checkpoints + Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Worker & Task counts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {[
            {
              label: "Workers",
              value: mockWorkers.filter((w) => w.status !== "offline").length,
              color: "#e8e4df",
            },
            {
              label: "Busy",
              value: mockWorkers.filter((w) => w.status === "busy").length,
              color: "#c4b5a0",
            },
            { label: "Tasks", value: mockTasks.length, color: "#e8e4df" },
            {
              label: "Complete",
              value: mockTasks.filter((t) => t.status === "complete").length,
              color: "#4ade80",
            },
          ].map((s) => (
            <Card
              key={s.label}
              style={{ textAlign: "center", padding: "8px 6px" }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 300,
                  color: s.color,
                  fontFamily: "'Cormorant Garamond', serif",
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 7,
                  color: "#4a4540",
                  marginTop: 2,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Checkpoints */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SectionLabel>Checkpoints</SectionLabel>
            <ActionButton small variant="accent">
              + Create
            </ActionButton>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mockCheckpoints.map((cp) => (
              <div
                key={cp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ fontSize: 14 }}>{cp.auto ? "🔄" : "💾"}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#e8e4df",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {cp.id}
                  </div>
                  <div style={{ fontSize: 10, color: "#6b6560" }}>
                    {cp.stage} · {cp.tasks_complete}/{cp.tasks_total} tasks ·{" "}
                    {timeAgo(cp.timestamp)}
                  </div>
                </div>
                <ActionButton small>Restore</ActionButton>
              </div>
            ))}
          </div>
        </Card>

        {/* Token usage chart */}
        <Card>
          <SectionLabel>Token Usage Over Time</SectionLabel>
          <svg
            width={chartW}
            height={chartH}
            style={{ display: "block", width: "100%" }}
            viewBox={`0 0 ${chartW} ${chartH}`}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = chartPadT + plotH * (1 - pct);
              return (
                <g key={pct}>
                  <line
                    x1={chartPadL}
                    y1={y}
                    x2={chartW - chartPadR}
                    y2={y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                  <text
                    x={chartPadL - 6}
                    y={y + 3}
                    textAnchor="end"
                    style={{
                      fontSize: 8,
                      fill: "#4a4540",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {formatTokens(maxTokens * pct)}
                  </text>
                </g>
              );
            })}
            {/* X labels */}
            {chartData.map((d, i) => (
              <text
                key={i}
                x={chartPadL + (i / (chartData.length - 1)) * plotW}
                y={chartH - 4}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  fill: "#4a4540",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {d.time}
              </text>
            ))}
            {/* Area fill */}
            <path d={areaPath} fill="rgba(196,181,160,0.06)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#c4b5a0" strokeWidth={1.5} />
            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3}
                fill="#c4b5a0"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={1}
              />
            ))}
          </svg>
        </Card>

        {/* Persona breakdown */}
        <Card>
          <SectionLabel>Cost by Persona</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {personaBreakdown.map((p) => (
              <div key={p.persona}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ color: "#a89880" }}>{p.persona}</span>
                  <span style={{ color: "#6b6560" }}>
                    {formatTokens(p.tokens)} tok · {formatCost(p.tokens)}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${p.pct}%`,
                      borderRadius: 3,
                      background:
                        "linear-gradient(90deg, rgba(196,181,160,0.4), rgba(196,181,160,0.15))",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function MissionControlDashboard() {
  const [view, setView] = useState("mission");
  const totalTokens = mockWorkers.reduce((sum, w) => sum + w.tokens, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes mc-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes mc-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

        select option { background: #0a0a10; color: #e8e4df; }

        .hidden-mobile { display: inline; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none; }
        }
      `}</style>
      <div
        style={{
          background: "#07070e",
          color: "#e8e4df",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          padding: "0 24px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <DashboardHeader
            currentStage="implement"
            totalTokens={totalTokens}
            view={view}
            setView={setView}
          />

          {view === "mission" && <MissionView />}
          {view === "trace" && <TraceView />}
          {view === "activity" && <ActivityView />}
        </div>
      </div>
    </>
  );
}
