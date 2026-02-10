"use client";

import { useState } from "react";
import { STAGES, STAGE_ICONS, type Stage } from "@/lib/mc/types";

interface StageOverrideDialogProps {
  currentStage: string;
  onConfirm: (
    stage: string,
    reason: string,
  ) => Promise<{ success: boolean; output?: string; error?: string }>;
  onCancel: () => void;
}

export function StageOverrideDialog({
  currentStage,
  onConfirm,
  onCancel,
}: StageOverrideDialogProps) {
  const [selectedStage, setSelectedStage] = useState<string>(currentStage);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIdx = STAGES.indexOf(currentStage as Stage);
  const selectedIdx = STAGES.indexOf(selectedStage as Stage);
  const isBackward = selectedIdx < currentIdx;
  const isSkipping = selectedIdx > currentIdx + 1;
  const isSame = selectedIdx === currentIdx;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await onConfirm(selectedStage, reason.trim());
      if (!result.success) {
        setError(result.error ?? "Override failed");
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Override failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0d0d15] p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-[#e8e4df] font-serif mb-1">
          Stage Override
        </h2>
        <p className="text-[11px] text-[#6b6560] font-mono mb-5">
          Override the current pipeline stage. This skips gate checks.
        </p>

        {/* Stage selector */}
        <label className="block text-[10px] text-[#6b6560] font-mono tracking-wider uppercase mb-1.5">
          Target Stage
        </label>
        <select
          value={selectedStage}
          onChange={(e) => {
            setSelectedStage(e.target.value);
            setError(null);
          }}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-[#e8e4df] font-mono focus:outline-none focus:border-[#c4b5a0]/40 mb-3 appearance-none cursor-pointer"
        >
          {STAGES.map((s) => (
            <option key={s} value={s} className="bg-[#0d0d15]">
              {STAGE_ICONS[s]} {s}
              {s === currentStage ? " (current)" : ""}
            </option>
          ))}
        </select>

        {/* Warnings */}
        {isBackward && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-400 font-mono mb-3">
            ⚠ Moving backward from {STAGE_ICONS[currentStage as Stage]}{" "}
            {currentStage} → {STAGE_ICONS[selectedStage as Stage]}{" "}
            {selectedStage}
          </div>
        )}
        {isSkipping && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-400 font-mono mb-3">
            ⚠ Skipping {selectedIdx - currentIdx - 1} stage
            {selectedIdx - currentIdx - 1 > 1 ? "s" : ""} forward — gates will
            be bypassed
          </div>
        )}

        {/* Reason */}
        <label className="block text-[10px] text-[#6b6560] font-mono tracking-wider uppercase mb-1.5">
          Reason <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError(null);
          }}
          placeholder="Why are you overriding the stage?"
          rows={3}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-[#e8e4df] font-mono placeholder:text-[#4a4540] focus:outline-none focus:border-[#c4b5a0]/40 mb-3 resize-none"
        />

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[11px] text-red-400 font-mono mb-3">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-[11px] font-mono text-[#6b6560] hover:text-[#e8e4df] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer bg-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || isSame}
            className="px-4 py-1.5 rounded-lg text-[11px] font-mono text-[#0d0d15] bg-[#c4b5a0] hover:bg-[#d4c5b0] transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Overriding…" : "Confirm Override"}
          </button>
        </div>
      </div>
    </div>
  );
}
