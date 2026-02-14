import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardHeader } from "@/components/mc/dashboard-header";
import type { MCState } from "@/lib/mc/types";

// Mock the MC_API_URL constant
vi.mock("@/lib/mc/constants", () => ({
  MC_API_URL: "http://localhost:9999",
}));

const EMPTY_STATE: MCState = {
  stage: { current: "discovery" },
  tasks: [],
  workers: [],
  gates: {},
  tokens: {
    total_tokens: 0,
    total_cost: 0,
    budget_limit: 0,
    budget_used: 0,
    budget_remaining: 0,
    sessions: [],
  },
  connected: false,
  audit: [],
  checkpoints: [],
};

describe("DashboardHeader tabs", () => {
  it("renders all five tabs including Swarm", () => {
    render(
      <DashboardHeader state={EMPTY_STATE} view="mission" setView={vi.fn()} />,
    );
    expect(screen.getByText("◈ Mission")).toBeInTheDocument();
    expect(screen.getByText("◇ Trace")).toBeInTheDocument();
    expect(screen.getByText("◷ Activity")).toBeInTheDocument();
    expect(screen.getByText("◆ Specs")).toBeInTheDocument();
    expect(screen.getByText("◎ Swarm")).toBeInTheDocument();
  });

  it("calls setView with 'swarm' when Swarm tab clicked", async () => {
    const setView = vi.fn();
    render(
      <DashboardHeader state={EMPTY_STATE} view="mission" setView={setView} />,
    );
    await userEvent.click(screen.getByText("◎ Swarm"));
    expect(setView).toHaveBeenCalledWith("swarm");
  });

  it("highlights the active tab", () => {
    render(
      <DashboardHeader state={EMPTY_STATE} view="swarm" setView={vi.fn()} />,
    );
    const swarmTab = screen.getByText("◎ Swarm");
    expect(swarmTab.className).toContain("text-[#c4b5a0]");
  });
});
