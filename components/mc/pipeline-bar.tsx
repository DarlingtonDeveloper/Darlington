import { STAGES, STAGE_ICONS, type Stage } from "@/lib/mc/types";
import type { GateCriteria } from "@/lib/mc/types";

interface PipelineBarProps {
  currentStage: string;
  gates: Record<string, GateCriteria>;
}

const STAGE_LABELS: Record<Stage, string> = {
  discovery: "DISC",
  goal: "GOAL",
  requirements: "REQS",
  planning: "PLAN",
  design: "DSGN",
  implement: "IMPL",
  verify: "VRFY",
  validate: "VALD",
  document: "DOCS",
  release: "RLSE",
};

export function PipelineBar({ currentStage, gates }: PipelineBarProps) {
  const currentIdx = STAGES.indexOf(currentStage as Stage);

  return (
    <div className="flex gap-0.5">
      {STAGES.map((stage, i) => {
        const isCurrent = i === currentIdx;
        const isComplete =
          i < currentIdx || gates[stage]?.status === "approved";
        const isFuture = i > currentIdx && !isComplete;

        return (
          <div
            key={stage}
            className={[
              "relative flex-1 h-9 rounded-md flex items-center justify-center gap-1 transition-all duration-300 cursor-default",
              isCurrent
                ? "bg-gradient-to-r from-[#c4b5a0]/20 to-[#c4b5a0]/10 border border-[#c4b5a0]/35"
                : isComplete
                  ? "bg-green-400/[0.06] border border-green-400/[0.12]"
                  : "bg-white/[0.02] border border-white/[0.04]",
            ].join(" ")}
          >
            {isCurrent && (
              <span className="absolute inset-0 rounded-md bg-[#c4b5a0]/5 animate-pulse" />
            )}
            <span
              className={[
                "relative z-10 font-mono text-[10px] tracking-wider uppercase whitespace-nowrap overflow-hidden text-ellipsis",
                isCurrent ? "font-semibold text-[#c4b5a0]" : "",
                isComplete ? "font-medium text-green-400" : "",
                isFuture ? "font-medium text-[#4a4540]" : "",
              ].join(" ")}
            >
              {isComplete ? "✓" : STAGE_ICONS[stage]}{" "}
              <span className="hidden sm:inline">{STAGE_LABELS[stage]}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
