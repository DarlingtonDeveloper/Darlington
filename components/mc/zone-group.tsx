"use client";

import { useState } from "react";
import { Worker, ZONE_GLYPHS } from "@/lib/mc/types";
import { StatusDot } from "./status-dot";
import { Badge } from "./badge";
import { WorkerCard } from "./worker-card";

interface ZoneGroupProps {
  zone: string;
  workers: Worker[];
  defaultOpen: boolean;
  onKillWorker?: (id: string) => void;
}

export function ZoneGroup({
  zone,
  workers,
  defaultOpen,
  onKillWorker,
}: ZoneGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const busyCount = workers.filter((w) => w.status === "busy").length;
  const hasBusy = busyCount > 0;

  return (
    <div
      className={`overflow-hidden rounded-lg transition-all ${
        hasBusy
          ? "border border-[#c4b5a0]/[0.12] bg-[#c4b5a0]/[0.02]"
          : "border border-white/[0.04] bg-white/[0.01]"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 bg-transparent border-none px-2.5 py-[7px] text-[#e8e4df]"
      >
        <span
          className={`w-[18px] text-center font-mono text-xs font-bold ${
            hasBusy ? "text-[#c4b5a0]" : "text-[#4a4540]"
          }`}
        >
          {ZONE_GLYPHS[zone] || "◻"}
        </span>
        <span
          className={`font-mono text-[11px] font-semibold uppercase tracking-wide ${
            hasBusy ? "text-[#e8e4df]" : "text-[#6b6560]"
          }`}
        >
          {zone}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {hasBusy && <StatusDot status="busy" size={5} pulse />}
          <Badge variant={hasBusy ? "accent" : "default"}>
            {busyCount}/{workers.length}
          </Badge>
          <span
            className={`inline-block text-[10px] text-[#4a4540] transition-transform duration-150 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          >
            ▾
          </span>
        </div>
      </button>
      {open && (
        <div className="flex flex-col gap-1 px-2 pb-2">
          {workers.map((w) => (
            <WorkerCard key={w.id} worker={w} onKill={onKillWorker} />
          ))}
        </div>
      )}
    </div>
  );
}
