import type {
  Task,
  Worker,
  GateCriteria,
  TokenSummary,
  CheckpointInfo,
} from "@/lib/mc/types";

export interface DemoState {
  stage: string;
  tasks: Task[];
  workers: Worker[];
  gates: Record<string, GateCriteria>;
  tokens: TokenSummary;
  checkpoints: CheckpointInfo[];
}

export interface DemoStep {
  delay: number;
  type: "message" | "state";
  role?: "user" | "assistant";
  content?: string;
  patch?: Partial<DemoState>;
}

const INITIAL_STATE: DemoState = {
  stage: "discovery",
  tasks: [],
  workers: [],
  gates: {},
  tokens: {
    total_tokens: 0,
    total_cost: 0,
    budget_limit: 5.0,
    budget_used: 0,
    budget_remaining: 5.0,
    sessions: [],
  },
  checkpoints: [],
};

const now = new Date().toISOString();

export const DEMO_SCRIPT: DemoStep[] = [
  // --- Opening ---
  {
    delay: 1000,
    type: "message",
    role: "assistant",
    content:
      "Hey! I'm Kai, your development coordinator. Let me show you how DutyBound works by walking through a real project setup.",
  },
  {
    delay: 2500,
    type: "message",
    role: "user",
    content: "I want to build a CLI task manager in Go",
  },
  {
    delay: 2000,
    type: "message",
    role: "assistant",
    content:
      "Great choice! I'll start by running discovery — researching the problem space and what already exists. Let me initialize the project and get started.",
  },

  // --- Discovery stage begins ---
  {
    delay: 1500,
    type: "state",
    patch: {
      stage: "discovery",
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "in_progress",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "pending",
          created_at: now,
          updated_at: now,
        },
      ],
      gates: {
        discovery: {
          stage: "discovery",
          status: "pending",
          criteria: [
            { description: "Problem space documented", met: false },
            { description: "Existing solutions catalogued", met: false },
            { description: "Technical feasibility confirmed", met: false },
          ],
        },
      },
      tokens: {
        total_tokens: 1240,
        total_cost: 0.02,
        budget_limit: 5.0,
        budget_used: 0.02,
        budget_remaining: 4.98,
        sessions: [
          {
            worker_id: "w1",
            persona: "researcher",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 820,
            output_tokens: 420,
            total_tokens: 1240,
            estimated_cost_usd: 0.02,
          },
        ],
      },
    },
  },
  {
    delay: 1500,
    type: "message",
    role: "assistant",
    content:
      "I've spawned a researcher to explore the CLI task manager landscape. You can see them in the dashboard — they're analyzing existing tools and Go CLI frameworks.",
  },

  // --- Worker appears ---
  {
    delay: 2000,
    type: "state",
    patch: {
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "busy",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 12,
          tokens: 1240,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
    },
  },

  // --- Discovery findings ---
  {
    delay: 3500,
    type: "message",
    role: "assistant",
    content:
      "Researcher found 3 popular approaches. Existing tools like Taskwarrior use local file storage, while newer ones use SQLite. For Go, cobra + bubbletea is the dominant stack for interactive CLIs. All gate criteria met — shall I advance to the Goal stage?",
  },

  // --- Tasks done, gate criteria met ---
  {
    delay: 1500,
    type: "state",
    patch: {
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
      ],
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "idle",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 45,
          tokens: 3860,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
      gates: {
        discovery: {
          stage: "discovery",
          status: "pending",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
        },
      },
      tokens: {
        total_tokens: 3860,
        total_cost: 0.06,
        budget_limit: 5.0,
        budget_used: 0.06,
        budget_remaining: 4.94,
        sessions: [
          {
            worker_id: "w1",
            persona: "researcher",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 2540,
            output_tokens: 1320,
            total_tokens: 3860,
            estimated_cost_usd: 0.06,
          },
        ],
      },
    },
  },

  // --- User approves gate ---
  {
    delay: 2500,
    type: "message",
    role: "user",
    content: "Approve the gate",
  },
  {
    delay: 1000,
    type: "state",
    patch: {
      gates: {
        discovery: {
          stage: "discovery",
          status: "approved",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
          approved_at: now,
          approval_note: "User approved",
        },
      },
      checkpoints: [
        {
          id: "cp1",
          stage: "discovery",
          created_at: now,
          task_count: 2,
          auto: false,
        },
      ],
    },
  },

  // --- Advance to goal ---
  {
    delay: 1500,
    type: "state",
    patch: {
      stage: "goal",
      gates: {
        discovery: {
          stage: "discovery",
          status: "approved",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
          approved_at: now,
          approval_note: "User approved",
        },
        goal: {
          stage: "goal",
          status: "pending",
          criteria: [
            { description: "Success metrics defined", met: false },
            { description: "Scope boundaries set", met: false },
          ],
        },
      },
    },
  },
  {
    delay: 1000,
    type: "message",
    role: "assistant",
    content:
      "Gate approved! Moving to the Goal stage. I need to define what success looks like for this project. What matters most to you — speed, simplicity, or a full feature set?",
  },

  // --- User answers ---
  {
    delay: 3000,
    type: "message",
    role: "user",
    content: "Simplicity — I want something I can actually ship in a weekend",
  },

  // --- Goal tasks + worker ---
  {
    delay: 2000,
    type: "state",
    patch: {
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t3",
          name: "Define success criteria",
          stage: "goal",
          zone: "shared",
          persona: "analyst",
          status: "in_progress",
          worker_id: "w2",
          created_at: now,
          updated_at: now,
        },
      ],
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "idle",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 45,
          tokens: 3860,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w2",
          persona: "analyst",
          zone: "shared",
          status: "busy",
          task: "Define success criteria",
          task_id: "t3",
          uptime: 3,
          tokens: 620,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
    },
  },
  {
    delay: 2000,
    type: "message",
    role: "assistant",
    content:
      "Perfect. I've scoped the goal: a minimal CLI task manager with add, list, complete, and delete commands. SQLite backend, no TUI — just clean stdout. Shipping in a weekend means cutting the interactive mode.",
  },

  // --- Goal gate met ---
  {
    delay: 2000,
    type: "state",
    patch: {
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t3",
          name: "Define success criteria",
          stage: "goal",
          zone: "shared",
          persona: "analyst",
          status: "complete",
          worker_id: "w2",
          created_at: now,
          updated_at: now,
        },
      ],
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "idle",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 45,
          tokens: 3860,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w2",
          persona: "analyst",
          zone: "shared",
          status: "idle",
          task: "Define success criteria",
          task_id: "t3",
          uptime: 18,
          tokens: 2140,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
      gates: {
        discovery: {
          stage: "discovery",
          status: "approved",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
          approved_at: now,
          approval_note: "User approved",
        },
        goal: {
          stage: "goal",
          status: "approved",
          criteria: [
            { description: "Success metrics defined", met: true },
            { description: "Scope boundaries set", met: true },
          ],
          approved_at: now,
        },
      },
      tokens: {
        total_tokens: 6000,
        total_cost: 0.09,
        budget_limit: 5.0,
        budget_used: 0.09,
        budget_remaining: 4.91,
        sessions: [
          {
            worker_id: "w1",
            persona: "researcher",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 2540,
            output_tokens: 1320,
            total_tokens: 3860,
            estimated_cost_usd: 0.06,
          },
          {
            worker_id: "w2",
            persona: "analyst",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 1400,
            output_tokens: 740,
            total_tokens: 2140,
            estimated_cost_usd: 0.03,
          },
        ],
      },
      checkpoints: [
        {
          id: "cp1",
          stage: "discovery",
          created_at: now,
          task_count: 2,
          auto: false,
        },
        {
          id: "cp2",
          stage: "goal",
          created_at: now,
          task_count: 1,
          auto: false,
        },
      ],
    },
  },

  // --- Advance to requirements ---
  {
    delay: 1500,
    type: "state",
    patch: {
      stage: "requirements",
      gates: {
        discovery: {
          stage: "discovery",
          status: "approved",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
          approved_at: now,
          approval_note: "User approved",
        },
        goal: {
          stage: "goal",
          status: "approved",
          criteria: [
            { description: "Success metrics defined", met: true },
            { description: "Scope boundaries set", met: true },
          ],
          approved_at: now,
        },
        requirements: {
          stage: "requirements",
          status: "pending",
          criteria: [
            { description: "Functional requirements listed", met: false },
            { description: "Data model specified", met: false },
          ],
        },
      },
    },
  },
  {
    delay: 1500,
    type: "message",
    role: "assistant",
    content:
      "Now in the Requirements stage. I'm breaking down exactly what needs to be built — the commands, the data model, and the storage layer. A specs worker is drafting the requirements doc.",
  },

  // --- Requirements work ---
  {
    delay: 2500,
    type: "state",
    patch: {
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t3",
          name: "Define success criteria",
          stage: "goal",
          zone: "shared",
          persona: "analyst",
          status: "complete",
          worker_id: "w2",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t4",
          name: "Draft functional requirements",
          stage: "requirements",
          zone: "backend",
          persona: "specs",
          status: "in_progress",
          worker_id: "w3",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t5",
          name: "Define data model",
          stage: "requirements",
          zone: "database",
          persona: "specs",
          status: "pending",
          blocked_by: ["t4"],
          created_at: now,
          updated_at: now,
        },
      ],
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "idle",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 45,
          tokens: 3860,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w2",
          persona: "analyst",
          zone: "shared",
          status: "idle",
          task: "Define success criteria",
          task_id: "t3",
          uptime: 18,
          tokens: 2140,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w3",
          persona: "specs",
          zone: "backend",
          status: "busy",
          task: "Draft functional requirements",
          task_id: "t4",
          uptime: 5,
          tokens: 890,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
    },
  },
  {
    delay: 3000,
    type: "message",
    role: "assistant",
    content:
      "Requirements complete. Four commands: `task add`, `task list`, `task done <id>`, `task rm <id>`. SQLite storage with a single `tasks` table (id, title, status, created_at). Gate criteria met — advancing to Planning.",
  },

  // --- Requirements gate approved, advance to planning ---
  {
    delay: 1500,
    type: "state",
    patch: {
      stage: "planning",
      tasks: [
        {
          id: "t1",
          name: "Research CLI task managers",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t2",
          name: "Analyze Go CLI frameworks",
          stage: "discovery",
          zone: "shared",
          persona: "researcher",
          status: "complete",
          worker_id: "w1",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t3",
          name: "Define success criteria",
          stage: "goal",
          zone: "shared",
          persona: "analyst",
          status: "complete",
          worker_id: "w2",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t4",
          name: "Draft functional requirements",
          stage: "requirements",
          zone: "backend",
          persona: "specs",
          status: "complete",
          worker_id: "w3",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t5",
          name: "Define data model",
          stage: "requirements",
          zone: "database",
          persona: "specs",
          status: "complete",
          worker_id: "w3",
          created_at: now,
          updated_at: now,
        },
        {
          id: "t6",
          name: "Create implementation plan",
          stage: "planning",
          zone: "shared",
          persona: "architect",
          status: "in_progress",
          worker_id: "w4",
          created_at: now,
          updated_at: now,
        },
      ],
      workers: [
        {
          id: "w1",
          persona: "researcher",
          zone: "shared",
          status: "idle",
          task: "Research CLI task managers",
          task_id: "t1",
          uptime: 45,
          tokens: 3860,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w2",
          persona: "analyst",
          zone: "shared",
          status: "idle",
          task: "Define success criteria",
          task_id: "t3",
          uptime: 18,
          tokens: 2140,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w3",
          persona: "specs",
          zone: "backend",
          status: "idle",
          task: "Define data model",
          task_id: "t5",
          uptime: 32,
          tokens: 4210,
          model: "claude-sonnet-4-5-20250929",
        },
        {
          id: "w4",
          persona: "architect",
          zone: "shared",
          status: "busy",
          task: "Create implementation plan",
          task_id: "t6",
          uptime: 2,
          tokens: 450,
          model: "claude-sonnet-4-5-20250929",
        },
      ],
      gates: {
        discovery: {
          stage: "discovery",
          status: "approved",
          criteria: [
            { description: "Problem space documented", met: true },
            { description: "Existing solutions catalogued", met: true },
            { description: "Technical feasibility confirmed", met: true },
          ],
          approved_at: now,
          approval_note: "User approved",
        },
        goal: {
          stage: "goal",
          status: "approved",
          criteria: [
            { description: "Success metrics defined", met: true },
            { description: "Scope boundaries set", met: true },
          ],
          approved_at: now,
        },
        requirements: {
          stage: "requirements",
          status: "approved",
          criteria: [
            { description: "Functional requirements listed", met: true },
            { description: "Data model specified", met: true },
          ],
          approved_at: now,
        },
        planning: {
          stage: "planning",
          status: "pending",
          criteria: [
            { description: "Task breakdown created", met: false },
            { description: "Dependencies mapped", met: false },
          ],
        },
      },
      tokens: {
        total_tokens: 11460,
        total_cost: 0.17,
        budget_limit: 5.0,
        budget_used: 0.17,
        budget_remaining: 4.83,
        sessions: [
          {
            worker_id: "w1",
            persona: "researcher",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 2540,
            output_tokens: 1320,
            total_tokens: 3860,
            estimated_cost_usd: 0.06,
          },
          {
            worker_id: "w2",
            persona: "analyst",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 1400,
            output_tokens: 740,
            total_tokens: 2140,
            estimated_cost_usd: 0.03,
          },
          {
            worker_id: "w3",
            persona: "specs",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 2800,
            output_tokens: 1410,
            total_tokens: 4210,
            estimated_cost_usd: 0.06,
          },
          {
            worker_id: "w4",
            persona: "architect",
            model: "claude-sonnet-4-5-20250929",
            input_tokens: 300,
            output_tokens: 150,
            total_tokens: 450,
            estimated_cost_usd: 0.01,
          },
        ],
      },
      checkpoints: [
        {
          id: "cp1",
          stage: "discovery",
          created_at: now,
          task_count: 2,
          auto: false,
        },
        {
          id: "cp2",
          stage: "goal",
          created_at: now,
          task_count: 1,
          auto: false,
        },
        {
          id: "cp3",
          stage: "requirements",
          created_at: now,
          task_count: 2,
          auto: true,
        },
      ],
    },
  },
  {
    delay: 1500,
    type: "message",
    role: "assistant",
    content:
      "Now in Planning. The architect is mapping out the implementation — which packages, how to structure the code, and what order to build things in.",
  },

  // --- Final message ---
  {
    delay: 4000,
    type: "message",
    role: "assistant",
    content:
      "That's the DutyBound workflow! Each stage has quality gates that ensure nothing moves forward until criteria are met. Workers are spawned on demand, and every action is tracked with full provenance. Want to try it yourself?",
  },
];

export { INITIAL_STATE };
