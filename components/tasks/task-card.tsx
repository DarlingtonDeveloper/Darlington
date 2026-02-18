"use client";

import { Task } from "@/lib/tasks/dummy-data";

interface TaskCardProps {
  task: Task;
  style?: React.CSSProperties;
  isTop?: boolean;
  dragX?: number;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

const PRIORITY_COLORS: Record<
  Task["priority"],
  { bg: string; text: string; border: string }
> = {
  P0: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#ef4444",
    border: "rgba(239, 68, 68, 0.4)",
  },
  P1: {
    bg: "rgba(249, 115, 22, 0.15)",
    text: "#f97316",
    border: "rgba(249, 115, 22, 0.4)",
  },
  P2: {
    bg: "rgba(196, 181, 160, 0.15)",
    text: "#c4b5a0",
    border: "rgba(196, 181, 160, 0.4)",
  },
  P3: {
    bg: "rgba(107, 101, 96, 0.15)",
    text: "#6b6560",
    border: "rgba(107, 101, 96, 0.4)",
  },
};

const EFFORT_LABELS: Record<Task["effort"], string> = {
  S: "S  — small",
  M: "M  — medium",
  L: "L  — large",
  XL: "XL — x-large",
};

export function TaskCard({
  task,
  style,
  isTop = false,
  dragX = 0,
  onMouseDown,
  onTouchStart,
}: TaskCardProps) {
  const pickOpacity = Math.min(1, Math.max(0, dragX / 100));
  const skipOpacity = Math.min(1, Math.max(0, -dragX / 100));
  const priority = PRIORITY_COLORS[task.priority];

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        userSelect: "none",
        cursor: isTop ? "grab" : "default",
        touchAction: "none",
        ...style,
      }}
      onMouseDown={isTop ? onMouseDown : undefined}
      onTouchStart={isTop ? onTouchStart : undefined}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #0f0f1a 0%, #0a0a12 100%)",
          border: "1px solid rgba(196, 181, 160, 0.12)",
          borderRadius: "20px",
          padding: "28px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflow: "hidden",
          boxShadow: isTop
            ? "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(196,181,160,0.06)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* PICK overlay */}
        {isTop && (
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              opacity: pickOpacity,
              border: "3px solid #4ade80",
              borderRadius: "8px",
              padding: "4px 12px",
              transform: "rotate(-8deg)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "28px",
                fontWeight: 600,
                color: "#4ade80",
                letterSpacing: "2px",
              }}
            >
              PICK
            </span>
          </div>
        )}

        {/* SKIP overlay */}
        {isTop && (
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              opacity: skipOpacity,
              border: "3px solid #ef4444",
              borderRadius: "8px",
              padding: "4px 12px",
              transform: "rotate(8deg)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "28px",
                fontWeight: 600,
                color: "#ef4444",
                letterSpacing: "2px",
              }}
            >
              SKIP
            </span>
          </div>
        )}

        {/* Header row: priority + service */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: "6px",
              background: priority.bg,
              border: `1px solid ${priority.border}`,
              color: priority.text,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            {task.priority}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "#6b6560",
              letterSpacing: "0.5px",
            }}
          >
            {task.service}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 5vw, 28px)",
              fontWeight: 400,
              color: "#e8e4df",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {task.title}
          </h2>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "#a09890",
            margin: 0,
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </p>

        {/* Effort */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "#6b6560",
              letterSpacing: "0.5px",
            }}
          >
            effort
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "#c4b5a0",
              letterSpacing: "0.5px",
            }}
          >
            {EFFORT_LABELS[task.effort]}
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#6b6560",
                padding: "3px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(107, 101, 96, 0.3)",
                background: "rgba(107, 101, 96, 0.08)",
                letterSpacing: "0.3px",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Subtle gradient at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60px",
            background:
              "linear-gradient(to top, rgba(10,10,18,0.6) 0%, transparent 100%)",
            borderRadius: "0 0 20px 20px",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
