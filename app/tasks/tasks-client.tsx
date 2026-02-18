"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { dummyTasks, type Task } from "@/lib/tasks/dummy-data";
import { TaskCard } from "@/components/tasks/task-card";

export default function TasksClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pickedTasks, setPickedTasks] = useState<Task[]>([]);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flyDirection, setFlyDirection] = useState<"left" | "right" | null>(
    null,
  );

  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const done = currentIndex >= dummyTasks.length;

  const commitSwipe = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating || done) return;
      setIsAnimating(true);
      setFlyDirection(direction);

      if (direction === "right") {
        setPickedTasks((prev) => [...prev, dummyTasks[currentIndex]]);
      }

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setDragX(0);
        setFlyDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [currentIndex, isAnimating, done],
  );

  const handleStart = useCallback(
    (clientX: number) => {
      if (isAnimating || done) return;
      setIsDragging(true);
      startX.current = clientX;
    },
    [isAnimating, done],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      setDragX(clientX - startX.current);
    },
    [isDragging],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragX) > 100) {
      commitSwipe(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  }, [isDragging, dragX, commitSwipe]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") commitSwipe("left");
      if (e.key === "ArrowRight") commitSwipe("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commitSwipe]);

  const getCardStyle = (offset: number): React.CSSProperties => {
    if (offset === 0) {
      const x =
        flyDirection === "left" ? -600 : flyDirection === "right" ? 600 : dragX;
      const rotate = flyDirection
        ? flyDirection === "left"
          ? -15
          : 15
        : dragX * 0.05;
      return {
        transform: `translateX(${x}px) rotate(${rotate}deg)`,
        transition:
          flyDirection || !isDragging
            ? "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            : "none",
        zIndex: 30,
        cursor: "grab",
      };
    }
    const scale = 1 - offset * 0.04;
    const y = offset * 8;
    return {
      transform: `scale(${scale}) translateY(${y}px)`,
      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      zIndex: 30 - offset,
      pointerEvents: "none" as const,
    };
  };

  if (done) {
    return (
      <div className="h-screen flex flex-col bg-[#07070e]">
        <header className="flex items-center px-5 pt-12 pb-4">
          <h1 className="text-lg font-[family-name:var(--font-sans)] font-medium text-[#e8e4df]">
            Task Picker
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-[#e8e4df] mb-2 mt-8">
              You picked {pickedTasks.length} task
              {pickedTasks.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-sm text-[#6b6560] font-[family-name:var(--font-sans)] mb-8">
              {dummyTasks.length - pickedTasks.length} skipped
            </p>

            <div className="space-y-3 mb-8">
              {pickedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <span
                    className={`text-[10px] font-[family-name:var(--font-mono)] font-medium px-2 py-0.5 rounded border ${
                      {
                        P0: "bg-red-500/20 text-red-400 border-red-500/30",
                        P1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                        P2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                        P3: "bg-[#c4b5a0]/20 text-[#c4b5a0] border-[#c4b5a0]/30",
                      }[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-sm text-[#e8e4df] font-[family-name:var(--font-sans)] flex-1">
                    {task.title}
                  </span>
                  <span className="text-xs text-[#6b6560] font-[family-name:var(--font-mono)]">
                    {task.effort}
                  </span>
                </div>
              ))}
            </div>

            {pickedTasks.length > 0 && (
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setPickedTasks([]);
                }}
                className="w-full py-4 rounded-xl bg-[#4ade80]/10 text-[#4ade80] text-sm font-medium font-[family-name:var(--font-sans)] border border-[#4ade80]/20 active:scale-[0.98] transition-transform"
              >
                Start Working
              </button>
            )}

            <button
              onClick={() => {
                setCurrentIndex(0);
                setPickedTasks([]);
              }}
              className="w-full py-4 mt-3 rounded-xl text-[#6b6560] text-sm font-[family-name:var(--font-sans)] active:scale-[0.98] transition-transform"
            >
              Reshuffle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#07070e]">
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 className="text-lg font-[family-name:var(--font-sans)] font-medium text-[#e8e4df]">
          Task Picker
        </h1>
        <span className="text-xs text-[#6b6560] font-[family-name:var(--font-mono)]">
          {currentIndex + 1} / {dummyTasks.length}
        </span>
      </header>

      <div
        ref={containerRef}
        className="flex-1 relative mx-5 mb-8"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => {
          if (isDragging) handleEnd();
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {[2, 1, 0].map((offset) => {
          const idx = currentIndex + offset;
          if (idx >= dummyTasks.length) return null;
          return (
            <TaskCard
              key={dummyTasks[idx].id}
              task={dummyTasks[idx]}
              style={getCardStyle(offset)}
              dragX={offset === 0 ? dragX : 0}
              isTop={offset === 0}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 pb-10 px-5">
        <button
          onClick={() => commitSwipe("left")}
          className="w-16 h-16 rounded-full border-2 border-red-400/30 flex items-center justify-center text-red-400 active:scale-90 transition-transform"
          aria-label="Skip task"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          onClick={() => commitSwipe("right")}
          className="w-16 h-16 rounded-full border-2 border-[#4ade80]/30 flex items-center justify-center text-[#4ade80] active:scale-90 transition-transform"
          aria-label="Pick task"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
