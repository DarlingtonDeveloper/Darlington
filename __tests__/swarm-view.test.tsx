import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SwarmView } from "@/components/mc/swarm-view";
import type { SwarmOverview } from "@/lib/mc/types";

const FULL_DATA: SwarmOverview = {
  warren: {
    health: { status: "ok", agents_connected: 3, uptime: 12345 },
    agents: [
      { id: "w1", name: "warren-alpha", state: "ready", policy: "always-on" },
      { id: "w2", name: "warren-beta", state: "sleeping", policy: "on-demand" },
    ],
  },
  chronicle: {
    metrics: { total_events: 500, events_per_minute: 42, error_rate: 0.02 },
    dlq: { depth: 0 },
  },
  dispatch: {
    stats: { pending: 5, in_progress: 2, completed: 10, failed: 1, total: 18 },
    agents: [
      {
        id: "d1",
        name: "dispatch-1",
        status: "busy",
        current_task: "build-ui",
      },
      { id: "d2", name: "dispatch-2", status: "idle" },
    ],
  },
  promptforge: { prompt_count: 7 },
  alexandria: { collection_count: 3 },
  errors: {},
  fetched_at: "2026-02-14T12:00:00Z",
};

describe("SwarmView", () => {
  it("shows loading state when data is null", () => {
    const onRefresh = vi.fn();
    render(<SwarmView data={null} onRefresh={onRefresh} />);
    expect(screen.getByText("Loading fleet data...")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders all five service cards", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("Warren")).toBeInTheDocument();
    expect(screen.getByText("Chronicle")).toBeInTheDocument();
    expect(screen.getByText("Dispatch")).toBeInTheDocument();
    expect(screen.getByText("PromptForge")).toBeInTheDocument();
    expect(screen.getByText("Alexandria")).toBeInTheDocument();
  });

  it("shows warren agent count metric", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("3 agents")).toBeInTheDocument();
  });

  it("renders warren agent cards with names and policies", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("warren-alpha")).toBeInTheDocument();
    expect(screen.getByText("warren-beta")).toBeInTheDocument();
    expect(screen.getByText("always-on")).toBeInTheDocument();
    expect(screen.getByText("on-demand")).toBeInTheDocument();
  });

  it("renders dispatch pipeline stats", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("renders dispatch agent with current task", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("dispatch-1")).toBeInTheDocument();
    expect(screen.getByText("build-ui")).toBeInTheDocument();
  });

  it("renders chronicle metrics", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("2.0%")).toBeInTheDocument();
  });

  it("does not show DLQ warning when depth is 0", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.queryByText("!")).not.toBeInTheDocument();
  });

  it("shows DLQ warning badge when depth > 0", () => {
    const dataWithDlq: SwarmOverview = {
      ...FULL_DATA,
      chronicle: {
        ...FULL_DATA.chronicle!,
        dlq: { depth: 5 },
      },
    };
    render(<SwarmView data={dataWithDlq} onRefresh={vi.fn()} />);
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("renders errors panel when errors present", () => {
    const dataWithErrors: SwarmOverview = {
      ...FULL_DATA,
      errors: { warren: "connection refused", chronicle: "timeout" },
    };
    render(<SwarmView data={dataWithErrors} onRefresh={vi.fn()} />);
    expect(screen.getByText("warren")).toBeInTheDocument();
    expect(screen.getByText("connection refused")).toBeInTheDocument();
    expect(screen.getByText("chronicle")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
  });

  it("does not render errors panel when no errors", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    expect(screen.queryByText("Errors")).not.toBeInTheDocument();
  });

  it("shows fetched_at timestamp in footer", () => {
    render(<SwarmView data={FULL_DATA} onRefresh={vi.fn()} />);
    // The time display depends on locale, so just check prefix
    expect(screen.getByText(/^fetched/)).toBeInTheDocument();
  });

  it("calls onRefresh when Refresh button clicked", async () => {
    const onRefresh = vi.fn();
    render(<SwarmView data={FULL_DATA} onRefresh={onRefresh} />);
    await userEvent.click(screen.getByText("Refresh"));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("handles minimal data gracefully (only errors + fetched_at)", () => {
    const minimal: SwarmOverview = {
      errors: {},
      fetched_at: "2026-02-14T12:00:00Z",
    };
    render(<SwarmView data={minimal} onRefresh={vi.fn()} />);
    // Service cards should render with "--" for missing metrics
    const dashes = screen.getAllByText("--");
    expect(dashes.length).toBe(5);
  });
});
